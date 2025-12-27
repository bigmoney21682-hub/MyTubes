/**
 * File: trending.js
 * Path: src/api/trending.js
 * Description: Thin wrapper around youtube.js getTrending().
 */

import { getTrending } from "./youtube";

export async function fetchTrendingVideos(region = "US", maxResults = 25) {
  const items = await getTrending(region, maxResults);
  return items || []; // items is already an array
}
