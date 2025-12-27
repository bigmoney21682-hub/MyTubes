/**
 * File: youtube.js
 * Path: src/api/youtube.js
 * Description: YouTube API wrapper with quota tracking and DebugOverlay logging.
 */

const API_KEY = import.meta.env.VITE_YT_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

export async function fetchTrendingVideos() {
  const url = `${BASE}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=US&maxResults=20&key=${API_KEY}`;

  window.bootDebug?.api("Trending → Request:", url);

  try {
    const res = await fetch(url);
    const json = await res.json();

    // Track quota usage
    const quota = res.headers.get("x-quota-used") || "unknown";
    window.bootDebug?.api("Trending → Quota used:", quota);

    if (!json.items || !Array.isArray(json.items)) {
      window.bootDebug?.error("Trending → Invalid response:", json);
      return [];
    }

    window.bootDebug?.home(`Trending loaded: ${json.items.length} items`);
    return json.items.map(normalizeVideo);
  } catch (err) {
    window.bootDebug?.error("Trending → Fetch failed:", err);
    return [];
  }
}

function normalizeVideo(item) {
  return {
    id: item.id,
    title: item.snippet?.title || "Untitled",
    thumbnail: item.snippet?.thumbnails?.medium?.url,
    channel: item.snippet?.channelTitle,
    published: item.snippet?.publishedAt,
  };
}
