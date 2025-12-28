/**
 * File: MiniPlayer.jsx
 * Path: src/components/MiniPlayer.jsx
 * Description: Global mini‑player UI that controls the persistent GlobalPlayer.
 *              Appears when a video is playing AND user is not on /watch/:id.
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePlayer } from "../player/PlayerContext.jsx";
import { GlobalPlayer } from "../player/GlobalPlayer.js";
import { debugBus } from "../debug/debugBus.js";

export default function MiniPlayer() {
  const {
    currentVideoId,
    isPlaying,
    togglePlay
  } = usePlayer();

  const navigate = useNavigate();
  const location = useLocation();

  // Hide on watch page
  if (!currentVideoId) return null;
  if (location.pathname.startsWith("/watch/")) return null;

  const thumbnail = `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`;

  function openFullPlayer() {
    debugBus.player("MiniPlayer → Navigate to /watch/" + currentVideoId);
    navigate(`/watch/${currentVideoId}`);
  }

  function handlePlayPause(e) {
    e.stopPropagation();
    togglePlay();
  }

  return (
    <div
      onClick={openFullPlayer}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "#111",
        display: "flex",
        alignItems: "center",
        padding: "8px",
        borderTop: "1px solid #333",
        cursor: "pointer",
        zIndex: 9999
      }}
    >
      <img
        src={thumbnail}
        alt="thumbnail"
        style={{
          width: "96px",
          height: "54px",
          objectFit: "cover",
          borderRadius: "4px",
          marginRight: "12px"
        }}
      />

      <div style={{ flex: 1, color: "#fff", fontSize: "14px" }}>
        {currentVideoId}
      </div>

      <button
        onClick={handlePlayPause}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "20px",
          border: "none",
          background: "#222",
          color: "#fff",
          fontSize: "18px",
          marginLeft: "12px"
        }}
      >
        {isPlaying ? "❚❚" : "▶"}
      </button>
    </div>
  );
}
