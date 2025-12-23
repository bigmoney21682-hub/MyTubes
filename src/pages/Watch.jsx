// File: src/pages/Watch.jsx
// PCC v3.6 — API key from .env + route-aware audio engine + stable video loading

import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";
import Player from "../components/Player";

const INVIDIOUS_BASE = "https://yewtu.be";

export default function Watch() {
  const { id } = useParams();
  const location = useLocation();
  const { playVideo, playing } = usePlayer();

  const [video, setVideo] = useState(null);
  const [embedUrl, setEmbedUrl] = useState("");

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const log = (msg) => window.debugLog?.(`Watch: ${msg}`);

  // ---------------------------------------------------------
  // 1. Route-aware global audio engine toggle
  // ---------------------------------------------------------
  useEffect(() => {
    // Default: audio enabled
    window.__GLOBAL_AUDIO_ENABLED = true;

    if (location.pathname.startsWith("/watch")) {
      log("Global audio engine disabled for Watch page");
      window.__GLOBAL_AUDIO_ENABLED = false;
    }

    return () => {
      // When leaving Watch, ALWAYS re-enable audio
      window.__GLOBAL_AUDIO_ENABLED = true;
      log("Global audio engine re-enabled on cleanup");
    };
  }, [location.pathname]);

  // ---------------------------------------------------------
  // 2. Fetch video data (Invidious → YouTube fallback)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    async function loadVideo() {
      log(`Trying Invidious: ${INVIDIOUS_BASE}/api/v1/videos/${id}`);

      // Try Invidious first
      try {
        const invRes = await fetch(`${INVIDIOUS_BASE}/api/v1/videos/${id}`);
        const invData = await invRes.json();

        if (invData && invData.title) {
          log("Loaded from Invidious");

          const normalized = {
            id,
            title: invData.title,
            description: invData.description,
            channelTitle: invData.author,
            thumbnails: [
              { url: invData.thumbnail },
              { url: invData.thumbnailUrl },
            ],
          };

          setVideo(normalized);
          playVideo(normalized);
          return;
        }
      } catch (err) {
        log(`Invidious failed: ${err}`);
      }

      // Fallback → YouTube API
      log("Fallback → YouTube API");

      try {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${API_KEY}`
        );

        const ytData = await ytRes.json();

        if (ytData.items && ytData.items.length > 0) {
          const item = ytData.items[0];
          log(`Raw video object: ${JSON.stringify(item).slice(0, 200)}...`);

          const normalized = {
            id,
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            thumbnails: Object.values(item.snippet.thumbnails || {}),
          };

          setVideo(normalized);
          playVideo(normalized);
        }
      } catch (err) {
        log(`YouTube API error: ${err}`);
      }
    }

    loadVideo();
  }, [id, API_KEY, playVideo]);

  // ---------------------------------------------------------
  // 3. Build embed URL for ReactPlayer
  // ---------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const url = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1`;
    setEmbedUrl(url);
  }, [id]);

  // ---------------------------------------------------------
  // 4. Render
  // ---------------------------------------------------------
  return (
    <div style={{ width: "100%", height: "100%", background: "#000" }}>
      <div style={{ width: "100%", height: "40vh" }}>
        <Player embedUrl={embedUrl} playing={playing} />
      </div>

      {/* Video title */}
      {video && (
        <div style={{ padding: 16, color: "#fff" }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{video.title}</h2>
          <p style={{ opacity: 0.7, marginTop: 8 }}>{video.channelTitle}</p>
        </div>
      )}

      {/* Related videos section (we’ll restore this next) */}
      <div style={{ padding: 16, color: "#fff" }}>
        <h3>Related Videos</h3>
        <p style={{ opacity: 0.5 }}>Coming soon…</p>
      </div>
    </div>
  );
}
