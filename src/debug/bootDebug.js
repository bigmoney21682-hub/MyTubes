/**
 * File: bootDebug.js
 * Path: src/debug/bootDebug.js
 * Description: Bridges public/debug-boot.js buffer into debugBus and
 *              defines runtime window.bootDebug with full category map.
 */

import { debugBus } from "./debugBus";

// Drain boot buffer (from public/debug-boot.js)
if (window.bootDebug?._buffer) {
  for (const entry of window.bootDebug._buffer) {
    debugBus.log(entry.level, entry.msg);
  }
}

// Helper to publish to debugBus
function emit(level, ...args) {
  debugBus.log(level, args.join(" "));
}

// Full category map (restored)
window.bootDebug = {
  // Boot + lifecycle
  boot: (...msg) => emit("BOOT", ...msg),
  main: (...msg) => emit("BOOT", ...msg),
  app: (...msg) => emit("BOOT", ...msg),

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
