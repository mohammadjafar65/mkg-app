/**
 * TypeScript type definitions for the application
 */

import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';

/** Network connection status */
export type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';

/** Error screen type */
export type ErrorType = 'noInternet' | 'loadFailed' | 'serverError' | 'genericError';

/** App loading state */
export type AppState = 'splash' | 'loading' | 'ready' | 'error';

/** WebView loading state */
export interface WebViewLoadingState {
  isLoading: boolean;
  progress: number;
  canGoBack: boolean;
  canGoForward: boolean;
  currentUrl: string;
}

/** Error state */
export interface ErrorState {
  type: ErrorType;
  code?: number;
  description?: string;
}

/** Navigation request info */
export interface NavigationRequest {
  url: string;
  isExternal: boolean;
  scheme: string;
}

/** WebView ref methods we expose */
export interface WebViewActions {
  reload: () => void;
  goBack: () => void;
  goForward: () => void;
  injectJavaScript: (script: string) => void;
}

/** Hook return type for useNetworkStatus */
export interface NetworkStatusResult {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
}

/** Hook return type for useWebView */
export interface UseWebViewResult {
  webViewState: WebViewLoadingState;
  errorState: ErrorState | null;
  handleNavigationStateChange: (navState: WebViewNavigation) => void;
  handleLoadStart: () => void;
  handleLoadEnd: () => void;
  handleLoadProgress: (event: { nativeEvent: { progress: number } }) => void;
  handleError: (syntheticEvent: { nativeEvent: { code: number; description: string } }) => void;
  handleHttpError: (syntheticEvent: { nativeEvent: { statusCode: number; description: string; url: string } }) => void;
  handleShouldStartLoadWithRequest: (request: WebViewNavigation) => boolean;
  clearError: () => void;
  setCanGoBack: (value: boolean) => void;
}

