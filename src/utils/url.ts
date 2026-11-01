/**
 * Utility functions for URL handling and navigation
 */

import { Linking, Platform } from 'react-native';
import { APP_DOMAIN, EXTERNAL_SCHEMES } from '../constants';

/**
 * Check if a URL is internal (belongs to our app domain)
 */
export const isInternalUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === APP_DOMAIN || parsedUrl.hostname.endsWith(`.${APP_DOMAIN}`);
  } catch {
    return false;
  }
};

/**
 * Check if a URL uses an external scheme (tel:, mailto:, etc.)
 */
export const isExternalScheme = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return EXTERNAL_SCHEMES.some(scheme => lowerUrl.startsWith(scheme));
};

/**
 * Check if a URL is a WhatsApp link
 */
export const isWhatsAppLink = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.startsWith('whatsapp:') ||
    lowerUrl.includes('wa.me') ||
    lowerUrl.includes('api.whatsapp.com')
  );
};

/**
 * Check if a URL should be opened externally
 */
export const shouldOpenExternally = (url: string): boolean => {
  if (isExternalScheme(url)) {
    return true;
  }
  if (isWhatsAppLink(url)) {
    return true;
  }
  if (!isInternalUrl(url) && (url.startsWith('http://') || url.startsWith('https://'))) {
    return true;
  }
  return false;
};

/**
 * Open a URL externally using the device's default handler
 */
export const openExternalUrl = async (url: string): Promise<boolean> => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    // Fallback: try opening anyway (some schemes may not report canOpenURL correctly)
    if (Platform.OS === 'android') {
      await Linking.openURL(url);
      return true;
    }

    return false;
  } catch (error) {
    console.warn('Failed to open external URL:', url, error);
    return false;
  }
};

/**
 * Extract a clean domain from a URL for display
 */
export const getDomain = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return url;
  }
};

