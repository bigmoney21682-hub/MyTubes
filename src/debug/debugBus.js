/**
 * File: debugBus.js
 * Path: src/debug/debugBus.js
 * Description: Global debug event bus for runtime logs including player + router events.
 */

const listeners = new Set();

export function debugLog(level, msg, data) {
  const entry = {
    level,
    msg: data ? `${msg} ${JSON.stringify(data)}` : msg,
    ts: Date.now()
  };

  listeners.forEach((fn) => fn(entry));
}

export function logPlayer(msg, data) {
  debugLog("PLAYER", msg, data);
}

export function logRouter(msg, data) {
  debugLog("ROUTER", msg, data);
}

export function subscribeToDebugBus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
