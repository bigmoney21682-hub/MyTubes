/**
 * File: videos.js
 * Path: src/api/videos.js
 * Description: Fetches video metadata and related videos using YouTube Data API v3.
 */

import { ytGet } from "./youtube";

export async function getVideoDetails(id) {
  return ytGet("videos", {
    part: "snippet,contentDetails,statistics",
    id
  });
}

export async function getRelatedVideos(id) {
  return ytGet("search", {
    part: "snippet",
    relatedToVideoId: id,
    type: "video",
    maxResults: 20
  });
}
