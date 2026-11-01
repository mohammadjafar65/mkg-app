/**
 * Application constants
 */

/** Base URL for the WebView */
export const APP_URL = 'https://mkg.wecreatedesign.co/login/';

/** Base domain for internal link detection */
export const APP_DOMAIN = 'mkg.wecreatedesign.co';

/** App display name */
export const APP_NAME = 'Mansuri Khidmat Group';

/** Brand colors */
export const COLORS = {
  primary: '#1B5E20',
  primaryDark: '#0D3B13',
  primaryLight: '#4CAF50',
  accent: '#FF9800',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  error: '#D32F2F',
  errorLight: '#FFCDD2',
  border: '#E0E0E0',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: '#E8E8E8',
  success: '#4CAF50',
  warning: '#FF9800',
} as const;

/** Loading messages displayed during WebView load */
export const LOADING_MESSAGES = [
  'Loading...',
  'Preparing your experience...',
  'Almost there...',
  'Setting things up...',
] as const;

/** Error messages */
export const ERROR_MESSAGES = {
  noInternet: {
    title: 'No Internet Connection',
    message:
      'Please check your internet connection and try again.',
    icon: 'wifi-off' as const,
  },
  loadFailed: {
    title: 'Unable to Load',
    message:
      'Something went wrong while loading the page. Please try again.',
    icon: 'alert-circle' as const,
  },
  serverError: {
    title: 'Server Unavailable',
    message:
      'The server is temporarily unavailable. Please try again later.',
    icon: 'server-off' as const,
  },
  genericError: {
    title: 'Something Went Wrong',
    message:
      'An unexpected error occurred. Please try again.',
    icon: 'alert-triangle' as const,
  },
} as const;

/** WebView user agent suffix */
export const USER_AGENT_SUFFIX = 'MansuriKhidmatGroupApp/1.0';

/** URL schemes to open externally */
export const EXTERNAL_SCHEMES = [
  'tel:',
  'mailto:',
  'sms:',
  'whatsapp:',
  'intent:',
  'market:',
  'geo:',
  'maps:',
  'tg:',
] as const;

/** Timeout for page load (ms) */
export const PAGE_LOAD_TIMEOUT = 30000;

/** Minimum splash screen duration (ms) */
export const MIN_SPLASH_DURATION = 1500;

