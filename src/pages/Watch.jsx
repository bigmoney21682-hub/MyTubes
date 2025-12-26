// File: src/pages/Watch.jsx
// PCC v13.0 — Fully wired Watch page (YouTube-only)
// - Reads ?v=VIDEO_ID
// - Fetches metadata via api/youtube.js
// - Calls playVideo() to start playback
// - Renders Player overlay + metadata + related videos

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";
import { fetchVideoDetails } from "../api/youtube";
import Player from "../components/Player";
import RelatedVideos from "../components/RelatedVideos";

export default function Watch() {
  const [params] = useSearchParams();
  const id = params.get("v");

  const { playVideo, currentVideo, relatedVideos } = usePlayer();
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------
  // Load video metadata + start playback
  // ------------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      try {
        const video = await fetchVideoDetails(id);

        // Start playback (replace playlist with just this video)
        playVideo(video, {
          replacePlaylist: true,
          playlist: [video],
        });
      } catch (err) {
        console.error("Failed to load video:", err);
      }

      setLoading(false);
    }

    load();
  }, [id, playVideo]);

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div style={{ width: "100%", height: "100%", background: "#000" }}>
      {/* Player area */}
      <div style={{ width: "100%", height: "40vh" }}>
        <Player />
      </div>

      {/* Metadata */}
      {currentVideo && (
        <div style={{ padding: 16, color: "#fff" }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{currentVideo.title}</h2>
          <p style={{ opacity: 0.7, marginTop: 8 }}>
            {currentVideo.channelTitle}
          </p>
        </div>
      )}

      {/* Related videos */}
      <div style={{ padding: 16, color: "#fff" }}>
        <h3>Related Videos</h3>
        <RelatedVideos items={relatedVideos} />
      </div>
    </div>
  );
}
