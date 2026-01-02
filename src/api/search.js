/**
 * File: search.js
 * Path: src/api/search.js
 * Description: Thin wrapper around YouTube Search API.
 */

import { youtubeApiRequest } from "./youtube.js";
import { debugBus } from "../debug/debugBus.js";
import { normalizeId } from "../utils/normalizeId.js";

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

  if (!data || !Array.isArray(data.items)) {
    debugBus.log("NETWORK", `SearchAPI → FAIL for "${query}"`);
    return { items: [] };
  }

  const normalizedItems = data.items
    .map((item) => {
      const id = normalizeId(item);
      if (!id) return null;

      return {
        ...item,
        id
      };
    })
    .filter(Boolean);

  debugBus.log(
    "NETWORK",
    `SearchAPI → OK for "${query}", normalized=${normalizedItems.length}`
  );

  return { items: normalizedItems };
}
