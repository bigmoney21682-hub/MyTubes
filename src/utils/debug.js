// File: src/utils/debug.js
// Centralized logging helpers that preserve existing DebugOverlay behavior.

export function debugLog(message, category = "LOG") {
  // Console for dev tools
  if (category === "ERROR") {
    console.error(`[${category}] ${message}`);
  } else {
    console.log(`[${category}] ${message}`);
  }

  // Forward to existing global logger if present (DebugOverlay)
  if (typeof window !== "undefined" && window.debugLog) {
    window.debugLog(message, category);
  }
}

export function debugApi(endpoint, label) {
  console.log(`[API] ${endpoint} ${label !== undefined ? `(${label})` : ""}`);

  if (typeof window !== "undefined" && window.debugApi) {
    window.debugApi(endpoint, label);
  }
}

export function debugError(message) {
  debugLog(message, "ERROR");
}

export function debugPlayer(message) {
  debugLog(message, "PLAYER");
}

export function debugRouter(message) {
  debugLog(message, "ROUTER");
}

// Optional fetch helper: logs to console only (no quota side effects)
export async function debugFetch(url, options) {
  console.log(`[API] FETCH → ${url}`);
  const res = await fetch(url, options);
  console.log(`[API] RESPONSE ${res.status} ← ${url}`);
  return res;
}
