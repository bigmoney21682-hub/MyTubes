// File: src/components/Player.jsx
// PCC v12.0 — Minimal overlay for global YouTube player (wired to PlayerContext)
// Changes:
// - Switched from togglePlay (non-existent) to setPlaying from PlayerContext
// - Wired double-tap skip to seekRelative from PlayerContext
// - Kept duration/currentTime/buffered/playerState as safe placeholders
// - Ensured no dependencies on removed utils or missing context fields

import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export default function Player() {
  const {
    playing,
    setPlaying,
    playNext,
    playPrev,
    seekRelative,
  } = usePlayer();

  // ------------------------------------------------------------
  // SAFE DEFAULTS (will be upgraded when GlobalPlayer exposes metrics)
  // ------------------------------------------------------------
  const duration = 0;
  const currentTime = 0;
  const buffered = 0;
  const playerState = "ready"; // avoid permanent "Preparing video…" overlay

  // ------------------------------------------------------------
  // UI State
  // ------------------------------------------------------------
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [ripple, setRipple] = useState(null);

  const hideTimer = useRef(null);
  const containerRef = useRef(null);

  // ------------------------------------------------------------
  // Auto-hide controls
  // ------------------------------------------------------------
  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    showControls();
    return () => clearTimeout(hideTimer.current);
  }, []);

  // ------------------------------------------------------------
  // Loading overlay logic
  // ------------------------------------------------------------
  const isLoading =
    playerState === "unstarted" ||
    playerState === "buffering" ||
    playerState === "loading";

  // ------------------------------------------------------------
  // Double-tap skip (uses seekRelative from PlayerContext)
  // ------------------------------------------------------------
  const handleDoubleTap = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const isLeft = x < rect.width / 2;
    const skipAmount = isLeft ? -10 : 10;

    setRipple({
      x,
      y: e.clientY - rect.top,
      key: Date.now(),
    });

    // Use context-level relative seek instead of local seekTo
    seekRelative(skipAmount);
    showControls();
  };

  // ------------------------------------------------------------
  // Tap to toggle controls
  // ------------------------------------------------------------
  const handleTap = () => {
    if (controlsVisible) {
      setControlsVisible(false);
      clearTimeout(hideTimer.current);
    } else {
      showControls();
    }
  };

  // ------------------------------------------------------------
  // Scrubbing (UI only for now; duration/currentTime are placeholders)
  // ------------------------------------------------------------
  const handleScrubStart = (e) => {
    if (!duration) return;
    setIsScrubbing(true);
    const rect = e.target.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setScrubTime(duration * pct);
  };

  const handleScrubMove = (e) => {
    if (!isScrubbing || !duration) return;
    const rect = e.target.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setScrubTime(duration * pct);
  };

  const handleScrubEnd = () => {
    // When we wire real duration/currentTime, this should call a real seek
    setIsScrubbing(false);
  };

  // ------------------------------------------------------------
  // Format time
  // ------------------------------------------------------------
  const fmt = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const effectiveTime = isScrubbing ? scrubTime : currentTime;
  const progressPct = duration ? (effectiveTime / duration) * 100 : 0;
  const bufferedPct = buffered ? buffered * 100 : 0;

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "transparent",
        overflow: "hidden",
      }}
      onClick={handleTap}
      onDoubleClick={handleDoubleTap}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            transition: "opacity 0.3s",
          }}
        >
          <p style={{ color: "#fff", fontSize: 18, opacity: 0.8 }}>
            Preparing video…
          </p>
        </div>
      )}

      {/* Ripple animation */}
      {ripple && (
        <div
          key={ripple.key}
          style={{
            position: "absolute",
            left: ripple.x - 40,
            top: ripple.y - 40,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            animation: "ripple 0.4s ease-out",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Controls */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: controlsVisible ? 1 : 0,
          transition: "opacity 0.3s",
          zIndex: 10,
          pointerEvents: controlsVisible ? "auto" : "none",
        }}
      >
        {/* Top spacer */}
        <div style={{ height: "20%" }} />

        {/* Center controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            alignItems: "center",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              playPrev();
              showControls();
            }}
            style={iconStyle}
          >
            ⏮
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlaying((prev) => !prev);
              showControls();
            }}
            style={iconStyle}
          >
            {playing ? "⏸" : "▶"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
              showControls();
            }}
            style={iconStyle}
          >
            ⏭
          </button>
        </div>

        {/* Bottom controls */}
        <div style={{ padding: "0 16px 16px 16px" }}>
          {/* Time labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "#fff",
              opacity: 0.9,
              marginBottom: 6,
            }}
          >
            <span>{fmt(effectiveTime)}</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              position: "relative",
              height: 4,
              background: "rgba(255,255,255,0.25)",
              borderRadius: 2,
              cursor: "pointer",
            }}
            onMouseDown={handleScrubStart}
            onMouseMove={handleScrubMove}
            onMouseUp={handleScrubEnd}
            onMouseLeave={handleScrubEnd}
          >
            {/* Buffered */}
            <div
              style={{
                position: "absolute",
                height: "100%",
                width: `${bufferedPct}%`,
                background: "rgba(255,255,255,0.4)",
                borderRadius: 2,
              }}
            />

            {/* Played */}
            <div
              style={{
                position: "absolute",
                height: "100%",
                width: `${progressPct}%`,
                background: "#fff",
                borderRadius: 2,
              }}
            />

            {/* Scrubber handle */}
            {isScrubbing && (
              <div
                style={{
                  position: "absolute",
                  left: `${progressPct}%`,
                  top: -4,
                  width: 12,
                  height: 12,
                  background: "#fff",
                  borderRadius: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Icon style
// ------------------------------------------------------------
const iconStyle = {
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: 32,
  fontWeight: 500,
  cursor: "pointer",
  padding: 0,
  userSelect: "none",
};
