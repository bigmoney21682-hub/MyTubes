// File: src/components/Player.jsx
// PCC v5.0 — UI-only hero player (no ReactPlayer, uses global YouTube iframe)
// All audio/video comes from GlobalPlayer; this is just controls + gestures.

import React from "react";
import { usePlayer } from "../contexts/PlayerContext";

const Player = React.forwardRef(function Player(
  {
    // embedUrl is kept for compatibility with Watch.jsx but unused now
    embedUrl,
    playing,
    onEnded, // unused, end is handled by GlobalPlayer via onStateChange
  },
  ref
) {
  const { playPrev, playNext, togglePlay } = usePlayer();

  const log = (msg) => window.debugLog?.(`Player(UI): ${msg}`);

  const circleStyle = {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 22,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
    userSelect: "none",
  };

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Centered 3-button control row */}
      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Previous */}
        <div
          style={circleStyle}
          onClick={(e) => {
            e.stopPropagation();
            log("Prev clicked");
            playPrev();
          }}
        >
          ⏮
        </div>

        {/* Play / Pause */}
        <div
          style={circleStyle}
          onClick={(e) => {
            e.stopPropagation();
            const newState = !playing;
            log(`Play/Pause clicked -> newPlaying=${newState}`);
            togglePlay();
          }}
        >
          {playing ? "⏸" : "▶"}
        </div>

        {/* Next */}
        <div
          style={circleStyle}
          onClick={(e) => {
            e.stopPropagation();
            log("Next clicked");
            playNext();
          }}
        >
          ⏭
        </div>
      </div>
    </div>
  );
});

export default Player;
