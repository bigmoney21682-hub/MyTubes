// File: src/pages/Watch.jsx
// PCC v1.0 — Preservation-First Mode
// Mini-player temporarily disabled to isolate iOS PWA issue

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Player from "../components/Player";
import { API_KEY } from "../config";
import DebugOverlay from "../components/DebugOverlay";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load video metadata
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`
        );
        const data = await res.json();
        if (data.items?.length > 0) setVideo(data.items[0]);
        else setVideo(null);
      } catch (err) {
        console.error("Video fetch error:", err);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const snippet = video?.snippet || {};
  const embedUrl = video?.id
    ? `https://www.youtube.com/embed/${video.id}?autoplay=1&controls=1`
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "#fff",
      }}
    >
      {/* Debug overlay always mounted */}
      <DebugOverlay />

      {/* Header fixed */}
      <Header />

      {loading && <Spinner message="Loading video…" />}

      {!loading && !video && (
        <div style={{ padding: 16 }}>
          <p>Video not found or unavailable.</p>
        </div>
      )}

      {!loading && video && (
        <>
          <h2 style={{ padding: "1rem 16px" }}>{snippet.title}</h2>
          <p style={{ padding: "0 16px", opacity: 0.7 }}>
            by {snippet.channelTitle}
          </p>

          {/* Player mounted normally at top of content */}
          {embedUrl && (
            <Player
              embedUrl={embedUrl}
              playing={true}
              onEnded={() => console.log("Video ended")}
              pipMode={false} // Mini-player disabled
              draggable={false}
              trackTitle={snippet.title}
            />
          )}

          {video.id && <RelatedVideos videoId={video.id} apiKey={API_KEY} />}
        </>
      )}

      {/* Footer fixed */}
      <Footer />
    </div>
  );
}
