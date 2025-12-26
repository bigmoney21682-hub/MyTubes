// src/debug/useDebug.js
import { debugLog } from "./debugBus";

export function useDebug() {
  return {
    log: (msg, data) => debugLog("LOG", msg, data),
    error: (msg, data) => debugLog("ERROR", msg, data),
    api: (msg, data) => debugLog("API", msg, data),
    player: (msg, data) => debugLog("PLAYER", msg, data),
    router: (msg, data) => debugLog("ROUTER", msg, data),
    ui: (msg, data) => debugLog("UI", msg, data)
  };
}
