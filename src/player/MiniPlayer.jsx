/**
 * File: MiniPlayer.jsx
 * Path: src/player/MiniPlayer.jsx
 * Description: stale build
 *   Compact bar under the header when player is collapsed.
 *   - Shows current title + thumbnail
 *   - Play/Pause controls real YouTube iframe via GlobalPlayer
 *   - Expand button shows FullPlayer
 */

import React, { useContext } from "react";
import { PlayerContext } from "./PlayerContext.jsx";
import { GlobalPlayer } from "./GlobalPlayerFix.js";

export default function MiniPlayer({ onExpand }) {
  const { currentId, currentMeta, isPlaying, setIsPlaying } =
    useContext(PlayerContext);

  if (!currentId) return null;

  const title = currentMeta?.title || "Now playing";
  const thumbnail = currentMeta?.thumbnail || "";

  function handleTogglePlay(e) {
    e.stopPropagation();

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
        background: "#111",
        borderBottom: "1px solid #222",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          overflow: "hidden",
          flexShrink: 0,
          background: "#000"
        }}
      >
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        )}
      </div>

      {/* Title */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontSize: 14,
          fontWeight: 600
        }}
      >
        {title}
      </div>

      {/* Play/Pause */}
      <button
        onClick={handleTogglePlay}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "none",
          background:
            "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
          cursor: "pointer"
        }}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      {/* Expand */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "none",
          background: "#333",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
          cursor: "pointer"
        }}
      >
        Expand
      </button>
    </div>
  );
}
