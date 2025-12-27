/**
 * File: trending.js
 * Path: src/api/trending.js
 * Description: Wrapper for YouTube trending videos using youtube.js API client.
 */
window.bootDebug?.boot("trending.js file loaded");

import { getTrending as ytTrending } from "./youtube";

export async function fetchTrendingVideos(region = "US", maxResults = 25) {
  try {
    const data = await ytTrending(region, maxResults);
    return data?.items || [];
  } catch (err) {
    window.bootDebug?.error("Failed to load trending", err);
    return [];
  }
}

// Optional compatibility export
export const getTrending = fetchTrendingVideos;
