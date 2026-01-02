/**
 * File: quotaTracker.js
 * Path: src/debug/quotaTracker.js
 * Description: Tracks ALL YouTube API calls (success + failure) per API key.
 */

import { debugBus } from "./debugBus.js";

// Tracks total units per key
const quota = {};

// Tracks total calls per key (success + failure)
const calls = {};

/**
 * Records a quota event for a key.
 * 
 * @param {string} key  - API key used
 * @param {object} info - { cost, status, ok, url, endpoint, reason }
 */
export function recordQuotaUsage(key, info = {}) {
  if (!key) return;

  const cost = info.cost ?? 1; // default cost = 1 unit

  // Initialize counters
  quota[key] = (quota[key] || 0) + cost;
  calls[key] = (calls[key] || 0) + 1;

  // Log full details
  debugBus.log(
    "NETWORK",
    `Quota → ${key} used ${cost} units (total=${quota[key]}, calls=${calls[key]})`,
    info
  );
}

/**
 * Returns a snapshot of quota + call counts.
 */
export function getQuotaSnapshot() {
  return {
    quota: { ...quota },
    calls: { ...calls }
  };
}
