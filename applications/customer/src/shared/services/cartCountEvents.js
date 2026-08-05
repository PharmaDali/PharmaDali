const cartCountListeners = new Set();

export function subscribeCartCountUpdates(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  cartCountListeners.add(listener);

  return () => {
    cartCountListeners.delete(listener);
  };
}

export function notifyCartCountUpdated(event) {
  for (const listener of cartCountListeners) {
    try {
      listener(event);
    } catch {
      // Ignore listener errors so one failure does not block other subscribers.
    }
  }
}
