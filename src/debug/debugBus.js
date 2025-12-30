/**
 * File: debugBus.js
 * Path: src/debug/debugBus.js
 * Description: Global debug event bus for runtime logs including player + router events.
 */

const listeners = new Set();

// ------------------------------------------------------------
// Core log emitter
// ------------------------------------------------------------
export function debugLog(level, msg, data) {
  const entry = {
    level,
    msg: data ? `${msg} ${JSON.stringify(data)}` : msg,
    ts: Date.now()
  };

  // FIX: emit (level, entry)
  listeners.forEach((fn) => fn(level, entry));
}

// ------------------------------------------------------------
// Category helpers
// ------------------------------------------------------------
export function logPlayer(msg, data) {
  debugLog("PLAYER", msg, data);
}

export function logRouter(msg, data) {
  debugLog("ROUTER", msg, data);
}

export function logPerf(msg, data) {
  debugLog("PERF", msg, data);
}

export function logCmd(msg, data) {
  debugLog("CMD", msg, data);
}

export function logInfo(msg, data) {
  debugLog("INFO", msg, data);
}

export function logError(msg, data) {
  debugLog("ERROR", msg, data);
}

// ------------------------------------------------------------
// Subscription API (used by DebugOverlay)
// ------------------------------------------------------------
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function unsubscribe(fn) {
  listeners.delete(fn);
}

// ------------------------------------------------------------
// Unified debug bus
// ------------------------------------------------------------
export const debugBus = {
  log: debugLog,
  player: logPlayer,
  router: logRouter,
  perf: logPerf,
  cmd: logCmd,
  info: logInfo,
  error: logError,
  subscribe,
  unsubscribe
};
