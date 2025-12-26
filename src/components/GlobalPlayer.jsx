// File: src/components/GlobalPlayer.jsx
// Fixed-position YouTube iframe player (YouTube-only, reduced YouTube chrome)

import React from "react";
import { usePlayer } from "../contexts/PlayerContext";

export default function GlobalPlayer() {
  const { currentVideo } = usePlayer();

  if (!currentVideo?.id) return null;

  const videoId = currentVideo.id;

  // YouTube embed parameters to minimize overlays/branding:
  // - autoplay=1         → auto-play when loaded
  // - playsinline=1      → no forced fullscreen on iOS
  // - controls=1         → keep normal controls (you can set 0 if you want full custom)
  // - modestbranding=1   → reduce large YouTube logo
  // - rel=0              → no unrelated videos at the end (only same-channel)
  // - iv_load_policy=3   → hide annotations and video cards
  // - fs=0               → hide fullscreen button if you want tighter chrome
  // - disablekb=0        → allow keyboard controls (desktop)
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1&modestbranding=1&rel=0&iv_load_policy=3&fs=1&disablekb=0`;

  const handleIframeError = () => {
    window.debugLog?.(
      `GlobalPlayer iframe failed to load for id=${videoId}`,
      "ERROR"
    );
  };

  return (
    <div
      id="yt-global-player"
      style={{
        position: "fixed",
        top: "var(--header-height)",
        left: 0,
        width: "100%",
        height: "56.25vw", // 16:9
        maxHeight: "360px",
        background: "#000",
        zIndex: 99990,
      }}
    >
      <iframe
        src={src}
        title={`Playing: ${currentVideo.title || videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        onError={handleIframeError}
      />
    </div>
  );
}
