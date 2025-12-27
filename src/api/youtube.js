// File: youtube.js
// Path: src/api/youtube.js
// Description: Unified YouTube Data API wrapper with quota tracking and DebugOverlay logging.
// Provides trending, video details, related videos, and search. All responses normalized.

import { debugBus } from "../debug/debugBus.js";

// ------------------------------------------------------------
// API CONFIG
// ------------------------------------------------------------
const API_KEY = import.meta.env.VITE_YT_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// ------------------------------------------------------------
// Quota Tracker
// ------------------------------------------------------------
let quotaUsed = 0;

function trackQuota(cost, endpoint) {
  quotaUsed += cost;

  debugBus.log(
    "INFO",
    `[QUOTA] ${endpoint} → +${cost} (total used: ${quotaUsed})`
  );
}

// ------------------------------------------------------------
// Helper: Perform GET request
// ------------------------------------------------------------
async function ytGet(endpoint, params = {}) {
  if (!API_KEY) {
    debugBus.error("[YOUTUBE] Missing API key");
    throw new Error("Missing API key");
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("key", API_KEY);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  debugBus.log("INFO", `[YOUTUBE] GET ${url.toString()}`);

  const res = await fetch(url.toString());

  if (!res.ok) {
    const text = await res.text();
    debugBus.error("[YOUTUBE] API error", { status: res.status, text });
    throw new Error(`YouTube API error: ${res.status}`);
  }

  return res.json();
}

// ------------------------------------------------------------
// Trending Videos
// ------------------------------------------------------------
// Cost: 1 quota (videos.list with chart=mostPopular)
export async function getTrendingVideos() {
  trackQuota(1, "Trending");

  try {
    const data = await ytGet("videos", {
      part: "snippet,contentDetails,statistics",
      chart: "mostPopular",
      maxResults: 25,
      regionCode: "US"
    });

    if (!data || !Array.isArray(data.items)) {
      debugBus.error("[YOUTUBE] Invalid trending response", data);
      return { items: [] };
    }

    const items = data.items.map((item) => ({
      id: item.id,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      stats: item.statistics || {}
    }));

    debugBus.log(
      "INFO",
      `[YOUTUBE] Trending normalized → ${items.length} items`
    );

    return { items };
  } catch (err) {
    debugBus.error("[YOUTUBE] Trending fetch failed", err);
    return { items: [] };
  }
}

// ------------------------------------------------------------
// Video Details
// ------------------------------------------------------------
// Cost: 1 quota (videos.list with id=VIDEO_ID)
export async function getVideoDetails(videoId) {
  if (!videoId) {
    debugBus.error("[YOUTUBE] getVideoDetails called without videoId");
    return null;
  }

  trackQuota(1, "VideoDetails");

  try {
    const data = await ytGet("videos", {
      part: "snippet,contentDetails,statistics",
      id: videoId
    });

    if (!data || !Array.isArray(data.items) || !data.items.length) {
      debugBus.error("[YOUTUBE] No details found for video", { videoId });
      return null;
    }

    const item = data.items[0];

    const normalized = {
      id: item.id,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.high?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      stats: item.statistics || {}
    };

    debugBus.log(
      "INFO",
      `[YOUTUBE] Video details loaded → ${videoId}`
    );

    return normalized;
  } catch (err) {
    debugBus.error("[YOUTUBE] Video details fetch failed", err);
    return null;
  }
}

// ------------------------------------------------------------
// Related Videos
// ------------------------------------------------------------
// Cost: 1 quota (search.list with relatedToVideoId)
export async function getRelatedVideos(videoId) {
  if (!videoId) {
    debugBus.error("[YOUTUBE] getRelatedVideos called without videoId");
    return { items: [] };
  }

  trackQuota(1, "Related");

  try {
    const data = await ytGet("search", {
      part: "snippet",
      relatedToVideoId: videoId,
      type: "video",
      maxResults: 20
    });

    if (!data || !Array.isArray(data.items)) {
      debugBus.error("[YOUTUBE] Invalid related response", data);
      return { items: [] };
    }

    const items = data.items.map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt
    }));

    debugBus.log(
      "INFO",
      `[YOUTUBE] Related normalized → ${items.length} items`
    );

    return { items };
  } catch (err) {
    debugBus.error("[YOUTUBE] Related fetch failed", err);
    return { items: [] };
  }
}

// ------------------------------------------------------------
// Search Videos
// ------------------------------------------------------------
// Cost: 1 quota (search.list)
export async function searchVideos(query) {
  if (!query) {
    debugBus.error("[YOUTUBE] searchVideos called without query");
    return { items: [] };
  }

  trackQuota(1, "Search");

  try {
    const data = await ytGet("search", {
      part: "snippet",
      q: query,
      type: "video",
      maxResults: 25
    });

    if (!data || !Array.isArray(data.items)) {
      debugBus.error("[YOUTUBE] Invalid search response", data);
      return { items: [] };
    }

    const items = data.items.map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt
    }));

    debugBus.log(
      "INFO",
      `[YOUTUBE] Search normalized → ${items.length} items`
    );

    return { items };
  } catch (err) {
    debugBus.error("[YOUTUBE] Search fetch failed", err);
    return { items: [] };
  }
}
