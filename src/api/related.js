/**
 * File: related.js
 * Path: src/api/related.js
 * Description: Fetches related videos using YouTube Data API v3.
 * Falls back to keyword search if relatedToVideoId fails.
 */

import { youtubeApiRequest } from "./youtube.js";
import { debugBus } from "../debug/debugBus.js";
import { getVideoDetails } from "./video.js"; // assumes you have this

export async function fetchRelatedVideos(videoId) {
  debugBus.log("NETWORK", `Related → Fetching for id=${videoId}`);

  // First attempt: relatedToVideoId
  const relatedData = await youtubeApiRequest("search", {
    part: "snippet",
    relatedToVideoId: videoId,
    type: "video",
    maxResults: "20",
    videoEmbeddable: "true"
  });

  if (Array.isArray(relatedData?.items) && relatedData.items.length > 0) {
    const normalized = relatedData.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      published: item.snippet.publishedAt
    }));

    debugBus.log(
      "NETWORK",
      `Related → Found ${normalized.length} via relatedToVideoId`
    );
    return normalized;
  }

  debugBus.log(
    "NETWORK",
    "Related → relatedToVideoId failed, falling back to keyword search"
  );

  // Fallback: keyword search using video title
  const details = await getVideoDetails(videoId);
  const title = details?.title || "";

  if (!title) {
    debugBus.log("NETWORK", "Related → No title available for fallback search");
    return [];
  }

  const searchData = await youtubeApiRequest("search", {
    part: "snippet",
    q: title,
    type: "video",
    maxResults: "20",
    videoEmbeddable: "true"
  });

  if (!Array.isArray(searchData?.items)) {
    debugBus.log("NETWORK", "Related → Fallback search returned no items");
    return [];
  }

  const fallbackNormalized = searchData.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    author: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnail: item.snippet.thumbnails?.medium?.url,
    published: item.snippet.publishedAt
  }));

  debugBus.log(
    "NETWORK",
    `Related → Found ${fallbackNormalized.length} via keyword fallback`
  );
  return fallbackNormalized;
}
