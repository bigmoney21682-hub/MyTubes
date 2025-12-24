// File: src/hooks/useSubscriptions.js
// PCC v1.0 — Local subscription manager

export function useSubscriptions() {
  const key = "mytube_subscriptions";

  const getSubs = () => {
    return JSON.parse(localStorage.getItem(key) || "[]");
  };

  const saveSubs = (subs) => {
    localStorage.setItem(key, JSON.stringify(subs));
  };

  const subscribe = (channel) => {
    const subs = getSubs();
    if (!subs.find((c) => c.channelId === channel.channelId)) {
      subs.push(channel);
      saveSubs(subs);
    }
  };

  const unsubscribe = (channelId) => {
    const subs = getSubs().filter((c) => c.channelId !== channelId);
    saveSubs(subs);
  };

  const isSubscribed = (channelId) => {
    return getSubs().some((c) => c.channelId === channelId);
  };

  return { getSubs, subscribe, unsubscribe, isSubscribed };
}
