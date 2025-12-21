// File: src/pages/Watch.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Player from "../components/Player";
import DebugOverlay from "../components/DebugOverlay";
import { API_KEY } from "../config";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef(null);

  console.log("DEBUG: Watch mounted with id =", id);

  // Load video metadata
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    (async () => {
      try {
        console.log("DEBUG: Fetching video metadata for id:", id);
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`
        );
        const data = await res.json();
        console.log("DEBUG: Video fetch response", data);
        if (data.items?.length > 0) setVideo(data.items[0]);
        else setVideo(null);
      } catch (err) {
        console.error("DEBUG: Video fetch error:", err);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Setup playlist (single video, mini player disabled)
  useEffect(() => {
    if (video) {
      setPlaylist([video]);
      setCurrentIndex(0);
      console.log("DEBUG: Playlist set", [video]);
    }
  }, [video]);

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      console.log("DEBUG: Advancing playlist to index", currentIndex + 1);
    } else {
      console.log("DEBUG: Playlist ended");
    }
  };

  const currentTrack = playlist[currentIndex];
  const snippet = currentTrack?.snippet || {};
  const embedUrl = currentTrack?.id
    ? `https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&controls=1&playsinline=1`
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
          <h2>{snippet.title}</h2>
          <p style={{ opacity: 0.7 }}>by {snippet.channelTitle}</p>

          {/* Player always mounted, mini player logic disabled */}
          {embedUrl && (
            <Player
              ref={playerRef}
              embedUrl={embedUrl}
              playing={true}
              onEnded={handleEnded}
              pipMode={false} // mini player disabled
              draggable={false} // disable drag
              trackTitle={snippet.title}
            />
          )}

          {currentTrack.id && (
            <RelatedVideos videoId={currentTrack.id} apiKey={API_KEY} />
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
