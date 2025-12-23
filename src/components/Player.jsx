// File: src/components/Player.jsx
// PCC v4.0 — YouTube-style gestures + MyTube gradient UI + PlayerContext integration

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import ReactPlayer from "react-player";
import { usePlayer } from "../contexts/PlayerContext";

const Player = forwardRef(({ embedUrl, playing, onEnded }, ref) => {
  const { playPrev, playNext, seekRelative } = usePlayer();

  const [hasStarted, setHasStarted] = useState(false);
  const [tapOverlayVisible, setTapOverlayVisible] = useState(false);
  const [bubble, setBubble] = useState(null); // { x, y, direction }
  const tapTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);

  const log = (msg) => window.debugLog?.(`Player: ${msg}`);

  useEffect(() => {
    log(`Mounted - embedUrl=${embedUrl}, playing=${playing}`);
    return () => log("Unmounted");
  }, [embedUrl, playing]);

  if (!embedUrl) return null;

  // -----------------------------
  // Autoplay-safe start detection
  // -----------------------------
  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      log("Playback started (onStart)");
    }
  };

  const handlePlay = () => {
    if (!hasStarted) {
      setHasStarted(true);
      log("Playback started (onPlay)");
    }
  };

  // -----------------------------
  // Single tap overlay
  // -----------------------------
  const showTapOverlay = () => {
    setTapOverlayVisible(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      setTapOverlayVisible(false);
    }, 2000);
  };

  // -----------------------------
  // Double-tap detection
  // -----------------------------
  const handleTapAreaClick = (e) => {
    if (!hasStarted) {
      log("Tap ignored (video not started yet)");
      return;
    }

    const now = Date.now();
    const tapX = e.nativeEvent.offsetX;
    const tapY = e.nativeEvent.offsetY;
    const width = e.currentTarget.clientWidth;

    const isDoubleTap = now - lastTapRef.current < 300;
    lastTapRef.current = now;

    if (isDoubleTap) {
      const isLeft = tapX < width / 2;
      const direction = isLeft ? -15 : 15;

      // Skip
      seekRelative(direction);

      // Bubble animation at tap location
      setBubble({
        x: tapX,
        y: tapY,
        direction,
      });

      setTimeout(() => setBubble(null), 500);
      return;
    }

    // Single tap → show overlay
    showTapOverlay();
  };

  // -----------------------------
  // Overlay button actions
  // -----------------------------
  const handleRestartOrPrev = useCallback(() => {
    const player = ref?.current?.getInternalPlayer();
    if (!player) return;

    player.getCurrentTime().then((t) => {
      if (t > 2) {
        // Restart video
        seekRelative(-t);
      } else {
        // Previous video
        playPrev();
      }
    });
  }, [ref, playPrev, seekRelative]);

  const handlePlayPause = () => {
    // Center button toggles play/pause
    const { setPlaying } = usePlayer.getState
      ? usePlayer.getState()
      : { setPlaying: null };
    if (setPlaying) setPlaying((p) => !p);
  };

  const handleNext = () => playNext();

  // -----------------------------
  // Styles
  // -----------------------------
  const circleStyle = {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
  };

  const bubbleStyle = (x, y) => ({
    position: "absolute",
    left: x - 24,
    top: y - 24,
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(90deg, #ff8c00, #ff4500, #ff0000)",
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    animation: "bubblePop 0.5s ease-out forwards",
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000",
      }}
    >
      {/* Tap/double-tap area (only active after playback starts) */}
      {hasStarted && (
        <div
          onClick={handleTapAreaClick}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            background: "transparent",
          }}
        />
      )}

      {/* Double-tap bubble */}
      {bubble && (
        <div style={bubbleStyle(bubble.x, bubble.y)}>
          {Math.abs(bubble.direction)}
        </div>
      )}

      {/* Single-tap overlay (3 buttons) */}
      {tapOverlayVisible && hasStarted && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            pointerEvents: "auto",
          }}
        >
          {/* Restart / Prev */}
          <div style={circleStyle} onClick={handleRestartOrPrev}>
            ⏮
          </div>

          {/* Play / Pause */}
          <div style={circleStyle} onClick={handlePlayPause}>
            {playing ? "⏸" : "▶️"}
          </div>

          {/* Next */}
          <div style={circleStyle} onClick={handleNext}>
            ⏭
          </div>
        </div>
      )}

      {/* ReactPlayer */}
      <ReactPlayer
        ref={ref}
        url={embedUrl}
        width="100%"
        height="100%"
        playing={playing}
        onEnded={onEnded}
        controls={false}
        playsinline
        onStart={handleStart}
        onPlay={handlePlay}
        style={{
          position: "absolute",
          inset: 0,
        }}
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
});

export default Player;
