/**
 * File: bootDebug.js
 * Path: src/debug/bootDebug.js
 * Description: Bridges any pre-boot buffer into debugBus and
 *              defines runtime window.bootDebug with full category map.
 */

import { debugBus } from "./debugBus.js";

// ------------------------------------------------------------
// Drain any existing boot buffer (from public/debug-boot.js)
// ------------------------------------------------------------
if (window.bootDebug?._buffer && Array.isArray(window.bootDebug._buffer)) {
  for (const entry of window.bootDebug._buffer) {
    if (entry && typeof entry === "object") {
      debugBus.log(entry.level || "BOOT", entry.msg || "", entry.data || null);
    } else if (typeof entry === "string") {
      debugBus.log("BOOT", entry);
    }
  }
}

// ------------------------------------------------------------
// Helper to publish to debugBus
// ------------------------------------------------------------
function emit(level, ...args) {
  const msg = args.join(" ");
  debugBus.log(level, msg);
}

// ------------------------------------------------------------
// Full category map (runtime)
// ------------------------------------------------------------
window.bootDebug = {
  // Boot + lifecycle
  boot: (...msg) => emit("BOOT", ...msg),
  main: (...msg) => emit("BOOT", ...msg),
  app: (...msg) => emit("BOOT", ...msg),

  // Signal that the app is ready so the boot overlay can dismiss
  ready: (...msg) => {
    emit("BOOT", ...(msg.length ? msg : ["App ready"]));
    window.__BOOT_READY = true; // For public/debug-boot.js overlay
  },

  // Page-level logs
  home: (...msg) => emit("ROUTER", ...msg),
  watch: (...msg) => emit("ROUTER", ...msg),
  search: (...msg) => emit("ROUTER", ...msg),

  // Network / API
  api: (...msg) => emit("NETWORK", ...msg),
  net: (...msg) => emit("NETWORK", ...msg),

  // Player
  player: (...msg) => emit("PLAYER", ...msg),

  // Router
  router: (...msg) => emit("ROUTER", ...msg),

  // Perf
  perf: (...msg) => emit("PERF", ...msg),

  // Commands
  cmd: (...msg) => emit("CMD", ...msg),

  // Console-level
  log: (...msg) => emit("CONSOLE", ...msg),
  info: (...msg) => emit("INFO", ...msg),
  warn: (...msg) => emit("WARN", ...msg),
  error: (...msg) => emit("ERROR", ...msg),

  // Quota
  quota: (...msg) => emit("CONSOLE", ...msg)
};

// Confirm runtime logger is active
window.bootDebug.boot("Runtime bootDebug initialized");
