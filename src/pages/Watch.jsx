// File: src/pages/Watch.jsx
// PCC v1.0 — Preservation-First Mode

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
import Footer from "../components/Footer";
import Player from "../components/Player";
import DebugOverlay from "../components/DebugOverlay";
import SearchBar from "../components/SearchBar";
import { API_KEY } from "../config";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const playerRef = useRef(null);

  const log = (msg) => window.debugLog?.(msg);

  // Fetch video metadata
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    log(`DEBUG: Fetching video metadata for id: ${id}`);

    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`
        );
        const data = await res.json();
        log(`DEBUG: Video fetch response: ${JSON.stringify(data)}`);

        if (data.items?.length > 0) setVideo(data.items[0]);
        else setVideo(null);
      } catch (err) {
        log(`DEBUG: Video fetch error: ${err}`);
        setVideo(null);
      } finally {
        setLoading(false);
        log("DEBUG: Watch loading complete");
      }
    })();
  }, [id]);

  // Set playlist with current video
  useEffect(() => {
    if (video) {
      setPlaylist([video]);
      setCurrentIndex(0);
      log(`DEBUG: Playlist set with video: ${video.snippet?.title || "Unknown"}`);
    }
  }, [video]);

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      log(`DEBUG: Track ended, advancing to index ${currentIndex + 1}`);
    } else {
      log("DEBUG: Playlist ended");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    log(`DEBUG: Search triggered for query: ${query}`);
    // Placeholder: you can integrate search functionality here
  };

  const currentTrack = playlist[currentIndex];
  const snippet = currentTrack?.snippet || {};
  const embedUrl = currentTrack?.id
    ? `https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&controls=1&playsinline=1`
    : "";

  log(`DEBUG: Watch mounted with id = ${id}`);
  log(`DEBUG: Current track: ${snippet.title || "None"}`);

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
      {/* Placeholder div preserves layout while Header is centralized in App */}
      <div style={{ height: "var(--header-height)" }} />

      <DebugOverlay />

      {/* Search Block */}
      <div style={{ padding: "1rem", maxWidth: 600, margin: "0 auto" }}>
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && <Spinner message="Loading video…" />}

      {!loading && !currentTrack && (
        <div style={{ padding: 16 }}>
          <p>Video not found or unavailable.</p>
        </div>
      )}

      {!loading && currentTrack && (
        <>
          <h2>{snippet.title}</h2>
          <p style={{ opacity: 0.7 }}>by {snippet.channelTitle}</p>

          {embedUrl && (
            <Player
              ref={playerRef}
              embedUrl={embedUrl}
              playing={true}
              onEnded={handleEnded}
              pipMode={false}
              draggable={false}
              trackTitle={snippet.title}
              style={{ width: "100%" }} // Fill visible width
            />
          )}

          {currentTrack.id && (
            <RelatedVideos
              videoId={currentTrack.id}
              apiKey={API_KEY}
              onDebugLog={log}
            />
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
