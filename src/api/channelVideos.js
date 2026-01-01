/**
 * File: channelVideos.js
 * Path: src/api/channelVideos.js
 * Description: Fetches channel videos with dev-safe caching.
 */

import { youtubeApiRequest } from "./youtube.js";
import { cacheGet, cacheSet } from "../cache/apiCache.js";
import { debugBus } from "../debug/debugBus.js";

export async function fetchChannelVideos(channelId, maxResults = 20) {
  if (!channelId) return [];

  const key = `channel:${channelId}:${maxResults}`;

  const cached = cacheGet(key);
  if (cached) {
    debugBus.log("NETWORK", `ChannelCache → HIT for ${channelId}`);
    return cached;
  }

  debugBus.log("NETWORK", `ChannelCache → MISS for ${channelId}`);

  const data = await youtubeApiRequest("search", {
    part: "snippet",
    channelId,
    order: "date",
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

  cacheSet(key, normalized, 1000 * 60 * 10); // 10 min

  return normalized;
}
