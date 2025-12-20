// File: src/components/Player.jsx

import React, { forwardRef, useEffect } from "react";
import ReactPlayer from "react-player";

const Player = forwardRef(({ src, playing, title, author }, ref) => {
  useEffect(() => {
    if (!src) return;
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || "Playing",
        artist: author || "Unknown",
        artwork: [
          { src: "/favicon.png", sizes: "512x512", type: "image/png" }
        ]
      });

      navigator.mediaSession.setActionHandler("play", () => {});
      navigator.mediaSession.setActionHandler("pause", () => {});
      navigator.mediaSession.setActionHandler("previoustrack", () => {});
      navigator.mediaSession.setActionHandler("nexttrack", () => {});
    }
  }, [src, title, author]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 60,
        background: "#000",
        zIndex: 9999
      }}
    >
      <ReactPlayer
        ref={ref}
        url={src}
        playing={playing}
        controls
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
        playsinline
      />
    </div>
  );
});

export default Player;
