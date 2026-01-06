/**
 * File: YouTubeAPI.js
 * Path: src/api/YouTubeAPI.js
 * Description:
 *   Stable YouTube Data API layer with:
 *   - Trending-as-Related fallback
 *   - 5-item limits
 *   - Key fallback
 *   - Caching + dedupe
 *   - ID normalization
 */

import normalizeId from "../utils/normalizeId.js";

/* ------------------------------------------------------------
   API Keys (primary + fallback)
------------------------------------------------------------ */
const API_KEYS = [
  import.meta.env.VITE_YT_API_PRIMARY,
  import.meta.env.VITE_YT_API_FALLBACK1
];

/* ------------------------------------------------------------
   Caches
------------------------------------------------------------ */
const videoCache = {};
const relatedCache = {};
const trendingCache = {};
const pending = {};

/* ------------------------------------------------------------
   Universal fetch with fallback + dedupe
------------------------------------------------------------ */
async function safeFetch(urlBuilder, cacheKey) {
  if (pending[cacheKey]) return pending[cacheKey];

  pending[cacheKey] = (async () => {
    let lastError = null;

    for (const key of API_KEYS) {
      const url = urlBuilder(key);

      try {
        const res = await fetch(url);

        // Treat ANY non-200 as failure → fallback activates
        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }

        const json = await res.json();

        // YouTube sometimes returns 200 with an error object
        if (json.error) {
          lastError = new Error(json.error.message);
          continue;
        }

        delete pending[cacheKey];
        return json;
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    delete pending[cacheKey];
    return null;
  })();

  return pending[cacheKey];
}

/* ------------------------------------------------------------
   Fetch video metadata (cached)
------------------------------------------------------------ */
export async function fetchVideo(id) {
  if (videoCache[id]) return videoCache[id];

  const json = await safeFetch(
    (key) =>
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${key}`,
    `video:${id}`
  );

  if (!json?.items?.[0]) return null;

  const item = json.items[0];
  const normalizedId = normalizeId(item) || id;

  const normalized = {
    id: normalizedId,
    snippet: item.snippet,
    statistics: item.statistics
  };

  videoCache[id] = normalized;
  return normalized;
}

/* ------------------------------------------------------------
   Fetch "related" videos — now using Trending fallback only
------------------------------------------------------------ */
export async function fetchRelated(id) {
  // Always use trending as related
  const trending = await fetchTrending("US");

  // Limit to 5 items
  const limited = trending.slice(0, 5);

  relatedCache[id] = limited;
  return limited;
}

/* ------------------------------------------------------------
   Fetch trending (cached + normalized)
------------------------------------------------------------ */
export async function fetchTrending(region = "US") {
  const cache = trendingCache[region];
  const now = Date.now();

  // 30-minute cache
  if (cache && now - cache.timestamp < 30 * 60 * 1000) {
    return cache.items.slice(0, 5);
  }

  const json = await safeFetch(
    (key) =>
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=5&regionCode=${region}&key=${key}`,
    `trending:${region}`
  );

  if (!json?.items) return cache?.items || [];

  const normalized = json.items
    .map((item) => {
      const vid = normalizeId(item);
      if (!vid) return null;
      return { ...item, id: vid };
    })
    .filter(Boolean);

  trendingCache[region] = {
    timestamp: now,
    items: normalized
  };

  return normalized.slice(0, 5);
}
