// File: Home.jsx
// Path: src/pages/Home/Home.jsx
// Description: Home page that loads YouTube trending videos using the
// quota-tracked getTrendingVideos() wrapper. Includes loading, error,
// and empty states. Fully compatible with DebugOverlay v3.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTrendingVideos } from "../../api/youtube";   // Correct wrapper
import { debugBus } from "../../debug/debugBus.js";
         // Now exported correctly

export default function Home() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------------------------------------------------------
  // Load Trending Videos (Quota-tracked)
  // ------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function loadTrending() {
      debugBus.log("INFO", "[HOME] Fetching trending videos…");

      try {
        const result = await getTrendingVideos();

        if (!isMounted) return;

        if (!result || !Array.isArray(result.items)) {
          debugBus.error("[HOME] Invalid trending response", result);
          setError("Invalid response from API");
          setLoading(false);
          return;
        }

        debugBus.info(
          `[HOME] Trending loaded → ${result.items.length} items`
        );

        setVideos(result.items);
      } catch (err) {
        debugBus.error("[HOME] Trending fetch failed", err);
        setError("Failed to load trending videos");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTrending();
    return () => (isMounted = false);
  }, []);

  // ------------------------------------------------------------
  // Navigation handler
  // ------------------------------------------------------------
  function openVideo(videoId) {
    if (!videoId) return;
    navigate(`/watch?v=${videoId}`);
  }

  // ------------------------------------------------------------
  // UI STATES
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={styles.text}>Loading trending videos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={styles.text}>Error: {error}</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div style={styles.center}>
        <p style={styles.text}>No trending videos found.</p>
      </div>
    );
  }

  // ------------------------------------------------------------
  // MAIN RENDER
  // ------------------------------------------------------------
  return (
    <div style={styles.container}>
      {videos.map((v) => {
        const id = v.id || v.videoId;
        const title = v.title || v.snippet?.title || "Untitled";
        const thumb =
          v.thumbnail || v.snippet?.thumbnails?.medium?.url;

        return (
          <div
            key={id}
            style={styles.card}
            onClick={() => openVideo(id)}
          >
            {thumb && (
              <img
                src={thumb}
                alt={title}
                style={styles.thumbnail}
              />
            )}
            <p style={styles.title}>{title}</p>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------
// Inline Styles (temporary until your UI shell is rebuilt)
// ------------------------------------------------------------
const styles = {
  container: {
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    cursor: "pointer",
    background: "#111",
    borderRadius: "8px",
    overflow: "hidden",
    paddingBottom: "8px",
  },
  thumbnail: {
    width: "100%",
    display: "block",
  },
  title: {
    color: "#fff",
    fontSize: "14px",
    padding: "8px",
  },
  center: {
    padding: "40px",
    textAlign: "center",
  },
  text: {
    color: "#fff",
    fontSize: "16px",
  },
};
