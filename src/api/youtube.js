/**
 * File: youtube.js
 * Path: src/api/youtube.js
 * Description: YouTube API wrapper with trending + video details,
 *              quota tracking via quotaTracker.js, and DebugOverlay logging.
 */

import { recordCall, recordQuotaError, getQuotaSummary } from "../debug/quotaTracker";

const API_KEY = import.meta.env.VITE_YT_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

/* -------------------------------------------------------
   FETCH TRENDING VIDEOS
------------------------------------------------------- */
export async function fetchTrendingVideos() {
  const url = `${BASE}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=US&maxResults=20&key=${API_KEY}`;

  window.bootDebug?.api("Trending → Request:", url);

  try {
    const res = await fetch(url);
    const json = await res.json();

    // Detect quotaExceeded
    if (json.error?.errors?.[0]?.reason === "quotaExceeded") {
      recordQuotaError();
      window.bootDebug?.error("Trending → quotaExceeded");
      window.bootDebug?.quota(getQuotaSummary());
      return [];
    }

    // Track quota usage (videos.list = 1)
    recordCall("videos.list", "PRIMARY");
    window.bootDebug?.quota(getQuotaSummary());

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

/* -------------------------------------------------------
   FETCH VIDEO DETAILS
------------------------------------------------------- */
export async function getVideoDetails(id) {
  const url = `${BASE}/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`;

  window.bootDebug?.api("VideoDetails → Request:", url);

  try {
    const res = await fetch(url);
    const json = await res.json();

    // Detect quotaExceeded
    if (json.error?.errors?.[0]?.reason === "quotaExceeded") {
      recordQuotaError();
      window.bootDebug?.error("VideoDetails → quotaExceeded");
      window.bootDebug?.quota(getQuotaSummary());
      return null;
    }

    // Track quota usage (videos.list = 1)
    recordCall("videos.list", "PRIMARY");
    window.bootDebug?.quota(getQuotaSummary());

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

/* -------------------------------------------------------
   NORMALIZER
------------------------------------------------------- */
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
