import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';
import * as SecureStore from 'expo-secure-store';

export function useAppUpdates() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const {
    isUpdateAvailable = false,
    isUpdatePending = false,
    isDownloading = false,
    isChecking = false,
  } = Updates.useUpdates();

  // When an update is pending (downloaded and ready to apply), show the modal
  useEffect(() => {
    if (isUpdatePending && !hasDismissed) {
      setModalVisible(true);
    }
  }, [isUpdatePending, hasDismissed]);

  // If an update is available on the server but not yet downloaded, fetch it automatically
  useEffect(() => {
    if (isUpdateAvailable && !isUpdatePending && !isDownloading) {
      if (!__DEV__ && Updates.isEnabled) {
        Updates.fetchUpdateAsync().catch((err) => {
          console.warn('[useAppUpdates] Error fetching update in background:', err);
        });
      }
    }
  }, [isUpdateAvailable, isUpdatePending, isDownloading]);

  // Check for updates from EAS server
  const checkForUpdates = useCallback(async () => {
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }
    try {
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        const fetchResult = await Updates.fetchUpdateAsync();
        if (fetchResult.isNew && isMountedRef.current && !hasDismissed) {
          setModalVisible(true);
        }
      }
    } catch (err) {
      console.log('[useAppUpdates] Update check skipped or failed:', err?.message || err);
    }
  }, [hasDismissed]);

  // Check on mount and whenever returning to foreground
  useEffect(() => {
    checkForUpdates();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkForUpdates();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkForUpdates]);

  // Reload the app JS engine with the newly downloaded update bundle
  const reloadApp = useCallback(async () => {
    setIsRestarting(true);
    try {
      try {
        await SecureStore.deleteItemAsync('customer_selected_pharmacy_id');
      } catch (_) {}

      if (!__DEV__ && Updates.isEnabled) {
        await Updates.reloadAsync();
      } else {
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsRestarting(false);
            setModalVisible(false);
          }
        }, 1200);
      }
    } catch (err) {
      console.error('[useAppUpdates] Failed to reload app:', err);
      if (isMountedRef.current) {
        setIsRestarting(false);
      }
    }
  }, []);

  const dismissModal = useCallback(() => {
    setModalVisible(false);
    setHasDismissed(true);
  }, []);

  return {
    modalVisible,
    isRestarting,
    isUpdatePending: !!isUpdatePending,
    isDownloading: !!isDownloading,
    isChecking: !!isChecking,
    checkForUpdates,
    reloadApp,
    dismissModal,
    setModalVisible,
  };
}

