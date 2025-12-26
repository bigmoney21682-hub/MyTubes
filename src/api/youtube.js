// File: src/api/youtube.js

const API_KEY = import.meta.env.VITE_YT_API_KEY;

export async function fetchTrendingVideos() {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=US&maxResults=20&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return data.items || [];
}
