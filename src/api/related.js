/**
 * File: related.js
 * Path: src/api/related.js
 * Description:
 *   Fetches related videos with dev-safe caching.
 */

import { youtubeApiRequest } from "./youtube.js";
import { getVideoDetails } from "./video.js";
import { getCachedRelated, setCachedRelated } from "../cache/relatedCache.js";
import { debugBus } from "../debug/debugBus.js";
import normalizeId from "../utils/normalizeId.js"; // ⭐ CRITICAL

/**
 * Main related-video fetcher
 */
export async function fetchRelatedVideos(videoId) {
  if (!videoId) return [];

  // ------------------------------------------------------------
  // 1. Try cache
  // ------------------------------------------------------------
  const cached = getCachedRelated(videoId);
  if (cached) {
    debugBus.log("NETWORK", `RelatedCache → HIT for ${videoId}`);
    return cached;
  }

  debugBus.log("NETWORK", `RelatedCache → MISS for ${videoId}`);

  // ------------------------------------------------------------
  // 2. Primary: relatedToVideoId
  // ------------------------------------------------------------
  const relatedData = await youtubeApiRequest("search", {
    part: "snippet",
    relatedToVideoId: videoId,
    type: "video",
    maxResults: "20",
    videoEmbeddable: "true"
  });

  let list = [];

  if (Array.isArray(relatedData?.items)) {
    list = relatedData.items
      .map((item) => {
        const id = normalizeId(item);
        if (!id || id === videoId) return null;

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
  }

  if (list.length > 0) {
    setCachedRelated(videoId, list);
    return list;
  }

  debugBus.log("NETWORK", "Related → relatedToVideoId returned 0, falling back");

  // ------------------------------------------------------------
  // 3. Fallback: keyword search
  // ------------------------------------------------------------
  const details = await getVideoDetails(videoId);
  const title = details?.title || "";

  if (!title) return [];

  const searchData = await youtubeApiRequest("search", {
    part: "snippet",
    q: title,
    type: "video",
    maxResults: "20",
    videoEmbeddable: "true"
  });

  let fallback = [];

  if (Array.isArray(searchData?.items)) {
    fallback = searchData.items
      .map((item) => {
        const id = normalizeId(item);
        if (!id || id === videoId) return null;

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
  }

  setCachedRelated(videoId, fallback);

  return fallback;
}

/**
 * ⭐ Alias for compatibility
 * Home.jsx can import either:
 *   import { fetchRelatedVideos }
 *   import { fetchRelated }
 */
export const fetchRelated = fetchRelatedVideos;
