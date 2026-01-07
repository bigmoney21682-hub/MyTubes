/**
 * File: FullPlayer.jsx
 * Path: src/player/FullPlayer.jsx
 * Description:
 *   Expanded player UI that overlays the 220px iframe area.
 *   - NOT fullscreen
 *   - Uses PlayerContext for meta + isPlaying
 *   - Play/Pause controls real YouTube iframe via GlobalPlayer
 *   - Collapse returns to MiniPlayer
 */

import React, { useContext } from "react";
import { PlayerContext } from "./PlayerContext.jsx";
import { GlobalPlayer } from "./GlobalPlayerFix.js";

export default function FullPlayer({ onClose }) {
  const { currentId, currentMeta, isPlaying, setIsPlaying } =
    useContext(PlayerContext);

  if (!currentId) return null;

  const title = currentMeta?.title || "Now playing";
  const thumbnail = currentMeta?.thumbnail || "";

  function handleTogglePlay() {
    if (!GlobalPlayer.player) return;

    if (isPlaying) {
      GlobalPlayer.player.pauseVideo();
    } else {
      GlobalPlayer.player.playVideo();
    }

    setIsPlaying(!isPlaying);
  }

  return (
    <div
      style={{
        width: "100%",
        height: 220,
        background: "#000",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid #222"
      }}
    >
      {/* Background thumbnail */}
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.7)"
          }}
        />
      )}

      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2))"
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "10px 12px",
          color: "#fff"
        }}
      >
        {/* Top row: collapse */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "none",
              background: "#333",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Collapse
          </button>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            textShadow: "0 0 4px rgba(0,0,0,0.8)",
            marginBottom: 6
          }}
        >
          {title}
        </div>

        {/* Bottom controls */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleTogglePlay}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background:
                "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      </div>
    </div>
  );
}
