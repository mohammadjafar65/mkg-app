/**
 * Hook for managing WebView state, navigation, and error handling
 */

import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { shouldOpenExternally, openExternalUrl, isInternalUrl } from '../utils/url';
import { APP_URL } from '../constants';
import type { WebViewLoadingState, ErrorState, UseWebViewResult } from '../types';

const initialLoadingState: WebViewLoadingState = {
  isLoading: true,
  progress: 0,
  canGoBack: false,
  canGoForward: false,
  currentUrl: APP_URL,
};

export const useWebView = (): UseWebViewResult => {
  const [webViewState, setWebViewState] = useState<WebViewLoadingState>(initialLoadingState);
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setWebViewState(prev => ({
      ...prev,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
      currentUrl: navState.url || prev.currentUrl,
      isLoading: navState.loading ?? prev.isLoading,
    }));
  }, []);

  const handleLoadStart = useCallback(() => {
    setWebViewState(prev => ({ ...prev, isLoading: true, progress: 0 }));
    setErrorState(null);
    clearLoadTimeout();
  }, [clearLoadTimeout]);

  const handleLoadEnd = useCallback(() => {
    setWebViewState(prev => ({ ...prev, isLoading: false, progress: 1 }));
    clearLoadTimeout();
  }, [clearLoadTimeout]);

  const handleLoadProgress = useCallback(
    (event: { nativeEvent: { progress: number } }) => {
      setWebViewState(prev => ({
        ...prev,
        progress: event.nativeEvent.progress,
      }));
    },
    [],
  );

  const handleError = useCallback(
    (syntheticEvent: { nativeEvent: { code: number; description: string } }) => {
      const { code, description } = syntheticEvent.nativeEvent;
      console.warn('WebView error:', code, description);

      clearLoadTimeout();
      setWebViewState(prev => ({ ...prev, isLoading: false }));

      // Check for network-related errors
      if (
        code === -2 || // ERR_CONNECTION_FAILED
        code === -6 || // ERR_CONNECTION_REFUSED
        code === -7 || // ERR_CONNECTION_TIMED_OUT
        code === -8 || // ERR_CONNECTION_RESET
        code === -9 || // ERR_INTERNET_DISCONNECTED
        description?.includes('net::ERR_INTERNET_DISCONNECTED') ||
        description?.includes('net::ERR_NAME_NOT_RESOLVED') ||
        description?.includes('NSURLErrorNotConnectedToInternet')
      ) {
        setErrorState({ type: 'noInternet', code, description });
      } else if (
        description?.includes('net::ERR_CONNECTION_REFUSED') ||
        description?.includes('net::ERR_CONNECTION_TIMED_OUT')
      ) {
        setErrorState({ type: 'serverError', code, description });
      } else {
        setErrorState({ type: 'loadFailed', code, description });
      }
    },
    [clearLoadTimeout],
  );

  const handleHttpError = useCallback(
    (syntheticEvent: {
      nativeEvent: { statusCode: number; description: string; url: string };
    }) => {
      const { statusCode, description } = syntheticEvent.nativeEvent;
      console.warn('HTTP error:', statusCode, description);

      if (statusCode >= 500) {
        setErrorState({ type: 'serverError', code: statusCode, description });
        setWebViewState(prev => ({ ...prev, isLoading: false }));
      } else if (statusCode === 404) {
        // For 404s we let the website handle it
        setWebViewState(prev => ({ ...prev, isLoading: false }));
      } else if (statusCode === 401 || statusCode === 403) {
        // Session expired or forbidden - the website should redirect to login
        setWebViewState(prev => ({ ...prev, isLoading: false }));
      }
    },
    [],
  );

  const handleShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation): boolean => {
      const { url } = request;

      // Allow about:blank and javascript: URLs
      if (url === 'about:blank' || url.startsWith('javascript:')) {
        return true;
      }

      // Check if URL should be opened externally
      if (shouldOpenExternally(url)) {
        openExternalUrl(url).then(opened => {
          if (!opened) {
            Alert.alert(
              'Cannot Open Link',
              'Unable to open this link. Please try again later.',
              [{ text: 'OK' }],
            );
          }
        });
        return false;
      }

      // Allow internal URLs to load in WebView
      if (isInternalUrl(url)) {
        return true;
      }

      // Default: allow the request
      return true;
    },
    [],
  );

  const clearError = useCallback(() => {
    setErrorState(null);
    setWebViewState(prev => ({ ...prev, isLoading: true, progress: 0 }));
  }, []);

  const setCanGoBack = useCallback((value: boolean) => {
    setWebViewState(prev => ({ ...prev, canGoBack: value }));
  }, []);

  return {
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
    setCanGoBack,
  };
};

