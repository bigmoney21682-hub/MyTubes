/**
 * File: trending.js
 * Path: src/api/trending.js
 * Description: Fetches trending videos with dev-safe caching.
 */

import { youtubeApiRequest } from "./youtube.js";
import { cacheGet, cacheSet } from "../cache/apiCache.js";
import { debugBus } from "../debug/debugBus.js";
import { normalizeId } from "../utils/normalizeId.js";

export async function fetchTrending(region = "US") {
  const key = `trending:${region}`;

  // 1. Try cache
  const cached = cacheGet(key);
  if (cached) {
    debugBus.log("NETWORK", `TrendingCache → HIT for ${region}`);
    return cached;
  }

  debugBus.log("NETWORK", `TrendingCache → MISS for ${region}`);

  // 2. Fetch from API
  const data = await youtubeApiRequest("videos", {
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    maxResults: "20",
    regionCode: region
  });

  if (!Array.isArray(data?.items)) return [];

  const normalized = data.items
    .map((item) => {
      const id = normalizeId(item);
      if (!id) {
        debugBus.warn("Trending.jsx → Skipped invalid trending item:", item);
        return null;
      }

      return {
        id,
        title: item.snippet?.title,
        author: item.snippet?.channelTitle,
        channelId: item.snippet?.channelId,
        thumbnail: item.snippet?.thumbnails?.medium?.url,
        published: item.snippet?.publishedAt
      };
    })
    .filter(Boolean);

  // 3. Store in cache
  cacheSet(key, normalized, 1000 * 60 * 10); // 10 min

  return normalized;
}
