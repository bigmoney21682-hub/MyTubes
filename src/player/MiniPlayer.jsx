/**
 * File: MiniPlayer.jsx
 * Path: src/player/MiniPlayer.jsx
 */

import React from "react";
import { GlobalPlayer } from "./GlobalPlayerFix.js";

export default function MiniPlayer({ meta, onExpand }) {
  if (!meta) return null;

  const { title, thumbnail } = meta;

  return (
    <div
      onClick={onExpand}
      style={{
        height: "48px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "4px 8px",
        background: "#000",
        cursor: "pointer",
        userSelect: "none",
        position: "relative"   // ⭐ required for iframe layering
      }}
    >
      {/* ⭐ GlobalPlayerFix iframe mount point (must exist in BOTH Mini + Full) */}
      <div
        id="global-player-iframe"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,            // invisible but present
          pointerEvents: "none", // UI stays clickable
          zIndex: 0
        }}
      />

      {/* UI sits above iframe */}
      <div style={{ display: "flex", alignItems: "center", width: "100%", zIndex: 1 }}>
        {/* Thumbnail */}
        <img
          src={thumbnail}
          alt={title}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            objectFit: "cover",
            flexShrink: 0
          }}
        />

        {/* Title */}
        <div
          style={{
            flex: 1,
            marginLeft: "10px",
            fontSize: "14px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {title || "Loading…"}
        </div>

        {/* Play/Pause button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            GlobalPlayer.togglePlay();
          }}
          style={{
            marginLeft: "8px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            background:
              "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
            color: "#fff",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          ▶︎
        </button>

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          style={{
            marginLeft: "8px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            background:
              "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          ⇧
        </button>
      </div>
    </div>
  );
}
