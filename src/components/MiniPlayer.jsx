// File: src/components/MiniPlayer.jsx
// Persistent miniplayer for background play support (Musi-style)
// PCC v2.0 — Robust to mixed video shapes + debug logging

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MiniPlayer({
  currentVideo,
  isPlaying,
  onTogglePlay,
  onClose,
}) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const log = (msg) => window.debugLog?.(`MiniPlayer: ${msg}`);

  // Normalize video data (supports raw YouTube item or normalized video)
  useEffect(() => {
    if (!currentVideo) {
      log("No currentVideo, miniplayer hidden");
      return;
    }

    log(
      `currentVideo updated: id=${currentVideo.id || currentVideo.videoId || "unknown"}`
    );

    // Raw API item: { snippet: { title, channelTitle, thumbnails } }
    if (currentVideo.snippet) {
      setTitle(currentVideo.snippet.title || "Unknown Video");
      setChannel(currentVideo.snippet.channelTitle || "");
      setThumbnail(
        currentVideo.snippet.thumbnails?.default?.url ||
          currentVideo.snippet.thumbnails?.medium?.url ||
          ""
      );
      return;
    }

    // Normalized video object: { title, author, thumbnail }
    setTitle(currentVideo.title || "Unknown Video");
    setChannel(currentVideo.author || "");
    setThumbnail(currentVideo.thumbnail || "");
  }, [currentVideo]);

  if (!currentVideo) return null;

  const handleClick = () => {
    const id = currentVideo.id || currentVideo.videoId;
    if (!id) {
      log("No valid id on currentVideo, cannot navigate to watch");
      return;
    }
    log(`Navigating back to /watch/${id} from miniplayer`);
    navigate(`/watch/${id}`);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "68px",
        background: "#111",
        borderTop: "1px solid #333",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        zIndex: 999,
        boxShadow: "0 -4px 12px rgba(0,0,0,0.5)",
      }}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <img
        src={thumbnail}
        alt=""
        style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          marginRight: 12,
          objectFit: "cover",
          background: "#000",
        }}
      />

      {/* Title + channel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "4px 0 0 0",
            fontSize: 13,
            opacity: 0.7,
          }}
        >
          {channel}
        </p>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          log(`Toggle play clicked, isPlaying=${isPlaying}`);
          onTogglePlay();
        }}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: 32,
          cursor: "pointer",
          padding: "8px 16px",
        }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          log("Close clicked, clearing currentVideo");
          onClose();
        }}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: 24,
          cursor: "pointer",
          padding: "8px",
        }}
      >
        ✕
      </button>
    </div>
  );
}
