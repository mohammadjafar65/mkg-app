/**
 * Hook for managing Android hardware back button behavior
 */

import { useEffect, useCallback } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';

interface UseBackHandlerOptions {
  canGoBack: boolean;
  onGoBack: () => void;
  enabled?: boolean;
}

export const useBackHandler = ({ canGoBack, onGoBack, enabled = true }: UseBackHandlerOptions) => {
  const lastBackPressRef = { current: 0 };

  const handleBackPress = useCallback((): boolean => {
    if (!enabled) {
      return false;
    }

    if (canGoBack) {
      onGoBack();
      return true; // Prevent default back behavior
    }

    // Double-tap to exit
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      BackHandler.exitApp();
      return true;
    }

    lastBackPressRef.current = now;

    if (Platform.OS === 'android') {
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
    }

    return true; // Prevent default back behavior
  }, [canGoBack, onGoBack, enabled]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      subscription.remove();
    };
  }, [handleBackPress]);
};

