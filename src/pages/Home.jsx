// File: src/pages/Home.jsx
// PCC v4.0 — Correct ID extraction + debug logging + stable navigation

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";

export default function Home({ searchQuery }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const log = (msg) => window.debugLog?.(`Home: ${msg}`);

  // ---------------------------------------------------------
  // Fetch trending or search results
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        if (searchQuery && searchQuery.trim().length > 0) {
          log(`DEBUG: Searching for "${searchQuery}"`);

          const res = await fetch(
            `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(
              searchQuery
            )}&filter=videos`
          );
          const raw = await res.text();
          log(`DEBUG: Search raw: ${raw.slice(0, 200)}...`);

          const data = JSON.parse(raw);
          const items = data?.items || [];

          log(`DEBUG: Search returned ${items.length} items`);
          setVideos(items);
        } else {
          log("DEBUG: Fetching YouTube trending");

          const res = await fetch(
            "https://pipedapi.kavin.rocks/trending?region=US"
          );
          const raw = await res.text();
          log(`DEBUG: Trending raw: ${raw.slice(0, 200)}...`);

          const data = JSON.parse(raw);
          const items = data || [];

          log(`DEBUG: YouTube trending returned ${items.length} items`);
          setVideos(items);
        }
      } catch (err) {
        log(`ERROR: Fetch failed: ${err}`);
        setVideos([]);
      }

      setLoading(false);
    }

    load();
  }, [searchQuery]);

  // ---------------------------------------------------------
  // Extract a clean video ID (string only)
  // ---------------------------------------------------------
  const getId = (video) => {
    if (!video) return null;

    if (typeof video.id === "string") return video.id;
    if (typeof video.id?.videoId === "string") return video.id.videoId;

    return null;
  };

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
        {videos.map((video) => {
          const vid = getId(video);

          if (!vid) {
            log("ERROR: Invalid video.id in Home list");
            return null;
          }

          return (
            <VideoCard
              key={vid}
              video={{
                id: vid,
                title: video.title || video.snippet?.title,
                author: video.uploader || video.snippet?.channelTitle,
                thumbnail:
                  video.thumbnail ||
                  video.thumbnails?.medium?.url ||
                  video.thumbnails?.default?.url,
                duration: video.duration,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
