/**
 * LoadingOverlay Component
 *
 * Displays a smooth loading indicator over the WebView
 * while pages are loading. Shows a progress bar and optional message.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants';

interface LoadingOverlayProps {
  progress: number;
  isLoading: boolean;
}

const { width } = Dimensions.get('window');

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  progress,
  isLoading,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      // Fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate progress
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      // Complete the bar then fade out
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        progressAnim.setValue(0);
      });
    }
  }, [isLoading, progress, progressAnim, opacityAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, width],
            }),
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  progressBar: {
    height: 3,
    backgroundColor: COLORS.primaryLight,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});

