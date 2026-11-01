/**
 * InitialLoadingScreen Component
 *
 * Displayed while the WebView is loading for the first time.
 * Shows a branded loading experience with animated indicators.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { COLORS, APP_NAME } from '../constants';

interface InitialLoadingScreenProps {
  progress: number;
}

const { width } = Dimensions.get('window');

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({
  progress,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressBarAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Fade out when fully loaded
    if (progress >= 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [progress, progressBarAnim, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>MKG</Text>
        </View>
        <Text style={styles.title}>{APP_NAME}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.spinner}
        />
        <Text style={styles.loadingText}>Loading your experience...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 80,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: (width * 0.2) / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconText: {
    fontSize: width * 0.055,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 30,
  },
  progressContainer: {
    width: width * 0.6,
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  spinner: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

