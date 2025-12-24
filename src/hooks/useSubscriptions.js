// File: src/hooks/useSubscriptions.js
// PCC v2.0 — Crash-proof local subscription manager with auto-repair + debug logging

export function useSubscriptions() {
  const key = "mytube_subscriptions";

  // ------------------------------------------------------------
  // Safe JSON loader with auto-repair
  // ------------------------------------------------------------
  const loadSafe = () => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      return parsed;
    } catch (err) {
      window.debugLog?.(
        `Subscriptions: Corrupted data detected — resetting (${err.message})`,
        "ERROR"
      );
      localStorage.setItem(key, "[]");
      return [];
    }
  };

  const saveSafe = (subs) => {
    try {
      localStorage.setItem(key, JSON.stringify(subs));
    } catch (err) {
      window.debugLog?.(
        `Subscriptions: Failed to save (${err.message})`,
        "ERROR"
      );
    }
  };

  // ------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------
  const getSubs = () => loadSafe();

  const subscribe = (channel) => {
    const subs = loadSafe();
    if (!subs.find((c) => c.channelId === channel.channelId)) {
      subs.push(channel);
      saveSafe(subs);
      window.debugLog?.(
        `Subscriptions: Added ${channel.channelId}`,
        "UI"
      );
    }
  };

  const unsubscribe = (channelId) => {
    const subs = loadSafe().filter((c) => c.channelId !== channelId);
    saveSafe(subs);
    window.debugLog?.(
      `Subscriptions: Removed ${channelId}`,
      "UI"
    );
  };

  const isSubscribed = (channelId) => {
    return loadSafe().some((c) => c.channelId === channelId);
  };

  return { getSubs, subscribe, unsubscribe, isSubscribed };
}
