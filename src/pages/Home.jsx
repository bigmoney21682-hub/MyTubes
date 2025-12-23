// File: src/pages/Home.jsx
// PCC v6.0 — Unified Piped → Invidious → YouTube fallback for Trending + Search

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";

export default function Home({ searchQuery }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const log = (msg) => window.debugLog?.(`Home: ${msg}`);

  // ---------------------------------------------------------
  // Helper: Extract clean video ID
  // ---------------------------------------------------------
  const getId = (video) => {
    if (!video) return null;
    if (typeof video.id === "string") return video.id;
    if (typeof video.id?.videoId === "string") return video.id.videoId;
    return null;
  };

  // ---------------------------------------------------------
  // Helper: Normalize Piped → Invidious → YouTube item format
  // ---------------------------------------------------------
  const normalizeItem = (item) => {
    const vid = getId(item);
    if (!vid) return null;

    return {
      id: vid,
      title: item.title || item.snippet?.title,
      author: item.uploader || item.author || item.snippet?.channelTitle,
      thumbnail:
        item.thumbnail ||
        item.thumbnails?.medium?.url ||
        item.thumbnails?.default?.url,
      duration: item.duration || item.contentDetails?.duration,
    };
  };

  // ---------------------------------------------------------
  // Fetch from Piped (primary)
  // ---------------------------------------------------------
  async function fetchFromPiped(path) {
    const url = `https://pipedapi.kavin.rocks${path}`;
    log(`DEBUG: Trying Piped: ${url}`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw = await res.text();
      log(`DEBUG: Piped raw: ${raw.slice(0, 200)}...`);

      return JSON.parse(raw);
    } catch (err) {
      log(`ERROR: Piped failed: ${err}`);
      return null;
    }
  }

  // ---------------------------------------------------------
  // Fetch from Invidious (fallback)
  // ---------------------------------------------------------
  async function fetchFromInvidious(path) {
    const url = `https://yewtu.be${path}`;
    log(`DEBUG: Trying Invidious: ${url}`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw = await res.text();
      log(`DEBUG: Invidious raw: ${raw.slice(0, 200)}...`);

      return JSON.parse(raw);
    } catch (err) {
      log(`ERROR: Invidious failed: ${err}`);
      return null;
    }
  }

  // ---------------------------------------------------------
  // Fetch from YouTube API (final fallback)
  // ---------------------------------------------------------
  async function fetchFromYouTubeTrending() {
    log("DEBUG: Trending fallback → YouTube API");

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&regionCode=US&maxResults=20&key=${window.YT_API_KEY}`
      );
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      log(`ERROR: YouTube trending failed: ${err}`);
      return [];
    }
  }

  async function fetchFromYouTubeSearch(query) {
    log("DEBUG: Search fallback → YouTube API");

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(
          query
        )}&key=${window.YT_API_KEY}`
      );
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      log(`ERROR: YouTube search failed: ${err}`);
      return [];
    }
  }

  // ---------------------------------------------------------
  // Main loader: Trending + Search with unified fallback chain
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      let items = [];

      // -----------------------------
      // SEARCH MODE
      // -----------------------------
      if (searchQuery && searchQuery.trim().length > 0) {
        const q = searchQuery.trim();
        log(`DEBUG: Searching for "${q}"`);

        // 1) Try Piped
        const piped = await fetchFromPiped(
          `/search?q=${encodeURIComponent(q)}&filter=videos`
        );
        if (piped?.items?.length) {
          items = piped.items;
        }

        // 2) Try Invidious
        if (!items.length) {
          const inv = await fetchFromInvidious(
            `/api/v1/search?q=${encodeURIComponent(q)}`
          );
          if (Array.isArray(inv) && inv.length) {
            items = inv;
          }
        }

        // 3) Final fallback → YouTube API
        if (!items.length) {
          items = await fetchFromYouTubeSearch(q);
        }

        log(`DEBUG: Search returned ${items.length} items`);
      }

      // -----------------------------
      // TRENDING MODE
      // -----------------------------
      else {
        log("DEBUG: Fetching YouTube trending");

        // 1) Try Piped
        const piped = await fetchFromPiped("/trending?region=US");
        if (Array.isArray(piped) && piped.length) {
          items = piped;
        }

        // 2) Try Invidious
        if (!items.length) {
          const inv = await fetchFromInvidious("/api/v1/trending?region=US");
          if (Array.isArray(inv) && inv.length) {
            items = inv;
          }
        }

        // 3) Final fallback → YouTube API
        if (!items.length) {
          items = await fetchFromYouTubeTrending();
        }

        log(`DEBUG: Trending returned ${items.length} items`);
      }

      // Normalize items
      const normalized = items
        .map((item) => normalizeItem(item))
        .filter(Boolean);

      setVideos(normalized);
      setLoading(false);
    }

    load();
  }, [searchQuery]);

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  if (loading)
    return <p style={{ color: "#fff", padding: 16 }}>Loading…</p>;

  return (
    <div style={{ padding: 16 }}>
      {videos.length === 0 && (
        <p style={{ color: "#fff" }}>No results found.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
