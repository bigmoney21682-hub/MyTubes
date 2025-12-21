// File: src/pages/Watch.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Player from "../components/Player";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
import DebugOverlay from "../components/DebugOverlay";
import { API_KEY } from "../config";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef(null);

  // Load video metadata with debug
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    (async () => {
      try {
        console.log("DEBUG: Fetching video metadata for ID:", id);
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`
        );
        const data = await res.json();
        console.log("DEBUG: Video fetch response:", data);

        if (data.items?.length > 0) {
          setVideo(data.items[0]);
          console.log("DEBUG: Video loaded:", data.items[0].snippet.title);
        } else {
          setVideo(null);
          console.warn("DEBUG: No video found for ID:", id);
        }
      } catch (err) {
        console.error("DEBUG: Video fetch error:", err);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Setup single-video playlist (future: multi-track)
  useEffect(() => {
    if (video) {
      setPlaylist([video]);
      setCurrentIndex(0);
      console.log("DEBUG: Playlist initialized with video:", video.snippet.title);
    }
  }, [video]);

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      console.log("DEBUG: Advancing to next track in playlist");
    } else {
      console.log("DEBUG: Playlist ended");
    }
  };

  const currentTrack = playlist[currentIndex];
  const snippet = currentTrack?.snippet || {};
  const embedUrl = currentTrack?.id
    ? `https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&controls=1`
    : "";

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
      {/* Debug overlay */}
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
          <h2>{snippet.title}</h2>
          <p style={{ opacity: 0.7 }}>by {snippet.channelTitle}</p>

          {embedUrl && (
            <Player
              ref={playerRef}
              embedUrl={embedUrl}
              playing={true}
              onEnded={handleEnded}
              pipMode={false} // temporarily disable mini player
              draggable={false}
              trackTitle={snippet.title}
            />
          )}

          {currentTrack.id && (
            <RelatedVideos
              videoId={currentTrack.id}
              apiKey={API_KEY}
              debug={true} // pass debug flag for RelatedVideos logging
            />
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
