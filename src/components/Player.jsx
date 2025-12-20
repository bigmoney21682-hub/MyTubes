// File: src/components/Player.jsx

import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";

export default function Player({ src, onEnded }) {
  const playerRef = useRef(null);

  useEffect(() => {
    // Optional: focus on mobile for iOS autoplay fix
    const audioElement = playerRef.current?.getInternalPlayer();
    if (audioElement) {
      audioElement.setAttribute("playsinline", true);
      audioElement.setAttribute("webkit-playsinline", true);
    }
  }, [src]);

  return (
    <div>
      {/* Audio-first approach, hide video but keep playing */}
      <ReactPlayer
        ref={playerRef}
        url={src}
        playing
        controls
        width="0"
        height="0"
        playsinline
        onEnded={onEnded}
        config={{
          youtube: {
            playerVars: {
              // Minimal YouTube player options
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              controls: 1,
            },
          },
        }}
      />
    </div>
  );
}
