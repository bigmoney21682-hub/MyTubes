/**
 * File: debugBus.js
 * Path: src/debug/debugBus.js
 * Description:
 *   Central debug event bus.
 *   Stores all logs and notifies subscribers.
 *   Provides category helpers used across the entire app.
 */

const listeners = new Set();
const logs = [];

/* ------------------------------------------------------------
   Core emitter
------------------------------------------------------------- */
function emit(level, msg, data = null) {
  const entry = {
    level,
    msg,
    data,
    ts: Date.now()
  };

  logs.push(entry);

  for (const fn of listeners) {
    try {
      fn(entry, logs);
    } catch (err) {
      console.error("debugBus subscriber error:", err);
    }
  }
}

/* ------------------------------------------------------------
   Category helpers (REQUIRED by your app)
------------------------------------------------------------- */
function log(msg, data) {
  emit("LOG", msg, data);
}

function info(msg, data) {
  emit("INFO", msg, data);
}

function warn(msg, data) {
  emit("WARN", msg, data);
}

function error(msg, data) {
  emit("ERROR", msg, data);
}

function player(msg, data) {
  emit("PLAYER", msg, data);
}

function router(msg, data) {
  emit("ROUTER", msg, data);
}

function perf(msg, data) {
  emit("PERF", msg, data);
}

function cmd(msg, data) {
  emit("CMD", msg, data);
}

/* ------------------------------------------------------------
   Subscription API
------------------------------------------------------------- */
function subscribe(fn) {
  listeners.add(fn);

  // Send full history immediately to new subscribers
  if (logs.length > 0) {
    try {
      fn(null, logs);
    } catch (err) {
      console.error("debugBus initial subscriber error:", err);
    }
  }

  return () => listeners.delete(fn);
}

function getLogs() {
  return logs.slice();
}

/* ------------------------------------------------------------
   Export unified debug bus
------------------------------------------------------------- */
export const debugBus = {
  log,
  info,
  warn,
  error,
  player,
  router,
  perf,
  cmd,
  subscribe,
  getLogs
};
