/**
 * File: VideoCard.jsx
 * Path: src/components/VideoCard.jsx
 * Description:
 *   Renders a clickable video card with thumbnail, title,
 *   channel name, and normalized video ID.
 */

import React from "react";
import { Link } from "react-router-dom";

import normalizeId from "../utils/normalizeId.js";   // ✅ FIXED
// (was: import { normalizeId } from "../utils/normalizeId.js")

export default function VideoCard({ item, index = 0 }) {
  if (!item) return null;

  const id = normalizeId(item);
  if (!id) {
    window.bootDebug?.warn("VideoCard.jsx → Invalid video item", item);
    return null;
  }

  const snippet = item.snippet || {};
  const thumb = snippet?.thumbnails?.medium?.url || "";
  const title = snippet?.title || "Untitled";
  const channel = snippet?.channelTitle || "Unknown Channel";

  return (
    <Link
      to={`/watch/${id}?src=card`}
      style={{
        display: "block",
        marginBottom: "20px",
        color: "#fff",
        textDecoration: "none"
      }}
    >
      <img
        src={thumb}
        alt={title}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          objectFit: "cover",
          borderRadius: "8px",
          marginBottom: "8px"
        }}
      />

      <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
        {title}
      </div>

      <div style={{ fontSize: "13px", opacity: 0.7 }}>
        {channel}
      </div>
    </Link>
  );
}
