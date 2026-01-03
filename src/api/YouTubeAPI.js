// File: src/api/YouTubeAPI.js
// Fully normalized YouTube API layer

import normalizeId from "../utils/normalizeId.js";

const API_KEYS = [
  import.meta.env.VITE_YT_API_PRIMARY,
  import.meta.env.VITE_YT_API_FALLBACK1
];

let keyIndex = 0;
function getKey() {
  return API_KEYS[keyIndex % API_KEYS.length];
}
function rotateKey() {
  keyIndex++;
}

const videoCache = {};
const relatedCache = {};
const trendingCache = {};
const pending = {};

/* ------------------------------------------------------------
   Safe fetch with key rotation + dedupe
------------------------------------------------------------ */
async function safeFetch(url) {
  if (pending[url]) return pending[url];

  pending[url] = new Promise(async (resolve) => {
    for (let i = 0; i < API_KEYS.length; i++) {
      const key = getKey();
      const finalUrl = url.replace("{{KEY}}", key);

      try {
        const res = await fetch(finalUrl);

        if (res.status === 200) {
          const json = await res.json();
          delete pending[url];
          return resolve(json);
        }

        if (res.status === 403) {
          rotateKey();
          continue;
        }

        break;
      } catch {
        rotateKey();
      }
    }

    delete pending[url];
    resolve(null);
  });

  return pending[url];
}

/* ------------------------------------------------------------
   Fetch video metadata (cached)
------------------------------------------------------------ */
export async function fetchVideo(id) {
  if (videoCache[id]) return videoCache[id];

  const url =
    `https://www.googleapis.com/youtube/v3/videos?` +
    `part=snippet,statistics&id=${id}&key={{KEY}}`;

  const json = await safeFetch(url);
  if (!json?.items?.[0]) return null;

  const item = json.items[0];
  const normalizedId = normalizeId(item) || id;

  const normalized = {
    id: normalizedId,
    snippet: item.snippet,
    statistics: item.statistics
  };

  videoCache[id] = normalized;
  return normalized;
}

/* ------------------------------------------------------------
   Fetch related videos (cached + normalized)
------------------------------------------------------------ */
export async function fetchRelated(id) {
  if (relatedCache[id]) return relatedCache[id];

  const url =
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&type=video&relatedToVideoId=${id}` +
    `&videoEmbeddable=true&maxResults=20&key={{KEY}}`;

  const json = await safeFetch(url);
  if (!json?.items) {
    relatedCache[id] = [];
    return [];
  }

  const normalized = json.items
    .map((item) => {
      const vid = normalizeId(item);
      if (!vid) return null;
      return { ...item, id: vid };
    })
    .filter(Boolean);

  relatedCache[id] = normalized;
  return normalized;
}

/* ------------------------------------------------------------
   Fetch trending (cached + normalized)
------------------------------------------------------------ */
export async function fetchTrending(region = "US") {
  const cache = trendingCache[region];
  const now = Date.now();

  if (cache && now - cache.timestamp < 30 * 60 * 1000) {
    return cache.items;
  }

  const url =
    `https://www.googleapis.com/youtube/v3/videos?` +
    `part=snippet,statistics&chart=mostPopular&maxResults=20` +
    `&regionCode=${region}&key={{KEY}}`;

  const json = await safeFetch(url);
  if (!json?.items) return cache?.items || [];

  const normalized = json.items
    .map((item) => {
      const vid = normalizeId(item);
      if (!vid) return null;
      return { ...item, id: vid };
    })
    .filter(Boolean);

  trendingCache[region] = {
    timestamp: now,
    items: normalized
  };

  return normalized;
}
