/**
 * HomeScreen
 *
 * Main application screen containing the WebView and all overlay components.
 * Manages the complete lifecycle: splash → loading → ready/error.
 * Pull-to-refresh is supported on both Android (native WebView prop) and iOS
 * (ScrollView + RefreshControl wrapper).
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  RefreshControl,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import {
  SplashScreen,
  LoadingOverlay,
  ErrorScreen,
  OfflineBanner,
  InitialLoadingScreen,
  HeaderBar,
} from '../components';
import { useNetworkStatus, useWebView, useBackHandler } from '../hooks';
import { APP_URL, COLORS, USER_AGENT_SUFFIX, MIN_SPLASH_DURATION } from '../constants';
import type { AppState } from '../types';

// JavaScript to inject into the WebView for native-like behavior
const INJECTED_JAVASCRIPT = `
(function() {
  // Disable long-press context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  // Disable text selection on non-input elements
  var style = document.createElement('style');
  style.textContent = \`
    * {
      -webkit-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: auto;
      user-select: auto;
    }
    /* Improve scrolling feel */
    body {
      -webkit-overflow-scrolling: touch;
    }
    /* Hide scrollbar for cleaner look */
    ::-webkit-scrollbar {
      display: none;
    }
  \`;
  document.head.appendChild(style);

  // Report scroll position for pull-to-refresh
  var lastScrollY = 0;
  function reportScroll() {
    var y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if ((y <= 2 && lastScrollY > 2) || (y > 2 && lastScrollY <= 2)) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'scroll',
          offsetY: y
        }));
      }
    }
    lastScrollY = y;
  }
  window.addEventListener('scroll', reportScroll, { passive: true });

  // Detect logout: watch for navigation to login page
  var observer = new MutationObserver(function() {
    if (window.location.pathname.includes('/login')) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'navigation',
        url: window.location.href,
        isLoginPage: true
      }));
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Send page info to native
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'pageLoad',
    url: window.location.href,
    title: document.title
  }));

  // Override window.open to handle in WebView
  window.open = function(url) {
    if (url) {
      window.location.href = url;
    }
  };

  true;
})();
`;

export const HomeScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [appState, setAppState] = useState<AppState>('splash');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPullToRefreshEnabled, setIsPullToRefreshEnabled] = useState(true);

  const { isConnected, connectionStatus } = useNetworkStatus();
  const {
    webViewState,
    errorState,
    handleNavigationStateChange,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    handleError,
    handleHttpError,
    handleShouldStartLoadWithRequest,
    clearError,
  } = useWebView();

  // Handle back button navigation
  useBackHandler({
    canGoBack: webViewState.canGoBack,
    onGoBack: () => {
      webViewRef.current?.goBack();
    },
    enabled: appState === 'ready',
  });

  // Handle manual back button from HeaderBar
  const handleGoBack = useCallback(() => {
    if (webViewRef.current && webViewState.canGoBack) {
      webViewRef.current.goBack();
    }
  }, [webViewState.canGoBack]);

  // Handle Home navigation from HeaderBar
  const handleGoHome = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `window.location.href = '${APP_URL}'; true;`,
      );
    }
  }, []);

  // Handle splash screen completion
  const handleSplashFinish = useCallback(() => {
    setAppState('loading');
  }, []);

  // Handle scroll events to enable pull-to-refresh only at the top of the page
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = event.nativeEvent.contentOffset.y;
      setIsPullToRefreshEnabled(y <= 2);
    },
    [],
  );

  // Handle WebView load completion
  const onLoadEnd = useCallback(() => {
    handleLoadEnd();
    // Stop pull-to-refresh spinner when page finishes loading
    setIsRefreshing(false);
    setIsPullToRefreshEnabled(true);
    if (!hasLoadedOnce) {
      setHasLoadedOnce(true);
      // Small delay for smooth transition
      setTimeout(() => {
        setAppState('ready');
      }, 300);
    }
  }, [handleLoadEnd, hasLoadedOnce]);

  // Handle WebView errors
  const onError = useCallback(
    (syntheticEvent: { nativeEvent: { code: number; description: string } }) => {
      handleError(syntheticEvent);
      setIsRefreshing(false);
      setIsPullToRefreshEnabled(true);
      setAppState('error');
    },
    [handleError],
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    clearError();
    setAppState('loading');
    setHasLoadedOnce(false);
    webViewRef.current?.reload();
  }, [clearError]);

  // Handle pull-to-refresh — reload WebView and stop the spinner once load finishes
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    webViewRef.current?.reload();
    // Safety timeout to ensure spinner doesn't get stuck
    setTimeout(() => {
      setIsRefreshing(false);
    }, 8000);
  }, []);

  // Handle messages from WebView
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'scroll') {
        setIsPullToRefreshEnabled(data.offsetY <= 2);
      } else if (data.type === 'navigation' && data.isLoginPage) {
        // User was redirected to login (session expired)
        console.log('Session expired, on login page');
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  // Auto-retry when connection is restored
  useEffect(() => {
    if (isConnected && appState === 'error' && errorState?.type === 'noInternet') {
      handleRetry();
    }
  }, [isConnected, appState, errorState, handleRetry]);

  const showOfflineBanner =
    connectionStatus === 'disconnected' && appState === 'ready';

  // Shared WebView props for both platforms
  const webViewProps = {
    source: { uri: APP_URL } as { uri: string },
    style: styles.webView,
    // JavaScript & DOM
    javaScriptEnabled: true,
    domStorageEnabled: true,
    javaScriptCanOpenWindowsAutomatically: false,
    // Cookies and session
    sharedCookiesEnabled: true,
    thirdPartyCookiesEnabled: true,
    incognito: false,
    // Caching
    cacheEnabled: true,
    cacheMode: 'LOAD_DEFAULT' as const,
    // User agent
    applicationNameForUserAgent: USER_AGENT_SUFFIX,
    // Injected scripts
    injectedJavaScript: INJECTED_JAVASCRIPT,
    // Media
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
    allowsFullscreenVideo: true,
    // File handling
    allowFileAccess: true,
    allowFileAccessFromFileURLs: false,
    allowUniversalAccessFromFileURLs: false,
    // UI
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    overScrollMode: 'always' as const,
    contentInsetAdjustmentBehavior: 'never' as const,
    automaticallyAdjustContentInsets: false,
    // Keyboard
    keyboardDisplayRequiresUserAction: false,
    automaticallyAdjustsScrollIndicatorInsets: false,
    // Scrolling
    scrollEnabled: true,
    nestedScrollEnabled: false,
    // Security
    originWhitelist: ['https://*', 'http://*', 'tel:*', 'mailto:*', 'whatsapp:*'],
    mixedContentMode: 'compatibility' as const,
    // Events
    onNavigationStateChange: handleNavigationStateChange,
    onLoadStart: handleLoadStart,
    onLoadEnd: onLoadEnd,
    onLoadProgress: handleLoadProgress,
    onError: onError,
    onHttpError: handleHttpError,
    onShouldStartLoadWithRequest: handleShouldStartLoadWithRequest,
    onMessage: handleMessage,
    // Performance
    renderToHardwareTextureAndroid: true,
    startInLoadingState: false,
    setSupportMultipleWindows: false,
    textZoom: 100,
  };

  /**
   * Pull-to-refresh approach:
   * - Both Android and iOS are wrapped in ScrollView with RefreshControl.
   * - On Android, scrollEnabled is false so WebView handles vertical scrolls natively,
   *   while RefreshControl triggers when pulled down at the top of the page.
   * - isPullToRefreshEnabled disables the RefreshControl when the user is scrolled down,
   *   allowing smooth internal page scrolling.
   */
  const renderWebView = () => {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            enabled={isPullToRefreshEnabled}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.white}
          />
        }
        style={styles.scrollView}
        bounces={Platform.OS === 'ios'}
        scrollEnabled={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}
      >
        <WebView
          ref={webViewRef}
          {...webViewProps}
          bounces={false}
          onScroll={handleScroll}
        />
      </ScrollView>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.topSafeArea} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Top App Header Bar */}
        {appState !== 'splash' && (
          <HeaderBar
            canGoBack={webViewState.canGoBack}
            onGoBack={handleGoBack}
            onRefresh={handleRefresh}
            onGoHome={handleGoHome}
            isRefreshing={isRefreshing}
          />
        )}

      {/* WebView - always rendered but hidden during splash/error */}
      <View
        style={[
          styles.webViewContainer,
          (appState === 'splash' || appState === 'error') && styles.hidden,
        ]}
      >
        {renderWebView()}

        {/* Progress bar overlay */}
        <LoadingOverlay
          progress={webViewState.progress}
          isLoading={webViewState.isLoading && hasLoadedOnce}
        />
      </View>

      {/* Initial loading screen (first load) */}
      {appState === 'loading' && !hasLoadedOnce && (
        <InitialLoadingScreen progress={webViewState.progress} />
      )}

      {/* Error screen */}
      {appState === 'error' && errorState && (
        <ErrorScreen
          errorType={errorState.type}
          onRetry={handleRetry}
        />
      )}

      {/* Offline banner (shown when connection drops after initial load) */}
      <OfflineBanner isOffline={showOfflineBanner} />

      {/* Splash screen (highest z-index) */}
      {appState === 'splash' && (
        <SplashScreen
          onFinish={handleSplashFinish}
          duration={MIN_SPLASH_DURATION}
        />
      )}
    </SafeAreaView>
  </>
  );
};

const styles = StyleSheet.create({
  topSafeArea: {
    flex: 0,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webViewContainer: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

