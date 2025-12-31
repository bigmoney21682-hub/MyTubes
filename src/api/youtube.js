/**
 * File: youtube.js
 * Path: src/api/youtube.js
 * Description: Unified YouTube Data API v3 client with primary→fallback
 *              key failover and DebugOverlay-friendly logging.
 */

const PRIMARY_KEY = import.meta.env.VITE_YT_API_PRIMARY;
const FALLBACK_KEY = import.meta.env.VITE_YT_API_FALLBACK1;

if (!PRIMARY_KEY) {
  console.error("VITE_YT_API_PRIMARY is not set");
}
if (!FALLBACK_KEY) {
  console.warn("VITE_YT_API_FALLBACK1 is not set (fallback disabled)");
}

/**
 * Core YouTube API fetch with primary→fallback failover.
 *
 * @param {string} endpoint - e.g. "videos"
 * @param {Record<string, string>} params - query params (without key)
 * @returns {Promise<any|null>} - parsed JSON or null on total failure
 */
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

    if (!res.ok) {
      window.bootDebug?.network(
        `YT API ${label} ERROR → status=${res.status}`
      );
      return { ok: false, status: res.status, data: null };
    }

    const data = await res.json();
    window.bootDebug?.network(
      `YT API ${label} OK → endpoint=${endpoint}, items=${data.items?.length ?? 0}`
    );

    return { ok: true, status: res.status, data };
  }

  // 1) Try primary key
  if (PRIMARY_KEY) {
    try {
      const primary = await tryWithKey(PRIMARY_KEY, "PRIMARY");
      if (primary.ok) return primary.data;

      if ([400, 403, 429].includes(primary.status)) {
        window.bootDebug?.network(
          `YT API → Primary key failed with status=${primary.status}, attempting fallback`
        );
      } else {
        window.bootDebug?.network(
          `YT API → Primary key non-success status=${primary.status}, attempting fallback`
        );
      }
    } catch (err) {
      window.bootDebug?.network(
        `YT API PRIMARY EXCEPTION → ${err.message}`
      );
    }
  }

  // 2) Try fallback key if available
  if (FALLBACK_KEY) {
    try {
      const fallback = await tryWithKey(FALLBACK_KEY, "FALLBACK1");
      if (fallback.ok) return fallback.data;

      window.bootDebug?.network(
        `YT API → Fallback key failed with status=${fallback.status}`
      );
    } catch (err) {
      window.bootDebug?.network(
        `YT API FALLBACK1 EXCEPTION → ${err.message}`
      );
    }
  }

  // 3) Total failure
  window.bootDebug?.network(
    "YT API → All keys failed for endpoint " + endpoint
  );
  return null;
}
