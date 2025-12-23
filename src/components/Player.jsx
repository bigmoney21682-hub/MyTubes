// File: src/components/Player.jsx
// PCC v3.0 — Video player with tap overlay controls (MyTube-orange), fixed aspect ratio

import React, { forwardRef, useEffect, useRef, useState } from "react";
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
      onSeekRelative,
      onPrev,
      onNext,
    },
    ref
  ) => {
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [videoVolume, setVideoVolume] = useState(1);
    const [adOverlayVisible, setAdOverlayVisible] = useState(false);

    // Tap-to-show overlay controls
    const [tapOverlayVisible, setTapOverlayVisible] = useState(false);
    const tapOverlayTimeoutRef = useRef(null);

    useEffect(() => {
      window.debugLog?.(
        `DEBUG: Player mounted - embedUrl: ${embedUrl}, playing: ${playing}`
      );
      return () => {
        window.debugLog?.("DEBUG: Player unmounted");
        if (tapOverlayTimeoutRef.current) {
          clearTimeout(tapOverlayTimeoutRef.current);
        }
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

    // Show overlay controls when user taps anywhere on the video
    const handleTap = () => {
      if (adOverlayVisible) return;

      setTapOverlayVisible(true);
      if (tapOverlayTimeoutRef.current) {
        clearTimeout(tapOverlayTimeoutRef.current);
      }
      tapOverlayTimeoutRef.current = setTimeout(() => {
        setTapOverlayVisible(false);
      }, 2000);
    };

    const handleSeekBack = (e) => {
      e.stopPropagation();
      onSeekRelative?.(-15);
    };

    const handleSeekForward = (e) => {
      e.stopPropagation();
      onSeekRelative?.(15);
    };

    const handlePrev = (e) => {
      e.stopPropagation();
      onPrev?.();
    };

    const handleNext = (e) => {
      e.stopPropagation();
      onNext?.();
    };

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%", // important so ReactPlayer can fill the container
          background: "#000",
        }}
        onClick={handleTap}
      >
        {/* Ad overlay */}
        {adOverlayVisible && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#000",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ color: "#555", fontSize: 18 }}>Loading video...</p>
          </div>
        )}

        {/* Existing pause overlay controls (unchanged) */}
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
              onClick={(e) => {
                e.stopPropagation();
                onSeekRelative?.(-15);
              }}
              style={controlButtonStyleOld}
            >
              ⏪ 15s
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev?.();
              }}
              style={controlButtonStyleOld}
            >
              ⏮ Prev
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSeekRelative?.(15);
              }}
              style={controlButtonStyleOld}
            >
              15s ⏩
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext?.();
              }}
              style={controlButtonStyleOld}
            >
              ⏭ Next
            </button>
          </div>
        )}

        {/* Tap overlay controls (MyTube-orange, centered, does NOT pause video) */}
        {tapOverlayVisible && !adOverlayVisible && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 11,
              display: "flex",
              alignItems: "center", // vertically centered (O1)
              justifyContent: "center",
              pointerEvents: "none", // allow buttons to re-enable
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                pointerEvents: "auto", // buttons are clickable
              }}
            >
              {/* 15s back */}
              <button
                onClick={handleSeekBack}
                style={circleControlStyle}
              >
                <span style={circleTextStyle}>15</span>
              </button>

              {/* Prev */}
              <button
                onClick={handlePrev}
                style={circleControlStyle}
              >
                <span style={circleTextStyle}>⏮</span>
              </button>

              {/* Next */}
              <button
                onClick={handleNext}
                style={circleControlStyle}
              >
                <span style={circleTextStyle}>⏭</span>
              </button>

              {/* 15s forward */}
              <button
                onClick={handleSeekForward}
                style={circleControlStyle}
              >
                <span style={circleTextStyle}>15</span>
              </button>
            </div>
          </div>
        )}

        {/* ReactPlayer fills the container (no zoom/crop when parent is 16:9) */}
        <ReactPlayer
          ref={ref}
          url={embedUrl}
          width="100%"
          height="100%"
          playing={playing}
          onEnded={onEnded}
          controls={false}
          volume={videoVolume}
          muted={false}
          playsinline={true}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: pipMode ? 8 : 0,
          }}
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

// Old pause-overlay button style (preserved)
const controlButtonStyleOld = {
  background: "rgba(0,0,0,0.7)",
  border: "1px solid #fff",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 999,
  fontSize: 14,
  cursor: "pointer",
};

// New tap-overlay circular controls (C2 + S1)
const circleControlStyle = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "none",
  background:
    "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)", // MyTube-orange gradient
  boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "transform 0.12s ease, opacity 0.12s ease",
  opacity: 0.96,
};

const circleTextStyle = {
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
};

export default Player;
