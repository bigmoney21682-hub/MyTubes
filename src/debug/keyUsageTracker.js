/**
 * File: keyUsageTracker.js
 * Path: src/debug/keyUsageTracker.js
 * Description: Tracks how many times each API key is used.
 */

import { debugBus } from "./debugBus.js";

const usage = {};

export function recordKeyUsage(key, label) {
  if (!key) return;

  usage[key] = (usage[key] || 0) + 1;

  debugBus.log(
    "NETWORK",
    `KeyUsage → ${label} used (${usage[key]} calls)`
  );
}

export function getKeyUsageSnapshot() {
  return { ...usage };
}
