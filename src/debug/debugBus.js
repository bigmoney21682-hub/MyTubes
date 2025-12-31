/**
 * File: debugBus.js
 * Path: src/debug/debugBus.js
 * Description: Central debug event bus. Stores all logs and notifies subscribers.
 */

const listeners = new Set();
const logs = [];

/**
 * Publish a log entry into the bus.
 * level: string (e.g. "NETWORK", "PLAYER", "ROUTER", "CONSOLE", etc.)
 * msg: string
 * data: optional metadata object
 */
function log(level, msg, data = null) {
  const entry = {
    level,
    msg,
    data,
    ts: Date.now()
  };

  logs.push(entry);

  // Notify all subscribers with the new entry and full log snapshot
  for (const fn of listeners) {
    try {
      fn(entry, logs);
    } catch (err) {
      // Never let a subscriber break the bus
      // eslint-disable-next-line no-console
      console.error("debugBus subscriber error:", err);
    }
  }
}

/**
 * Subscribe to log updates.
 * fn(entry, allLogs) is called for every new log.
 * Returns an unsubscribe function.
 */
function subscribe(fn) {
  listeners.add(fn);
  // Immediately send current logs so late subscribers see history
  if (logs.length > 0) {
    try {
      fn(null, logs);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("debugBus initial subscriber error:", err);
    }
  }
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Get a shallow copy of all logs.
 */
function getLogs() {
  return logs.slice();
}

export const debugBus = {
  log,
  subscribe,
  getLogs
};
