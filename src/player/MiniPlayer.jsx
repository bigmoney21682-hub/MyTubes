/**
 * File: MiniPlayer.jsx
 * Path: src/player/MiniPlayer.jsx
 * Description:
 *   Compact floating mini-player that appears during navigation.
 *   Shows thumbnail, title, and allows quick return to full Watch page.
 */

import React from "react";
import { Link } from "react-router-dom";

import normalizeId from "../utils/normalizeId.js";   // ✅ FIXED PATH
// (was: import { normalizeId } from "../utils/normalizeId.js")

export default function MiniPlayer({ video, onClose }) {
  if (!video) return null;

  const id = normalizeId(video);
  if (!id) {
    window.bootDebug?.warn("MiniPlayer.jsx → Invalid video object", video);
    return null;
  }

  const snippet = video.snippet || {};
  const thumb = snippet?.thumbnails?.medium?.url || "";
  const title = snippet?.title || "Untitled";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        width: "260px",
        background: "#111",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 0 12px rgba(0,0,0,0.6)",
        zIndex: 9999
      }}
    >
      <Link
        to={`/watch/${id}?src=miniplayer`}
        style={{ textDecoration: "none", color: "#fff" }}
      >
        <img
          src={thumb}
          alt={title}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            objectFit: "cover"
          }}
        />

        <div style={{ padding: "8px" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "4px"
            }}
          >
            {title}
          </div>
        </div>
      </Link>

      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          background: "rgba(0,0,0,0.6)",
          border: "none",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        ✕
      </button>
    </div>
  );
}
