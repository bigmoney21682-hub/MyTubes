// File: src/pages/Home.jsx
// PCC v13.0 — Trending + Quota detection + Test Player fallback

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DebugOverlay from "../components/DebugOverlay";
import VideoCard from "../components/VideoCard";
import { getCached, setCached } from "../utils/youtubeCache";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceUsed, setSourceUsed] = useState(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const navigate = useNavigate();
  const log = (msg) => window.debugLog?.(`Home: ${msg}`);

  useEffect(() => {
    async function loadTrending() {
      const apiKey = window.YT_API_KEY;
      const cacheKey = "trending_v1";

      const cached = getCached(cacheKey);
      if (cached) {
        log("DEBUG: Using cached trending");
        setVideos(cached);
        setSourceUsed("CACHE");
        setLoading(false);
        return;
      }

      log("DEBUG: Fetching trending via YouTube API");

      try {
        const url =
          "https://www.googleapis.com/youtube/v3/videos" +
          `?part=snippet,contentDetails&chart=mostPopular&regionCode=US&maxResults=20&key=${apiKey}`;

        log(`DEBUG: Trending URL → ${url}`);

        const res = await fetch(url);
        const data = await res.json();

        // Detect quota exceeded
        if (data?.error?.errors?.[0]?.reason === "quotaExceeded") {
          log("ERROR: Quota exceeded detected");
          setQuotaExceeded(true);
          setVideos([]);
          setLoading(false);
          return;
        }

        if (!data.items || !Array.isArray(data.items)) {
          log("ERROR: Trending returned no items or invalid format");
          log("RAW: " + JSON.stringify(data).slice(0, 200));
          setVideos([]);
          setLoading(false);
          return;
        }

        log(`DEBUG: Raw items = ${data.items.length}`);

        const normalized = data.items.map((item) => {
          const t = item.snippet?.thumbnails;
          const thumbnail =
            t?.maxres?.url ||
            t?.high?.url ||
            t?.medium?.url ||
            t?.default?.url ||
            null;

          return {
            id: item.id,
            title: item.snippet.title,
            author: item.snippet.channelTitle,
            thumbnail,
            duration: null,
          };
        });

        log(`DEBUG: Normalized to ${normalized.length} videos`);

        setCached(cacheKey, normalized);
        setVideos(normalized);
        setSourceUsed("YOUTUBE_API");
      } catch (err) {
        log("ERROR: Trending fetch failed: " + err);
        setVideos([]);
      }

      setLoading(false);
    }

    loadTrending();
  }, []);

  return (
    <>
      <DebugOverlay pageName="Home" sourceUsed={sourceUsed} />

      <div style={{ padding: 16, color: "#fff" }}>
        <h2 style={{ marginBottom: 12 }}>Trending</h2>

        {/* QUOTA TITLE */}
        {quotaExceeded && (
          <div
            style={{
              padding: "12px 14px",
              background: "#331111",
              border: "1px solid #552222",
              borderRadius: 8,
              color: "#ff7777",
              marginBottom: 16,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            YouTube Data API v3 quota reached — Trending unavailable
          </div>
        )}

        {/* TEST PLAYER BUTTON */}
        {videos.length === 0 && (
          <button
            onClick={() => navigate("/watch/dQw4w9WgXcQ")}
            style={{
              padding: "10px 16px",
              background: "#222",
              border: "1px solid #444",
              borderRadius: 8,
              color: "#fff",
              marginBottom: 16,
              cursor: "pointer",
            }}
          >
            ▶ Test Player (Play Video)
          </button>
        )}

        {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}

        {!loading && videos.length === 0 && !quotaExceeded && (
          <p style={{ opacity: 0.7 }}>
            No trending videos available.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </div>
    </>
  );
}
