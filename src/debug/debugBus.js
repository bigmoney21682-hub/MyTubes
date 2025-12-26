/**
 * File: debugBus.js
 * Path: src/debug/debugBus.js
 * Description: Global debug event bus for runtime logs.
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

export function subscribeToDebugBus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
