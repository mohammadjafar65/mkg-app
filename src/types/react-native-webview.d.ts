import * as React from 'react';
import type {
  IOSWebViewProps,
  AndroidWebViewProps,
  WindowsWebViewProps,
  WebViewNavigation,
  WebViewMessageEvent,
  FileDownload,
} from 'react-native-webview/lib/WebViewTypes';

declare module 'react-native-webview' {
  export type WebViewProps = IOSWebViewProps &
    AndroidWebViewProps &
    WindowsWebViewProps & {
      // Pull to refresh is supported on android/ios
      pullToRefreshEnabled?: boolean;
    };

  export { WebViewNavigation, WebViewMessageEvent, FileDownload };

  export class WebView extends React.Component<WebViewProps> {
    goBack: () => void;
    goForward: () => void;
    reload: () => void;
    stopLoading(): void;
    injectJavaScript: (script: string) => void;
    requestFocus: () => void;
    postMessage: (message: string) => void;
    clearFormData?: () => void;
    clearCache: (includeDiskFiles: boolean) => void;
    clearHistory?: () => void;
  }

  export default WebView;
}

