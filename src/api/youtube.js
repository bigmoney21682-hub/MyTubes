/**
 * File: youtube.js (previous stable version)
 * Description: Minimal YouTube API wrapper with primary→fallback failover.
 */

const PRIMARY_KEY = import.meta.env.VITE_YT_API_PRIMARY;
const FALLBACK_KEY = import.meta.env.VITE_YT_API_FALLBACK1;

export async function youtubeApiRequest(endpoint, params) {
  const baseUrl = `https://www.googleapis.com/youtube/v3/${endpoint}`;

  async function tryKey(key) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    return await res.json();
  }

  // Try primary
  if (PRIMARY_KEY) {
    const data = await tryKey(PRIMARY_KEY);
    if (data) return data;
  }

  // Try fallback
  if (FALLBACK_KEY) {
    const data = await tryKey(FALLBACK_KEY);
    if (data) return data;
  }

  return null;
}
