/**
 * File: debugStorage.js
 * Path: src/debug/debugStorage.js
 * Description: Persistent storage for debug overlay state (tab, collapsed, filters).
 */

const KEY = "debugOverlayState";

export function saveDebugState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function loadDebugState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
