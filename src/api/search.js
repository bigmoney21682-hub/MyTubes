/**
 * File: search.js
 * Path: src/api/search.js
 * Description: Thin wrapper around YouTube Search API.
 * Uses youtubeApiRequest() with clean logging + safe params.
 */

import { youtubeApiRequest } from "./youtube.js";
import { debugBus } from "../debug/debugBus.js";

/**
 * Performs a YouTube search for videos.
 * Returns: { items: [...] } or null
 */
export async function searchVideos(query) {
  if (!query || !query.trim()) {
    debugBus.log("NETWORK", `SearchAPI → SKIP (empty query)`);
    return { items: [] };
  }

  debugBus.log("NETWORK", `SearchAPI → Request for "${query}"`);

  const params = {
    part: "snippet",
    q: query,
    type: "video",
    maxResults: 20,
    videoEmbeddable: true
  };

  const data = await youtubeApiRequest("search", params);

  if (!data) {
    debugBus.log("NETWORK", `SearchAPI → FAIL for "${query}"`);
    return null;
  }

  debugBus.log(
    "NETWORK",
    `SearchAPI → OK for "${query}", items=${data.items?.length ?? 0}`
  );

  return data;
}
