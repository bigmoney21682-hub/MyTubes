/**
 * File: trendingMusic.js
 * Path: src/api/trendingMusic.js
 * Description: Fetches trending music videos with dev-safe caching.
 */

import { youtubeApiRequest } from "./youtube.js";
import { cacheGet, cacheSet } from "../cache/apiCache.js";
import { debugBus } from "../debug/debugBus.js";
import { normalizeId } from "../utils/normalizeId.js";

export async function fetchTrendingMusic(region = "US") {
  const key = `trendingMusic:${region}`;

  const cached = cacheGet(key);
  if (cached) {
    debugBus.log("NETWORK", `TrendingMusicCache → HIT for ${region}`);
    return cached;
  }

  debugBus.log("NETWORK", `TrendingMusicCache → MISS for ${region}`);

  const data = await youtubeApiRequest("videos", {
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    maxResults: "20",
    regionCode: region,
    videoCategoryId: "10" // Music
  });

  if (!Array.isArray(data?.items)) return [];

  const normalized = data.items
    .map((item) => {
      const id = normalizeId(item);
      if (!id) {
        debugBus.warn("TrendingMusic → Skipped invalid item:", item);
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

  cacheSet(key, normalized, 1000 * 60 * 10); // 10 min

  return normalized;
}
