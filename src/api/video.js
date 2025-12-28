/**
 * File: video.js
 * Path: src/api/video.js
 * Description: Fetches video details using YouTube Data API v3.
 */

import { youtubeApiRequest } from "./youtube.js";
import { debugBus } from "../debug/debugBus.js";

export async function fetchVideoDetails(videoId) {
  debugBus.log("NETWORK", `VideoDetails → Fetching id=${videoId}`);

  const data = await youtubeApiRequest("videos", {
    part: "snippet,contentDetails,statistics",
    id: videoId
  });

  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    debugBus.log("NETWORK", "VideoDetails → No data returned");
    return null;
  }

  const item = data.items[0];

  const normalized = {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    author: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    views: item.statistics?.viewCount,
    published: item.snippet.publishedAt
  };

  debugBus.log("NETWORK", `VideoDetails → Loaded ${normalized.title}`);

  return normalized;
}
