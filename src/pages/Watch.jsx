// File: src/pages/Watch.jsx

import React, { useState, useEffect, useRef } from "react";
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

  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔒 TEMP: Mini-player hard disabled (PCC-safe)
  const [pipVisible] = useState(false);

  const playerRef = useRef(null);
  const touchStartRef = useRef(null);

  // ─────────────────────────────────────────────
  // Load video metadata
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`
        );
        const data = await res.json();

        if (data.items?.length > 0) {
          setVideo(data.items[0]);
        } else {
          setVideo(null);
        }
      } catch (err) {
        console.error("Video fetch error:", err);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ─────────────────────────────────────────────
  // Initialize single-track playlist
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (video) {
      setPlaylist([video]);
      setCurrentIndex(0);
    }
  }, [video]);

  // ─────────────────────────────────────────────
  // Mini-player gesture logic (INTENTIONALLY DORMANT)
  // ─────────────────────────────────────────────
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (touch.clientX > window.innerWidth - 50 && touch.clientY < 50) {
      touchStartRef.current = touch.clientY;
    } else {
      touchStartRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    if (touch.clientY - touchStartRef.current > 50) {
      // setPipVisible(v => !v); // intentionally disabled
      touchStartRef.current = null;
    }
  };

  // ─────────────────────────────────────────────
  // Playlist end handler
  // ─────────────────────────────────────────────
  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log("Playlist ended");
    }
  };

  const currentTrack = playlist[currentIndex];
  const snippet = currentTrack?.snippet || {};

  const embedUrl = currentTrack?.id
    ? `https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&controls=1&playsinline=1`
    : "";

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom: "var(--footer-height)",
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "#fff",
      }}
      // 🔒 Gesture handlers disabled during debug
      // onTouchStart={handleTouchStart}
      // onTouchMove={handleTouchMove}
    >
      {/* Debug overlay always mounted */}
      <DebugOverlay />

      <Header />

      {loading && <Spinner message="Loading video…" />}

      {!loading && !currentTrack && (
        <div style={{ padding: 16 }}>
          <p>Video not found or unavailable.</p>
        </div>
      )}

      {!loading && currentTrack && (
        <>
          <div style={{ padding: "0 16px" }}>
            <h2>{snippet.title}</h2>
            <p style={{ opacity: 0.7 }}>
              by {snippet.channelTitle}
            </p>
          </div>

          {/* 🔒 Pinned player only — mini-player disabled */}
          {embedUrl && (
            <Player
              ref={playerRef}
              embedUrl={embedUrl}
              playing={true}
              onEnded={handleEnded}
              pipMode={false}
              draggable={false}
              trackTitle={snippet.title}
            />
          )}

          {/* Related videos */}
          {currentTrack.id && (
            <div style={{ padding: "16px" }}>
              <RelatedVideos
                videoId={currentTrack.id}
                apiKey={API_KEY}
              />
            </div>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
