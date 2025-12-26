/**
 * File: trending.js
 * Path: src/api/trending.js
 * Description: Fetches trending videos using YouTube Data API v3 (videos.list with chart=mostPopular).
 */

import { ytGet } from "./youtube";

export async function getTrending() {
  return ytGet("videos", {
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    maxResults: 25,
    regionCode: "US"
  });
}
