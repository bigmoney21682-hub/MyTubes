/**
 * File: quotaTracker.js
 * Path: src/debug/quotaTracker.js
 * Description: Tracks YouTube API quota usage per API key.
 */

import { debugBus } from "./debugBus.js";

const quota = {};

export function recordQuotaUsage(key, cost) {
  if (!key) return;

  quota[key] = (quota[key] || 0) + cost;

  debugBus.log(
    "NETWORK",
    `Quota → ${key} used ${cost} units (total=${quota[key]})`
  );
}

export function getQuotaSnapshot() {
  return { ...quota };
}
