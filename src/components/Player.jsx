// File: src/components/Player.jsx
// PCC v2.0 — Custom paused controls overlay, minimal YouTube chrome

import React, { forwardRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";

const Player = forwardRef(
  (
    {
      embedUrl,
      playing,
      onEnded,
      pipMode,
      draggable,
      trackTitle,
      onSeekRelative, // (seconds: number) => void
      onPrev,         // () => void
      onNext,         // () => void
    },
    ref
  ) => {
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [videoVolume, setVideoVolume] = useState(1);
    const [adOverlayVisible, setAdOverlayVisible] = useState(false);

    useEffect(() => {
      window.debugLog?.(
        `DEBUG: Player mounted - embedUrl: ${embedUrl}, playing: ${playing}`
      );
      return () => {
        window.debugLog?.("DEBUG: Player unmounted");
      };
    }, [embedUrl, playing]);

    if (!embedUrl) {
      window.debugLog?.("DEBUG: Player embedUrl is empty");
      return null;
    }

    const handleProgress = (state) => {
      if (state?.playingAd || state?.ad) {
        setIsAdPlaying(true);
        setAdOverlayVisible(true);
        setVideoVolume(0);
      } else if (isAdPlaying) {
        setIsAdPlaying(false);
        setAdOverlayVisible(false);
        setVideoVolume(1);
      }
    };

    const handleStart = () => {
      setIsAdPlaying(false);
      setAdOverlayVisible(false);
      setVideoVolume(1);
    };

    const handleSeekClick = (secs) => {
      if (onSeekRelative) onSeekRelative(secs);
    };

    const handlePrevClick = () => {
      if (onPrev) onPrev();
    };

    const handleNextClick = () => {
      if (onNext) onNext();
    };

    return (
      <div style={{ position: "relative", width: "100%", background: "#000" }}>
        {/* Black overlay during ads only */}
        {adOverlayVisible && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "#000",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: pipMode ? 8 : 0,
            }}
          >
            <p style={{ color: "#555", fontSize: 18 }}>Loading video...</p>
          </div>
        )}

        {/* Custom controls overlay shown when paused */}
        {!playing && !adOverlayVisible && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <button
              onClick={() => handleSeekClick(-15)}
              style={controlButtonStyle}
            >
              ⏪ 15s
            </button>
            <button onClick={handlePrevClick} style={controlButtonStyle}>
              ⏮ Prev
            </button>
            <button
              onClick={() => handleSeekClick(15)}
              style={controlButtonStyle}
            >
              15s ⏩
            </button>
            <button onClick={handleNextClick} style={controlButtonStyle}>
              ⏭ Next
            </button>
          </div>
        )}

        <ReactPlayer
          ref={ref}
          url={embedUrl}
          width="100%"
          height={pipMode ? "300px" : "100%"}
          playing={playing}
          onEnded={onEnded}
          controls={false}
          volume={videoVolume}
          muted={false}
          playsinline={true}
          style={{ borderRadius: pipMode ? 8 : 0 }}
          progressInterval={500}
          onProgress={handleProgress}
          onStart={handleStart}
          config={{
            youtube: {
              playerVars: {
                autoplay: 1,
                controls: 0,
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
              },
            },
          }}
        />
      </div>
    );
  }
);

const controlButtonStyle = {
  background: "rgba(0,0,0,0.7)",
  border: "1px solid #fff",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 999,
  fontSize: 14,
  cursor: "pointer",
};

export default Player;
