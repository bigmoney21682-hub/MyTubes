// File: src/pages/Watch.jsx
// PCC v2.1 — Clean layout, related videos fix, custom player controls

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
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

    // Reuse global currentVideo if it matches this id
    if (
      currentVideo &&
      (currentVideo.id === id || currentVideo.id?.videoId === id)
    ) {
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
          setCurrentVideo(fetchedVideo);
          setIsPlaying(true);
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
    // Later: auto-advance in playlist
  };

  const currentTrack = playlist[currentIndex];
  const snippet = currentTrack?.snippet || {};

  // Normalized videoId for API and embed
  const videoIdForApi =
    typeof currentTrack?.id === "string"
      ? currentTrack.id
      : currentTrack?.id?.videoId || "";

  const embedUrl = videoIdForApi
    ? `https://www.youtube-nocookie.com/embed/${videoIdForApi}`
    : "";

  // Seek relative handler used by Player paused overlay
  const handleSeekRelative = (secs) => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const current = player.getCurrentTime?.() || 0;
      player.seekTo(current + secs, "seconds");
      log(`Seeked ${secs} seconds (${current} -> ${current + secs})`);
    } catch (e) {
      log(`Seek error: ${e}`);
    }
  };

  const handlePrev = () => {
    // Placeholder for multi-video playlist
    log("Prev video requested (no previous in single-item playlist)");
  };

  const handleNext = () => {
    // Placeholder for multi-video playlist
    log("Next video requested (no next in single-item playlist)");
  };

  return (
    <div
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom: "var(--footer-height)",
        background: "var(--app-bg)",
        color: "#fff",
      }}
    >
      <DebugOverlay pageName="Watch" />

      {loading && <Spinner message="Loading video…" />}

      {!loading && !currentTrack && (
        <div style={{ padding: 16 }}>
          <p>Video not found or unavailable.</p>
        </div>
      )}

      {!loading && currentTrack && (
        <>
          {/* Video */}
          {embedUrl && (
            <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
              <Player
                ref={playerRef}
                embedUrl={embedUrl}
                playing={isPlaying}
                onEnded={handleEnded}
                pipMode={false}
