/**
 * ErrorScreen Component
 *
 * Displays a native error screen when the WebView fails to load.
 * Shows different messages based on the error type.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { COLORS, ERROR_MESSAGES } from '../constants';
import type { ErrorType } from '../types';

interface ErrorScreenProps {
  errorType: ErrorType;
  onRetry: () => void;
}

const { width } = Dimensions.get('window');

const ICONS: Record<string, string> = {
  'wifi-off': '📡',
  'alert-circle': '⚠️',
  'server-off': '🔌',
  'alert-triangle': '❗',
};

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  errorType,
  onRetry,
}) => {
  const errorInfo = ERROR_MESSAGES[errorType];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {ICONS[errorInfo.icon] || '❗'}
          </Text>
        </View>

        <Text style={styles.title}>{errorInfo.title}</Text>
        <Text style={styles.message}>{errorInfo.message}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Retry loading"
          accessibilityHint="Tap to try loading the page again"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: width * 0.1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

