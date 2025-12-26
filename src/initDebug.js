// File: src/initDebug.js
// Initializes global debug hooks BEFORE React mounts.
// Safe, silent, and guaranteed not to break boot.

import { debugLog as coreLog, debugApi as coreApi } from "./utils/debug";

// Ensure global namespace exists
if (typeof window !== "undefined") {
  // Global log collector (DebugOverlay reads this)
  if (!window.__debugEntries) {
    window.__debugEntries = [];
  }

  // ------------------------------------------------------------
  // Global debugLog(message, category)
  // ------------------------------------------------------------
  window.debugLog = (message, category = "LOG") => {
    try {
      // Push into global buffer for DebugOverlay
      window.__debugEntries.push({
        ts: Date.now(),
        category,
        message,
      });

      // Forward to centralized logger
      coreLog(message, category);
    } catch (err) {
      // Never break boot
      console.warn("debugLog error:", err);
    }
  };

  // ------------------------------------------------------------
  // Global debugApi(endpoint, label)
  // ------------------------------------------------------------
  window.debugApi = (endpoint, label = "") => {
    try {
      window.__debugEntries.push({
        ts: Date.now(),
        category: "API",
        message: `${endpoint} ${label}`,
      });

      coreApi(endpoint, label);
    } catch (err) {
      console.warn("debugApi error:", err);
    }
  };

  // ------------------------------------------------------------
  // Optional: fatal error collector
  // ------------------------------------------------------------
  if (!window.__fatalErrors) {
    window.__fatalErrors = [];
  }

  window.debugFatal = (err) => {
    try {
      window.__fatalErrors.push({
        ts: Date.now(),
        error: err?.message || String(err),
      });

      coreLog(`FATAL: ${err?.message || err}`, "ERROR");
    } catch (_) {}
  };
}
