/**
 * File: related.js
 * Path: src/api/related.js
 * Description: Fetches related videos using YouTube Data API v3.
 */

import { youtubeApiRequest } from "./youtube.js";
import { debugBus } from "../debug/debugBus.js";

export async function fetchRelatedVideos(videoId) {
  debugBus.log("NETWORK", `Related → Fetching for id=${videoId}`);

  const data = await youtubeApiRequest("search", {
    part: "snippet",
    relatedToVideoId: videoId,
    type: "video",
    maxResults: "20"
  });

  if (!data || !Array.isArray(data.items)) {
    debugBus.log("NETWORK", "Related → No data returned");
    return [];
  }

  const normalized = data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    author: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnail: item.snippet.thumbnails?.medium?.url,
    published: item.snippet.publishedAt
  }));

  debugBus.log(
    "NETWORK",
    `Related → Normalized ${normalized.length} videos`
  );

  return normalized;
}
