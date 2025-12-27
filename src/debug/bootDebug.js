/**
 * File: bootDebug.js
 * Path: src/debug/bootDebug.js
 * Description: Bridges public/debug-boot.js buffer into debugBus and
 *              defines runtime window.bootDebug that publishes to debugBus.
 */

import { debugBus } from "./debugBus";

// Drain boot buffer (from public/debug-boot.js)
if (window.bootDebug?._buffer) {
  for (const entry of window.bootDebug._buffer) {
    debugBus.log(entry.level, entry.msg);
  }
}

// Replace bootDebug with runtime publisher
function emit(level, ...args) {
  debugBus.log(level, args.join(" "));
}

window.bootDebug = {
  log: (...msg) => emit("CONSOLE", ...msg),
  info: (...msg) => emit("INFO", ...msg),
  warn: (...msg) => emit("WARN", ...msg),
  error: (...msg) => emit("ERROR", ...msg),

  // Network
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

  // Quota
  quota: (...msg) => emit("CONSOLE", ...msg)
};

window.bootDebug.boot = (...msg) => emit("BOOT", ...msg);

window.bootDebug.boot("Runtime bootDebug initialized");
