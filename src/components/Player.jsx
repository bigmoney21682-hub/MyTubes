import React, { forwardRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";

const Player = forwardRef(
  ({ src, playing, onEnded, pipMode, overlayAudio, trackTitle }, ref) => {
    const [isPip, setIsPip] = useState(pipMode || false);
    const [adOverlayActive, setAdOverlayActive] = useState(true);

    // Start overlay audio immediately if provided
    useEffect(() => {
      if (overlayAudio && adOverlayActive) {
        overlayAudio.play().catch(() => {});
      }
    }, [overlayAudio, adOverlayActive]);

    // End ad overlay after fixed duration (simulate ad skip)
    useEffect(() => {
      const timer = setTimeout(() => setAdOverlayActive(false), 4000); // 4s ad simulation
      return () => clearTimeout(timer);
    }, []);

    return (
      <>
        {/* ReactPlayer handles main track */}
        <ReactPlayer
          ref={ref}
          url={src}
          width={isPip ? "320px" : "0px"}
          height={isPip ? "180px" : "0px"}
          playing={playing}
          controls={!isPip}
          volume={1}
          muted={adOverlayActive} // mute during simulated ad
          pip={isPip} // iOS PWA native PIP
          playsinline
          onEnded={onEnded}
          style={{ position: isPip ? "fixed" : "relative", bottom: 80, right: 16, zIndex: 9999, borderRadius: 8, overflow: "hidden", boxShadow: "0 0 12px rgba(0,0,0,0.5)" }}
        />

        {/* Mini player overlay info */}
        {isPip && (
          <div
            style={{
              position: "fixed",
              bottom: 80,
              right: 16,
              zIndex: 10000,
              background: "#111",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 12,
              pointerEvents: "none",
            }}
          >
            🎵 {trackTitle} {adOverlayActive ? "(Ad…)" : ""}
          </div>
        )}
      </>
    );
  }
);

export default Player;
