/**
 * File: relatedCache.js
 * Path: src/cache/relatedCache.js
 */

import { cacheGet, cacheSet } from "./apiCache.js";

export function getCachedRelated(id) {
  return cacheGet("related:" + id);
}

export function setCachedRelated(id, data) {
  cacheSet("related:" + id, data, 1000 * 60 * 10); // 10 min
}
