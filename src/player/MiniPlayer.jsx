/**
 * File: MiniPlayer.jsx
 * Path: src/player/MiniPlayer.jsx
 * Description: Persistent bottom mini-player UI that reflects the global
 *              playback state. Shows current video ID, play/pause controls,
 *              and queue navigation. Fully safe for iOS/Safari and StrictMode.
 */

import React, { useEffect, useState } from "react";
import { usePlayer } from "./PlayerContext.jsx";
import { GlobalPlayer } from "./GlobalPlayer.js";
import { QueueStore } from "./QueueStore.js";
import { debugBus } from "../debug/debugBus.js";

export default function MiniPlayer() {
  const player = usePlayer() ?? {};

  const currentId = player.currentId ?? null;
  const loadVideo = player.loadVideo ?? (() => {});

  const [isPlaying, setIsPlaying] = useState(false);

  // ------------------------------------------------------------
  // Listen to GlobalPlayer state changes
  // ------------------------------------------------------------
  useEffect(() => {
    debugBus.player("MiniPlayer → Mount");

    const handler = (state) => {
      debugBus.player("MiniPlayer → Player state: " + state);
      setIsPlaying(state === "playing");
    };

    GlobalPlayer.onStateChange = handler;

    return () => {
      GlobalPlayer.onStateChange = null;
    };
  }, []);

  // ------------------------------------------------------------
  // Controls
  // ------------------------------------------------------------
  function togglePlay() {
    try {
      if (!GlobalPlayer.player) return;

      if (isPlaying) {
        debugBus.player("MiniPlayer → pause()");
        GlobalPlayer.player.pauseVideo();
      } else {
        debugBus.player("MiniPlayer → play()");
        GlobalPlayer.player.playVideo();
      }
    } catch (err) {
      debugBus.player("MiniPlayer.togglePlay error: " + (err?.message || err));
    }
  }

  function playNextInQueue() {
    const next = QueueStore.next();
    if (!next) {
      debugBus.player("MiniPlayer → No next item in queue");
      return;
    }

    debugBus.player("MiniPlayer → Next in queue → " + next);
    loadVideo(next);
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (!currentId) {
    return null; // No video loaded → no mini-player
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "#111",
        borderTop: "1px solid #333",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        color: "#fff",
        zIndex: 9999
      }}
    >
      {/* Video ID (placeholder for future metadata) */}
      <div style={{ flex: 1, fontSize: "14px", opacity: 0.8 }}>
        Playing: {currentId}
      </div>

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        style={{
          marginRight: "12px",
          padding: "6px 10px",
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: "4px"
        }}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      {/* Next in queue */}
      <button
        onClick={playNextInQueue}
        style={{
          padding: "6px 10px",
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: "4px"
        }}
      >
        Next ▶
      </button>
    </div>
  );
}
