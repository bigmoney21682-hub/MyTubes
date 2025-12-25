// File: src/utils/youtubeCache.js
// PCC v3.0 — Unified YouTube API cache + fetchWithCache
// rebuild-cache-3

const cache = new Map();

/**
 * Retrieve a cached value by key.
 */
export function getCached(key) {
  const value = cache.get(key) || null;
  window.debugLog?.(
    `YouTubeCache: getCached("${key}") → ${value ? "HIT" : "MISS"}`,
    "API"
  );
  return value;
}

/**
 * Store a value in the cache.
 */
export function setCached(key, body) {
  window.debugLog?.(`YouTubeCache: setCached("${key}")`, "API");
  cache.set(key, {
    time: Date.now(),
    body,
  });
}

/**
 * Clear all cached entries.
 */
export function clearYouTubeCache() {
  window.debugLog?.("YouTubeCache: clearYouTubeCache() → cache cleared", "API");
  cache.clear();
}

/**
 * PCC v3.0 — Unified fetchWithCache
 * - Returns a Response object identical to fetch()
 * - Never throws
 * - Logs hits/misses
 * - TTL default: 5 minutes
 */
export async function fetchWithCache(url, ttlMs = 1000 * 60 * 5) {
  try {
    const cached = getCached(url);

    // Fresh cache hit
    if (cached && Date.now() - cached.time < ttlMs) {
      window.debugLog?.(`YouTubeCache: CACHE HIT for ${url}`, "API");
      return new Response(cached.body, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Cache miss → fetch
    window.debugLog?.(`YouTubeCache: CACHE MISS for ${url}`, "API");
    const res = await fetch(url);
    const text = await res.clone().text();

    // Store only successful responses
    if (res.ok) {
      setCached(url, text);
    }

    return new Response(text, {
      status: res.status,
      headers: res.headers,
    });
  } catch (err) {
    window.debugLog?.(`fetchWithCache ERROR → ${err.message}`, "ERROR");
    return new Response("{}", { status: 500 });
  }
}
