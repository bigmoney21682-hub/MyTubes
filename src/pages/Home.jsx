// File: src/pages/Home.jsx
// PCC v13.0 — Trending Feed (YouTube-only)
// - Fetches trending videos via api/youtube.js
// - Loading + error states
// - Clean 1-column mobile layout
// - Uses VideoCard for navigation

import React, { useEffect, useState } from "react";
import { fetchTrendingVideos } from "../api/youtube";
import VideoCard from "../components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------------------------------------------------------
  // Load trending videos
  // ------------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const items = await fetchTrendingVideos();
        setVideos(items);
      } catch (err) {
        console.error("Trending fetch failed:", err);
        setError("Failed to load trending videos");
      }

      setLoading(false);
    }

    load();
  }, []);

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div style={{ padding: 16, color: "#fff" }}>
      <h2 style={{ marginBottom: 12 }}>Trending</h2>

      {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
      {error && <p style={{ color: "#ff7777" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
