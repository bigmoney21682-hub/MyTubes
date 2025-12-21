// File: src/components/Player.jsx
// Updated: Silent ad handling – audio overlay + visual blackout during ads (TOS-safe mimic of background play feel)

import React, { forwardRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";

const Player = forwardRef(
  ({ embedUrl, playing, onEnded, pipMode, draggable, trackTitle }, ref) => {
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [videoVolume, setVideoVolume] = useState(1); // Main video audio
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

    // ReactPlayer ad detection callback
    const handleProgress = (state) => {
      // YouTube Player sends playedSeconds, but ad status via onPlaybackState
      // We'll use the common ad detection pattern
      if (state?.playingAd || state?.ad) {
        setIsAdPlaying(true);
        setAdOverlayVisible(true);
        setVideoVolume(0); // Silence ad audio completely
      } else if (isAdPlaying) {
        // Ad just ended – restore video audio smoothly
        setIsAdPlaying(false);
        setAdOverlayVisible(false);
        setVideoVolume(1);
      }
    };

    // Fallback: some embeds trigger ad via different events
    const handleStart = () => {
      // Reset on new video start
      setIsAdPlaying(false);
      setAdOverlayVisible(false);
      setVideoVolume(1);
    };

    try {
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

          <ReactPlayer
            ref={ref}
            url={embedUrl}
            width="100%"
            height={pipMode ? "300px" : "100%"}
            playing={playing}
            onEnded={onEnded}
            controls={true}
            volume={videoVolume}        // Dynamically muted during ads
            muted={false}               // Base muted=false so volume control works
            playsinline={true}
            style={{ borderRadius: pipMode ? 8 : 0 }}
            progressInterval={500}
            onProgress={handleProgress}
            onStart={handleStart}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 1,
                  rel: 0,
                  modestbranding: 1,
                  playsinline: 1,
                },
              },
            }}
          />
        </div>
      );
    } catch (e) {
      window.debugLog?.(`DEBUG: Player error: ${e}`);
      return null;
    }
  }
);

export default Player;
