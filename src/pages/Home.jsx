// File: src/pages/Home.jsx
// Updated: Wider full-width responsive grid + improved VideoCard usage with full metadata

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import DebugOverlay from "../components/DebugOverlay";
import { API_KEY } from "../config";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const log = (msg) => window.debugLog?.(msg);

  useEffect(() => {
    log("DEBUG: Home page mounted");

    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=30&regionCode=US&key=${API_KEY}`
        );
        const data = await res.json();
        setVideos(data.items || []);
        log(`DEBUG: Fetched popular videos: ${data.items?.length || 0}`);
      } catch (err) {
        log(`DEBUG: Home fetch error: ${err}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom: "var(--footer-height)",
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "#fff",
      }}
    >
      <DebugOverlay pageName="Home" />

      <h2 style={{ padding: "0 16px", marginBottom: "8px" }}>Trending Videos</h2>

      {loading && <p style={{ textAlign: "center" }}>Loading videos…</p>}

      {/* Full-width responsive grid – thumbnails stretch edge-to-edge */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", // Wider min width for larger thumbnails
          gap: 16,
          padding: "0 8px", // Small side padding to prevent touching screen edges on mobile
        }}
      >
        {videos.map((v) => (
          <VideoCard
            key={v.id}
            video={{
              id: v.id,
              title: v.snippet.title,
              thumbnail: v.snippet.thumbnails.high?.url || v.snippet.thumbnails.medium.url, // Prefer higher-res thumbnail
              author: v.snippet.channelTitle,
              duration: v.contentDetails?.duration, // ISO duration for VideoCard to format
              viewCount: v.statistics?.viewCount,   // Optional: if you want to display views later
            }}
          />
        ))}
      </div>
    </div>
  );
}
