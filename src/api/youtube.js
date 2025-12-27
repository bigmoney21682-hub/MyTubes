// File: youtube.js
// Path: src/api/youtube.js
// Description: YouTube Data API wrapper with quota tracking and DebugOverlay logging.
// Provides getTrendingVideos() with normalized output and error handling.

import { debugBus } from "../debug/debugBus";

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
// Cost: 1 quota per request (videos.list with chart=mostPopular)
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

    // Normalize items
    const items = data.items.map((item) => ({
      id: item.id,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt
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
