import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION_MS = 2400;

export function useToast() {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
  });
  const timeoutRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearTimer();
    setToast((prev) => ({ ...prev, visible: false }));
  }, [clearTimer]);

  const showToast = useCallback((message, type = 'info', duration = DEFAULT_DURATION_MS) => {
    clearTimer();

    setToast({
      visible: true,
      message,
      type,
    });

    timeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      timeoutRef.current = null;
    }, duration);
  }, [clearTimer]);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    hideToast,
  };
}
