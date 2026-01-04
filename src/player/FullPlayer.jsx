/**
 * ------------------------------------------------------------
 * File: FullPlayer.jsx
 * Path: src/player/FullPlayer.jsx
 * Description:
 *   Expanded full player UI shown when PlayerShell is expanded.
 *
 *   Contains:
 *     - 220px 16:9 video container (global iframe)
 *     - Title + channel
 *     - Autonext toggle
 *     - Add to playlist button
 *     - Collapse button
 *
 *   NOTE:
 *     - No routing
 *     - No autonext logic here (Home handles it)
 * ------------------------------------------------------------
 */

import React from "react";
import { usePlayer } from "./PlayerContext.jsx";

export default function FullPlayer({ meta, onCollapse }) {
  const {
    autonextMode,
    setAutonextMode,
    activePlaylistId
  } = usePlayer();

  const { title, channel } = meta;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Global iframe container (already mounted in App.jsx) */}
      <div
        style={{
          width: "100%",
          height: "220px",
          background: "#000"
        }}
      >
        {/* iframe lives in #player (App.jsx) */}
      </div>

      {/* Metadata + controls */}
      <div style={{ padding: "12px" }}>
        {/* Title */}
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "4px"
          }}
        >
          {title || "Loading…"}
        </div>

        {/* Channel */}
        <div
          style={{
            fontSize: "13px",
            color: "#aaa",
            marginBottom: "12px"
          }}
        >
          {channel || ""}
        </div>

        {/* Controls row */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center"
          }}
        >
          {/* Autonext toggle */}
          <button
            onClick={() =>
              setAutonextMode(
                autonextMode === "related" ? "playlist" : "related"
              )
            }
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Autonext: {autonextMode}
          </button>

          {/* Add to playlist */}
          <button
            onClick={() => {
              window.bootDebug?.player("FullPlayer → add to playlist");
              window.dispatchEvent(
                new CustomEvent("openPlaylistPicker", {
                  detail: { playlistId: activePlaylistId }
                })
              );
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            + Playlist
          </button>

          {/* Collapse */}
          <button
            onClick={onCollapse}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            ⇩
          </button>
        </div>
      </div>
    </div>
  );
}
