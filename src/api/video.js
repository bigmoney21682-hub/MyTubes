/**
 * File: video.js
 * Path: src/api/video.js
 * Description: Fetches video details with dev-safe caching.
 */

import { youtubeApiRequest } from "./youtube.js";
import { getCachedVideo, setCachedVideo } from "../cache/videoCache.js";
import { debugBus } from "../debug/debugBus.js";

export async function getVideoDetails(videoId) {
  if (!videoId) return null;

  // 1. Try cache
  const cached = getCachedVideo(videoId);
  if (cached) {
    debugBus.log("NETWORK", `VideoCache → HIT for ${videoId}`);
    return cached;
  }

  debugBus.log("NETWORK", `VideoCache → MISS for ${videoId}`);

  // 2. Fetch from API
  const data = await youtubeApiRequest("videos", {
    part: "snippet,statistics",
    id: videoId
  });

  if (!data?.items?.length) {
    debugBus.log("NETWORK", `VideoCache → API returned no items for ${videoId}`);
    return null;
  }

  const normalized = {
    id: videoId,
    title: data.items[0].snippet?.title,
    description: data.items[0].snippet?.description,
    channelId: data.items[0].snippet?.channelId,
    channelTitle: data.items[0].snippet?.channelTitle,
    publishedAt: data.items[0].snippet?.publishedAt,
    thumbnails: data.items[0].snippet?.thumbnails,
    statistics: data.items[0].statistics
  };

  // 3. Store in cache
  setCachedVideo(videoId, normalized);

  return normalized;
}
