// File: src/pages/Home.jsx
// PCC v13.1 — Trending feed with SearchBar

import React, { useEffect, useState } from "react";
import { fetchTrendingVideos } from "../api/youtube";
import VideoCard from "../components/VideoCard";
import SearchBar from "../components/SearchBar";

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
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <SearchBar />

      <div style={{ padding: 16 }}>
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
    </div>
  );
}
