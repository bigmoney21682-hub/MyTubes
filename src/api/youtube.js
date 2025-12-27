/**
 * File: youtube.js
 * Path: src/api/youtube.js
 * Description: Unified YouTube Data API wrapper with trending, video details,
 *              normalization, error handling, and DebugOverlay quota logging.
 */

import { recordCall, recordQuotaError } from "../debug/quotaTracker";


const API_KEY = import.meta.env.VITE_YT_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Fetch trending videos (Most Popular)
 */
export async function fetchTrendingVideos() {
  const url = `${BASE}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=US&maxResults=20&key=${API_KEY}`;

  window.bootDebug?.api("Trending → Request:", url);

  try {
    const res = await fetch(url);
    const json = await res.json();

    // Quota tracking (header may be missing depending on Google)
    const quota = res.headers.get("x-quota-used") || "unknown";
    window.bootDebug?.api("Trending → Quota used:", quota);

    if (!json.items || !Array.isArray(json.items)) {
      window.bootDebug?.error("Trending → Invalid response:", json);
      return [];
    }

    window.bootDebug?.api(`Trending → Loaded ${json.items.length} items`);
    return json.items.map(normalizeVideo);
  } catch (err) {
    window.bootDebug?.error("Trending → Fetch failed:", err);
    return [];
  }
}

/**
 * Fetch details for a single YouTube video by ID.
 */
export async function getVideoDetails(id) {
  const url = `${BASE}/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`;

  window.bootDebug?.api("VideoDetails → Request:", url);

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.items || json.items.length === 0) {
      window.bootDebug?.error("VideoDetails → No items:", json);
      return null;
    }

    const item = json.items[0];

    window.bootDebug?.api("VideoDetails → Loaded:", item.id);

    return {
      id: item.id,
      title: item.snippet?.title,
      description: item.snippet?.description,
      channel: item.snippet?.channelTitle,
      published: item.snippet?.publishedAt,
      views: item.statistics?.viewCount,
      duration: item.contentDetails?.duration
    };
  } catch (err) {
    window.bootDebug?.error("VideoDetails → Fetch failed:", err);
    return null;
  }
}

/**
 * Normalize video objects for UI consumption.
 */
function normalizeVideo(item) {
  return {
    id: item.id,
    title: item.snippet?.title || "Untitled",
    thumbnail: item.snippet?.thumbnails?.medium?.url,
    channel: item.snippet?.channelTitle,
    published: item.snippet?.publishedAt,
    views: item.statistics?.viewCount
  };
}
