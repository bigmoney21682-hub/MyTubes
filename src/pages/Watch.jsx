// File: src/pages/Watch.jsx
// Connected to global miniplayer for background play
// PCC v2.0 — Syncs playing state with global miniplayer

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
import Footer from "../components/Footer";
import Player from "../components/Player";
import DebugOverlay from "../components/DebugOverlay";
import { API_KEY } from "../config";

export default function Watch({
  currentVideo,
  setCurrentVideo,
  isPlaying,
  setIsPlaying,
}) {
  const { id } = useParams();
  const [video, setVideo] = useState(currentVideo || null);
  const [loading, setLoading] = useState(!currentVideo);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef(null);

  const log = (msg) => window.debugLog?.(`Watch(${id}): ${msg}`);

  useEffect(() => {
    if (!id) return;

    // If global currentVideo already matches this id, reuse it
    if (currentVideo && (currentVideo.id === id || currentVideo.id?.videoId === id)) {
      log("Using existing currentVideo from global state");
      setVideo(currentVideo);
      setLoading(false);
      return;
    }

    setLoading(true);
    log(`Fetching video metadata for id: ${id}`);

    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`
        );
        const data = await res.json();

        if (data.items?.length > 0) {
          const fetchedVideo = data.items[0];
          setVideo(fetchedVideo);
          setCurrentVideo(fetchedVideo); // Sync to global
          setIsPlaying(true);            // Tell miniplayer we're now playing
          log("Video fetched and global currentVideo updated");
        } else {
          setVideo(null);
          log("No video returned from API");
        }
      } catch (err) {
        log(`Video fetch error: ${err}`);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, currentVideo, setCurrentVideo, setIsPlaying]);

  useEffect(() => {
    if (video) {
      setPlaylist([video]);
      setCurrentIndex(0);
      log("Playlist set to single current video");
    }
  }, [video]);

  const handleEnded = () => {
    log("Video ended");
    setIsPlaying(false);
  };

  const currentTrack = playlist[currentIndex];
  const snippet = currentTrack?.snippet || {};
  const embedUrl = currentTrack?.id
    ? `https://www.youtube-nocookie.com/embed/${currentTrack.id}?autoplay=1&rel=0&controls=1&playsinline=1`
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
      <div style={{ height: "var(--header-height)" }} />
      <DebugOverlay pageName="Watch" />

      {loading && <Spinner message="Loading video…" />}

      {!loading && !currentTrack && (
        <div style={{ padding: 16 }}>
          <p>Video not found or unavailable.</p>
        </div>
      )}

      {!loading && currentTrack && (
        <>
          <h2 style={{ padding: "0 16px" }}>{snippet.title}</h2>
          <p style={{ padding: "0 16px", opacity: 0.7 }}>
            by {snippet.channelTitle}
          </p>

          {embedUrl && (
            <Player
              ref={playerRef}
              embedUrl={embedUrl}
              playing={isPlaying}
              onEnded={handleEnded}
              pipMode={false}
              draggable={false}
              trackTitle={snippet.title}
              style={{ width: "100%" }}
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
