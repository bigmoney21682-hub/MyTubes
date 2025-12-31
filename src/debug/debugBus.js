/**
 * File: debugBus.js
 * Path: src/debug/debugBus.js
 * Description: Central event bus for DebugOverlay v3.
 *              Provides color-coded, timestamped, normalized logs.
 */

class DebugBus {
  constructor() {
    this.subscribers = new Set();
  }

  /**
   * Subscribe to log events.
   */
  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  /**
   * Emit a normalized log entry.
   */
  log(level, msg, data = null) {
    const entry = {
      level: level.toUpperCase(),
      msg: typeof msg === "string" ? msg : JSON.stringify(msg),
      data,
      time: this._timestamp(),
      color: this._colorFor(level)
    };

    for (const fn of this.subscribers) {
      try {
        fn(entry);
      } catch (err) {
        console.error("DebugBus subscriber error:", err);
      }
    }

    // Also print to real console with color
    this._consoleOut(entry);
  }

  /**
   * Timestamp in HH:MM:SS format.
   */
  _timestamp() {
    const d = new Date();
    return d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  /**
   * Color per log level.
   */
  _colorFor(level) {
    switch (level.toUpperCase()) {
      case "BOOT":
        return "#0af";
      case "NETWORK":
        return "#0f0";
      case "PLAYER":
        return "#ff0";
      case "ROUTER":
        return "#f0f";
      case "FETCH":
        return "#0f8";
      case "RESPONSE":
        return "#0f8";
      case "ERROR":
        return "#f33";
      case "WARN":
        return "#fa0";
      default:
        return "#fff";
    }
  }

  /**
   * Pretty console output.
   */
  _consoleOut(entry) {
    const { level, msg, time, color } = entry;

    console.log(
      `%c[${time}] ${level}%c → ${msg}`,
      `color:${color}; font-weight:bold`,
      "color:#ccc"
    );
  }
}

export const debugBus = new DebugBus();
window.debugBus = debugBus;
