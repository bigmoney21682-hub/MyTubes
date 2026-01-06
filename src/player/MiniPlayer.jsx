/**
 * File: MiniPlayer.jsx
 * Path: src/player/MiniPlayer.jsx
 * Description:
 *   Compact bottom player that:
 *     - Shows current video title + thumbnail
 *     - Shows play/pause UI state
 *     - Expands to FullPlayer on tap
 *     - Does NOT own playback logic (GlobalPlayerFix does)
 */

import React, { useContext } from "react";
import { PlayerContext } from "./PlayerContext.jsx";

function dbg(label, data = {}) {
  console.group(`[MINIPLAYER] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

export default function MiniPlayer({ onExpand }) {
  const {
    currentId,
    currentMeta,
    isPlaying,
    setIsPlaying
  } = useContext(PlayerContext);

  if (!currentId) return null;

  const title = currentMeta?.title || "Now playing";
  const thumbnail = currentMeta?.thumbnail || "";

  function handleTogglePlay(e) {
    e.stopPropagation(); // prevent expanding FullPlayer
    const next = !isPlaying;
    dbg("togglePlay()", { next });
    setIsPlaying(next);
  }

  return (
    <div
      onClick={onExpand}
      style={{
        width: "100%",
        background: "#111",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.4)"
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "6px",
          overflow: "hidden",
          background: "#000",
          flexShrink: 0
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
          fontSize: "14px",
          fontWeight: 600
        }}
      >
        {title}
      </div>

      {/* Play/Pause */}
      <button
        onClick={handleTogglePlay}
        style={{
          padding: "6px 12px",
          borderRadius: "999px",
          border: "none",
          background:
            "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0
        }}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
