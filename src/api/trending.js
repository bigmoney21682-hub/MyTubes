/**
 * File: trending.js
 * Path: src/api/trending.js
 * Description: Fetches trending videos from your backend/Piped API.
 */

export async function fetchTrendingVideos(region = "US", maxResults = 25) {
  const url = `https://pipedapi.kavin.rocks/trending?region=${region}`;

  const res = await fetch(url);
  const data = await res.json();

  // Normalize into your app's expected shape
  return data.slice(0, maxResults).map((item) => ({
    id: item.id,
    title: item.title,
    channel: item.uploaderName,
    thumbnail: item.thumbnail,
    views: item.views
  }));
}
