/**
 * File: youtube.js
 * Description: YouTube API wrapper with primary→fallback failover,
 *              quota tracking, key usage tracking, and debug logging.
 */

import { recordQuotaUsage } from "../debug/quotaTracker.js";
import { recordKeyUsage } from "../debug/keyUsageTracker.js";
import { debugBus } from "../debug/debugBus.js";

const PRIMARY_KEY = import.meta.env.VITE_YT_API_PRIMARY;
const FALLBACK_KEY = import.meta.env.VITE_YT_API_FALLBACK1;

export async function youtubeApiRequest(endpoint, params) {
  const baseUrl = `https://www.googleapis.com/youtube/v3/${endpoint}`;

  async function tryKey(key) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("key", key);

    const finalUrl = url.toString();

    // Track key usage
    recordKeyUsage(key, endpoint);

    debugBus.log("NETWORK", `API → ${endpoint} using key=${key}`, {
      endpoint,
      key,
      url: finalUrl
    });

    let res;
    try {
      res = await fetch(finalUrl);
    } catch (err) {
      recordQuotaUsage(key, {
        cost: 1,
        status: 0,
        ok: false,
        url: finalUrl,
        endpoint,
        reason: err.message
      });
      return null;
    }

    const ok = res.ok;
    const status = res.status;

    // Always record quota usage (success or failure)
    recordQuotaUsage(key, {
      cost: 1,
      status,
      ok,
      url: finalUrl,
      endpoint
    });

    if (!ok) return null;

    // IMPORTANT: treat any JSON as success, even if items = []
    return await res.json();
  }

  // Try primary
  if (PRIMARY_KEY) {
    const data = await tryKey(PRIMARY_KEY);
    if (data !== null) return data;
  }

  // Try fallback
  if (FALLBACK_KEY) {
    const data = await tryKey(FALLBACK_KEY);
    if (data !== null) return data;
  }

  return null;
}
