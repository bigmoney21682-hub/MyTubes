/**
 * File: search.js
 * Path: src/api/search.js
 * Description: Search videos with dev-safe caching.
 */

import { youtubeApiRequest } from "./youtube.js";
import { cacheGet, cacheSet } from "../cache/apiCache.js";
import { debugBus } from "../debug/debugBus.js";

export async function searchVideos(query, maxResults = 20) {
  if (!query) return [];

  const key = `search:${query}:${maxResults}`;

  const cached = cacheGet(key);
  if (cached) {
    debugBus.log("NETWORK", `SearchCache → HIT for "${query}"`);
    return cached;
  }

  debugBus.log("NETWORK", `SearchCache → MISS for "${query}"`);

  const data = await youtubeApiRequest("search", {
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(maxResults),
    videoEmbeddable: "true"
  });

  if (!Array.isArray(data?.items)) return [];

  const normalized = data.items.map((item) => ({
    id: item.id?.videoId,
    title: item.snippet?.title,
    author: item.snippet?.channelTitle,
    channelId: item.snippet?.channelId,
    thumbnail: item.snippet?.thumbnails?.medium?.url,
    published: item.snippet?.publishedAt
  }));

  cacheSet(key, normalized, 1000 * 60 * 5); // 5 min

  return normalized;
}
