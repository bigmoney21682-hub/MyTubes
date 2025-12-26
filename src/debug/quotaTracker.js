/**
 * File: quotaTracker.js
 * Path: src/debug/quotaTracker.js
 * Description: Tracks YouTube API quota usage locally.
 */

let unitsUsed = 0;
let lastKey = "UNKNOWN";
let quotaError = false;

// YouTube API documented costs
const COSTS = {
  "videos.list": 1,
  "search.list": 100,
  "channels.list": 1
};

export function recordCall(endpoint, keyLabel) {
  const cost = COSTS[endpoint] ?? 1;
  unitsUsed += cost;
  lastKey = keyLabel;
}

export function recordQuotaError() {
  quotaError = true;
}

export function getQuotaSummary() {
  if (quotaError) {
    return "[QUOTA] EXHAUSTED — quotaExceeded";
  }

  const remaining = 10000 - unitsUsed;
  return `[QUOTA] ${unitsUsed} used / ${remaining} left`;
}

export function getLastKeyUsed() {
  return lastKey;
}
