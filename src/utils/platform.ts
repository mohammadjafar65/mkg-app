/**
 * Platform-specific utilities
 */

import { Platform, StatusBar, Dimensions } from 'react-native';

/**
 * Get the status bar height for the current platform
 */
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    const { height } = Dimensions.get('window');
    // Detect notched iPhones
    if (height >= 812) {
      return 44;
    }
    return 20;
  }
  return StatusBar.currentHeight || 0;
};

/**
 * Check if the device has a notch
 */
export const hasNotch = (): boolean => {
  if (Platform.OS === 'ios') {
    const { height, width } = Dimensions.get('window');
    return (
      height >= 812 ||
      width >= 812
    );
  }
  return false;
};

/**
 * Get the screen dimensions
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Check if running on Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Check if running on iOS
 */
export const isIOS = Platform.OS === 'ios';

