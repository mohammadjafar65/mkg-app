/**
 * HeaderBar Component
 *
 * Top navigation bar displayed on the Home screen.
 * Contains the brand emblem logo, app title, back navigation,
 * home shortcut, and page refresh button.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { COLORS, APP_NAME } from '../constants';

interface HeaderBarProps {
  canGoBack: boolean;
  onGoBack: () => void;
  onRefresh: () => void;
  onGoHome?: () => void;
  isRefreshing?: boolean;
  title?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  canGoBack,
  onGoBack,
  onRefresh,
  onGoHome,
  isRefreshing = false,
  title = APP_NAME,
}) => {
  return (
    <View style={styles.header}>
      {/* Left side: Back button (if can go back) + Logo & Title */}
      <View style={styles.leftContainer}>
        {canGoBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onGoBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.chevron} />
          </TouchableOpacity>
        )}

        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right side: Home and Refresh action buttons */}
      <View style={styles.rightContainer}>
        {onGoHome && canGoBack && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onGoHome}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.homeIcon}>⌂</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRefresh}
          disabled={isRefreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh page"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 54,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    zIndex: 90,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    width: 11,
    height: 11,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: COLORS.white,
    transform: [{ rotate: '45deg' }],
  },
  logo: {
    width: 34,
    height: 34,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  homeIcon: {
    fontSize: 22,
    color: COLORS.white,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  refreshIcon: {
    fontSize: 22,
    color: COLORS.white,
    fontWeight: 'bold',
    lineHeight: 24,
    textAlign: 'center',
  },
});

