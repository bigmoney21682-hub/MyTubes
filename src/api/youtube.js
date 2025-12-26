/**
 * File: youtube.js
 * Path: src/api/youtube.js
 * Description: Base YouTube Data API client. Handles API key, base URL, and GET requests with debug logging.
 */

import { debugLog } from "../debug/debugBus";

const API_KEY = import.meta.env.VITE_YT_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

export async function ytGet(endpoint, params = {}) {
  const url = new URL(`${BASE}/${endpoint}`);

  // Add API key
  url.searchParams.set("key", API_KEY);

  // Add all other params
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  debugLog("API", "YouTube Request → " + url.toString());

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      debugLog("ERROR", "YouTube API failed", {
        url: url.toString(),
        status: res.status
      });
      throw new Error("YouTube API error: " + res.status);
    }

    const data = await res.json();
    debugLog("API", "YouTube Response OK", { endpoint, data });

    return data;
  } catch (err) {
    debugLog("ERROR", "YouTube API exception", { endpoint, err });
    throw err;
  }
}
