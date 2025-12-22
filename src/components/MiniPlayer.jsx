// File: src/components/MiniPlayer.jsx
// PCC v2.4 — Reads from PlayerContext, sits above DebugOverlay

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export default function MiniPlayer({ onTogglePlay, onClose }) {
  const navigate = useNavigate();
  const { currentVideo, playing } = usePlayer();

  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const log = (msg) => window.debugLog?.(`MiniPlayer: ${msg}`);

  useEffect(() => {
    if (!currentVideo) return;

    if (currentVideo.snippet) {
      setTitle(currentVideo.snippet.title || "Unknown Video");
      setChannel(currentVideo.snippet.channelTitle || "");
      setThumbnail(
        currentVideo.snippet.thumbnails?.default?.url ||
          currentVideo.snippet.thumbnails?.medium?.url ||
          ""
      );
    } else {
      setTitle(currentVideo.title || "Unknown Video");
      setChannel(currentVideo.author || "");
      setThumbnail(currentVideo.thumbnail || "");
    }
  }, [currentVideo]);

  if (!currentVideo) return null;

  const handleClick = () => {
    const id =
      typeof currentVideo.id === "string"
        ? currentVideo.id
        : currentVideo.id?.videoId;
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
        bottom: "calc(var(--footer-height) + 84px)", // above debug overlay
        left: 0,
        right: 0,
        height: "68px",
        background: "#111",
        borderTop: "1px solid #333",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        zIndex: 10001,
        boxShadow: "0 -4px 12px rgba(0,0,0,0.5)",
      }}
      onClick={handleClick}
    >
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

      <button
        onClick={(e) => {
          e.stopPropagation();
          log(`Toggle play clicked, playing=${playing}`);
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
        {playing ? "⏸" : "▶"}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          log("Close clicked");
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
