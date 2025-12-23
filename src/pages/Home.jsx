// File: src/pages/Home.jsx
// PCC v5.0 — Multi-instance Piped fallback + stable trending

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";

export default function Home({ searchQuery }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const log = (msg) => window.debugLog?.(`Home: ${msg}`);

  const PIPED_INSTANCES = [
    "https://pipedapi.syncpundit.com",
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.adminforge.de",
  ];

  async function fetchFromInstances(path) {
    for (const base of PIPED_INSTANCES) {
      try {
        const url = `${base}${path}`;
        log(`DEBUG: Trying ${url}`);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = await res.text();
        log(`DEBUG: Raw response from ${base}: ${raw.slice(0, 200)}...`);

        return JSON.parse(raw);
      } catch (err) {
        log(`ERROR: ${base} failed: ${err}`);
      }
    }
    return null;
  }

  useEffect(() => {
    async function load() {
      setLoading(true);

      let items = [];

      if (searchQuery && searchQuery.trim().length > 0) {
        log(`DEBUG: Searching for "${searchQuery}"`);

        const data = await fetchFromInstances(
          `/search?q=${encodeURIComponent(searchQuery)}&filter=videos`
        );

        items = data?.items || [];
        log(`DEBUG: Search returned ${items.length} items`);
      } else {
        log("DEBUG: Fetching YouTube trending");

        const data = await fetchFromInstances("/trending?region=US");

        items = data || [];
        log(`DEBUG: Trending returned ${items.length} items`);
      }

      setVideos(items);
      setLoading(false);
    }

    load();
  }, [searchQuery]);

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
