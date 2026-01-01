/**
 * File: youtube.js
 * Path: src/api/youtube.js
 * Description: Unified YouTube Data API v3 client with primary→fallback
 *              key failover, quota tracking, and key usage tracking.
 */

import { recordQuotaUsage } from "../debug/quotaTracker.js";
import { recordKeyUsage } from "../debug/keyUsageTracker.js";

const PRIMARY_KEY = import.meta.env.VITE_YT_API_PRIMARY;
const FALLBACK_KEY = import.meta.env.VITE_YT_API_FALLBACK1;

if (!PRIMARY_KEY) console.error("VITE_YT_API_PRIMARY is not set");
if (!FALLBACK_KEY) console.warn("VITE_YT_API_FALLBACK1 is not set");

// YouTube API quota costs
const COSTS = {
  videos: 1,
  search: 100,
  channels: 1
};

export async function youtubeApiRequest(endpoint, params) {
  const baseUrl = `https://www.googleapis.com/youtube/v3/${endpoint}`;

  async function tryWithKey(key, label) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("key", key);

    window.bootDebug?.network(
      `YT API ${label} → ${url.pathname}?${url.searchParams.toString()}`
    );

    const res = await fetch(url.toString());

    // ------------------------------------------------------------
    // Detailed error logging
    // ------------------------------------------------------------
    if (!res.ok) {
      const text = await res.text();
      let err = null;
      try { err = JSON.parse(text); } catch {}

      const reason = err?.error?.errors?.[0]?.reason;

      window.bootDebug?.network(
        `YT API ${label} ERROR → status=${res.status}, reason=${reason || "unknown"}, body=${text}`
      );

      return { ok: false, status: res.status, data: null };
    }

    // Success
    const data = await res.json();

    const cost = COSTS[endpoint] ?? 1;
    recordQuotaUsage(key, cost);
    recordKeyUsage(key, label);

    window.bootDebug?.network(
      `YT API ${label} OK → endpoint=${endpoint}, items=${data.items?.length ?? 0}`
    );

    return { ok: true, status: res.status, data };
  }

  // Primary
  if (PRIMARY_KEY) {
    try {
      const primary = await tryWithKey(PRIMARY_KEY, "PRIMARY");
      if (primary.ok) return primary.data;
    } catch (err) {
      window.bootDebug?.network(`YT API PRIMARY EXCEPTION → ${err.message}`);
    }
  }

  // Fallback
  if (FALLBACK_KEY) {
    try {
      const fallback = await tryWithKey(FALLBACK_KEY, "FALLBACK1");
      if (fallback.ok) return fallback.data;
    } catch (err) {
      window.bootDebug?.network(`YT API FALLBACK1 EXCEPTION → ${err.message}`);
    }
  }

  window.bootDebug?.network("YT API → All keys failed for endpoint " + endpoint);
  return null;
}
