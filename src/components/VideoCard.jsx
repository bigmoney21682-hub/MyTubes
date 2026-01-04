/**
 * File: VideoCard.jsx
 * Path: src/components/VideoCard.jsx
 * Description:
 *   Renders a clickable video card with thumbnail, title,
 *   channel name, and normalized video ID.
 */

import React from "react";

import normalizeId from "../utils/normalizeId.js";
import { usePlayer } from "../player/PlayerContext.jsx";
import { playVideo } from "../utils/playVideo.js";

export default function VideoCard({ item, index = 0 }) {
  const player = usePlayer();

  if (!item) {
    window.bootDebug?.router("VideoCard.jsx → item is null/undefined");
    return null;
  }

  // Log raw upstream item
  try {
    window.bootDebug?.router(
      "VideoCard.jsx → raw item = " + JSON.stringify(item)
    );
  } catch (_) {}

  const id = normalizeId(item);

  // Log normalized ID
  window.bootDebug?.router(
    "VideoCard.jsx → normalizeId(item) = " + JSON.stringify(id)
  );

  if (!id) {
    window.bootDebug?.router(
      "VideoCard.jsx → INVALID ID, skipping card. Upstream item = " +
        JSON.stringify(item)
    );
    return null;
  }

  const snippet = item.snippet || {};
  const thumb = snippet?.thumbnails?.medium?.url || "";
  const title = snippet?.title || "Untitled";
  const channel = snippet?.channelTitle || "Unknown Channel";

  // Log intent
  window.bootDebug?.router(
    `VideoCard.jsx → CLICK → playVideo(${id})`
  );

  function handleClick() {
    playVideo({
      id,
      title,
      thumbnail: thumb,
      channel,
      player,
      autonext: "related" // default behavior for cards
    });
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: "block",
        marginBottom: "20px",
        color: "#fff",
        textDecoration: "none",
        cursor: "pointer"
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
    </div>
  );
}
