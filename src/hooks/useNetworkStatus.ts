/**
 * Hook for monitoring network connectivity status
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import type { ConnectionStatus, NetworkStatusResult } from '../types';

export const useNetworkStatus = (): NetworkStatusResult => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const isFirstCheck = useRef(true);

  const handleNetworkChange = useCallback((state: NetInfoState) => {
    const connected = state.isConnected && state.isInternetReachable !== false;
    setConnectionStatus(connected ? 'connected' : 'disconnected');
    isFirstCheck.current = false;
  }, []);

  useEffect(() => {
    // Fetch initial state
    NetInfo.fetch().then(handleNetworkChange);

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [handleNetworkChange]);

  return {
    isConnected: connectionStatus === 'connected' || connectionStatus === 'unknown',
    connectionStatus,
  };
};

