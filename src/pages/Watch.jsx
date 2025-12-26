// File: src/pages/Watch.jsx
// PCC v13.3 — Fully wired Watch page

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

  useEffect(() => {
    if (!id) return;

    async function load() {
      window.debugLog?.(`Watch: load video ${id}`, "WATCH");

      setLoading(true);

      try {
        const video = await fetchVideoDetails(id);
        playVideo(video, { replacePlaylist: true, playlist: [video] });
      } catch {
        window.debugLog?.("Failed to load video details", "ERROR");
      }

      setLoading(false);
    }

    load();
  }, [id, playVideo]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#000" }}>
      <div style={{ width: "100%", height: "40vh" }}>
        <Player />
      </div>

      {currentVideo && (
        <div style={{ padding: 16, color: "#fff" }}>
          <h2>{currentVideo.title}</h2>
          <p style={{ opacity: 0.7 }}>{currentVideo.channelTitle}</p>
        </div>
      )}

      <div style={{ padding: 16, color: "#fff" }}>
        <h3>Related Videos</h3>
        <RelatedVideos items={relatedVideos} />
      </div>
    </div>
  );
}
