/**
 * File: YouTubeAPI.js
 * Path: src/api/YouTubeAPI.js
 * Description:
 *   Stable YouTube Data API layer with:
 *   - Trending-as-Related fallback
 *   - 5-item limits
 *   - Key fallback
 *   - Caching + dedupe
 *   - Network tracing
 *   - Error tracing
 *   - ID normalization
 */

// ------------------------------------------------------------
// 🔥 Global Debugging for this module
// ------------------------------------------------------------
console.log("%c[YouTubeAPI] Loaded", "color: orange; font-weight: bold;");

function debugGroup(label, data) {
  console.group(label);
  for (const key in data) console.log(key + ":", data[key]);
  console.groupEnd();
}

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
   Universal fetch with fallback + dedupe + tracing
------------------------------------------------------------ */
async function safeFetch(urlBuilder, cacheKey) {
  if (pending[cacheKey]) return pending[cacheKey];

  pending[cacheKey] = (async () => {
    let lastError = null;

    for (const key of API_KEYS) {
      const url = urlBuilder(key);

      debugGroup("[YT REQUEST]", {
        url,
        key: key ? key.slice(0, 10) + "..." : "undefined"
      });

      try {
        const start = performance.now();
        const res = await fetch(url);
        const time = (performance.now() - start).toFixed(1);

        debugGroup("[YT RESPONSE]", {
          status: res.status,
          time: time + "ms",
          url
        });

        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }

        const json = await res.json();

        if (json.error) {
          debugGroup("[YT JSON ERROR]", json.error);
          lastError = new Error(json.error.message);
          continue;
        }

        delete pending[cacheKey];
        return json;
      } catch (err) {
        debugGroup("[YT FETCH ERROR]", { error: err });
        lastError = err;
        continue;
      }
    }

    debugGroup("[YT FINAL FAILURE]", { error: lastError });
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

  debugGroup("[VIDEO] Fetching video", { id });

  const json = await safeFetch(
    (key) =>
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${key}`,
    `video:${id}`
  );

  if (!json?.items?.[0]) {
    debugGroup("[VIDEO] No data returned", { id });
    return null;
  }

  const item = json.items[0];
  const normalizedId = normalizeId(item) || id;

  const normalized = {
    id: normalizedId,
    snippet: item.snippet,
    statistics: item.statistics
  };

  videoCache[id] = normalized;

  debugGroup("[VIDEO] Normalized", normalized);

  return normalized;
}

/* ------------------------------------------------------------
   Fetch "related" videos — now using Trending fallback only
------------------------------------------------------------ */
export async function fetchRelated(id) {
  debugGroup("[RELATED] Using trending fallback", { id });

  if (relatedCache[id]) return relatedCache[id];

  const trending = await fetchTrending("US");
  const limited = trending.slice(0, 5);

  relatedCache[id] = limited;

  debugGroup("[RELATED] Returning trending-as-related", {
    count: limited.length
  });

  return limited;
}

/* ------------------------------------------------------------
   Fetch trending (cached + normalized + 5 items)
------------------------------------------------------------ */
export async function fetchTrending(region = "US") {
  debugGroup("[TRENDING] Fetching trending", { region });

  const cache = trendingCache[region];
  const now = Date.now();

  if (cache && now - cache.timestamp < 30 * 60 * 1000) {
    debugGroup("[TRENDING] Using cached trending", {
      region,
      count: cache.items.length
    });
    return cache.items.slice(0, 5);
  }

  const json = await safeFetch(
    (key) =>
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=5&regionCode=${region}&key=${key}`,
    `trending:${region}`
  );

  if (!json?.items) {
    debugGroup("[TRENDING] No data returned", { region });
    return cache?.items || [];
  }

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

  debugGroup("[TRENDING] Normalized trending", {
    region,
    count: normalized.length
  });

  return normalized.slice(0, 5);
}
