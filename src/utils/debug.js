// File: src/utils/debug.js
// Centralized structured logging for the entire app

// Format timestamps like [5:12:03 AM]
function ts() {
  return new Date().toLocaleTimeString();
}

// Base logger
export function debugLog(message, category = "LOG") {
  const entry = `[${ts()}] [${category}] ${message}`;
  console.log(entry);
  window.debugLog?.(entry, category);
}

// API logger (start + end)
export function debugApi(url, status = "START") {
  const entry = `[${ts()}] [API] ${status} → ${url}`;
  console.log(entry);
  window.debugLog?.(entry, "API");
}

// Error logger
export function debugError(message, extra = "") {
  const entry = `[${ts()}] [ERROR] ${message} ${extra}`;
  console.error(entry);
  window.debugLog?.(entry, "ERROR");
}

// Player events
export function debugPlayer(message) {
  debugLog(message, "PLAYER");
}

// Router events
export function debugRouter(message) {
  debugLog(message, "ROUTER");
}

// ------------------------------------------------------------
// Fetch wrapper with automatic logging
// ------------------------------------------------------------
export async function debugFetch(url, opts = {}) {
  debugApi(url, "START");

  try {
    const res = await fetch(url, opts);

    if (!res.ok) {
      debugError(`API ERROR ${res.status}`, `url=${url}`);
    }

    debugApi(url, `END ${res.status}`);
    return res;
  } catch (err) {
    debugError(`FETCH EXCEPTION`, `${err.message} | url=${url}`);
    throw err;
  }
}
