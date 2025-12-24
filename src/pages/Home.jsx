// File: src/pages/Home.jsx
// PCC v9.0 — Crash‑proof Home with safe search + fallback UI

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ searchQuery }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");

  const log = (msg) => window.debugLog?.(`Home: ${msg}`);

  // ------------------------------------------------------------
  // Fetch videos (safe, crash‑proof)
  // ------------------------------------------------------------
  useEffect(() => {
    const q = searchQuery?.trim();
    if (!q) {
      log("No search query — clearing results");
      setVideos([]);
      setError("");
      return;
    }

    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError("");

        log(`Fetching videos for query="${q}"`);

        const key = window.__ytKey;
        if (!key) {
          log("ERROR: No API key found");
          setError("Missing API key");
          setVideos([]);
          return;
        }

        const url =
          "https://www.googleapis.com/youtube/v3/search" +
          `?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(q)}` +
          `&key=${key}`;

        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          log(`Fetch failed: ${res.status} ${text}`);
          setError("API error");
          setVideos([]);
          return;
        }

        const data = await res.json();
        if (!Array.isArray(data.items)) {
          log("Invalid API response");
          setError("Invalid API response");
          setVideos([]);
          return;
        }

        const mapped = data.items.map((item) => ({
          id: item.id?.videoId || null,
          title: item.snippet?.title || "",
          author: item.snippet?.channelTitle || "",
          thumbnail:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            "",
        }));

        log(`Loaded ${mapped.length} videos`);
        setVideos(mapped);
      } catch (err) {
        log(`Exception: ${err.message}`);
        setError("Network error");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchQuery]);

  // ------------------------------------------------------------
  // Navigation helper
  // ------------------------------------------------------------
  const openVideo = (id) => {
    if (!id) {
      log("INVALID VIDEO ID");
      setError("Invalid video ID");
      return;
    }
    navigate(`/watch/${id}`);
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div style={{ padding: 20, color: "#fff" }}>
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "#fff" }}>
        <div>Error: {error}</div>
        <button
          onClick={() => openVideo("dQw4w9WgXcQ")}
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: "#ff0000",
            border: "none",
            borderRadius: 6,
            color: "#fff",
          }}
        >
          Play Test Video
        </button>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div style={{ padding: 20, color: "#fff" }}>
        <div>No results</div>
        <button
          onClick={() => openVideo("dQw4w9WgXcQ")}
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: "#ff0000",
            border: "none",
            borderRadius: 6,
            color: "#fff",
          }}
        >
          Play Test Video
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {videos.map((v) => (
        <div
          key={v.id}
          onClick={() => openVideo(v.id)}
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <img
            src={v.thumbnail}
            alt=""
            style={{ width: 160, height: 90, borderRadius: 6 }}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{v.title}</div>
            <div style={{ opacity: 0.7 }}>{v.author}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
