/**
 * File: PlayerShell.jsx
 * Path: src/player/PlayerShell.jsx
 * Description:
 *   Hosts the YouTube iframe player and wires
 *   GlobalPlayer → PlayerContext (onVideoEnd).
 *
 *   Includes iOS autoplay unlock:
 *     - Captures a trusted user gesture
 *     - Delays iframe creation until gesture is registered
 *     - Prevents iOS Safari from blocking playback
 */

import React, { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "./PlayerContext.jsx";

function dbg(label, data = {}) {
  console.group(`[PlayerShell] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

export default function PlayerShell() {
  const { currentId, onVideoEnd } = useContext(PlayerContext);

  // iOS gesture unlock state
  const [unlocked, setUnlocked] = useState(false);
  const overlayRef = useRef(null);

  // Detect iOS
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Mount/unmount logging
  useEffect(() => {
    dbg("MOUNT");
    return () => dbg("UNMOUNT");
  }, []);

  // iOS: capture first tap → unlock autoplay
  useEffect(() => {
    if (!isIOS) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleTap = () => {
      dbg("iOS gesture captured → unlocking autoplay");
      setUnlocked(true);
    };

    overlay.addEventListener("touchstart", handleTap, { once: true });
    overlay.addEventListener("click", handleTap, { once: true });

    return () => {
      overlay.removeEventListener("touchstart", handleTap);
      overlay.removeEventListener("click", handleTap);
    };
  }, [isIOS]);

  // Bind GlobalPlayer events → PlayerContext
  useEffect(() => {
    dbg("Binding GlobalPlayer events");

    if (!window.GlobalPlayer || !window.GlobalPlayer.player) {
      dbg("GlobalPlayer.player not ready yet, skipping bind");
      return;
    }

    const gp = window.GlobalPlayer;
    const originalOnStateChange = gp.player.onStateChange;
    const originalOnError = gp.player.onError;

    gp.player.onStateChange = (e) => {
      dbg("onStateChange", { state: e.data });

      // 0 = ended
      if (e.data === 0) {
        dbg("Video ended → calling onVideoEnd()");
        onVideoEnd();
      }

      if (typeof originalOnStateChange === "function") {
        originalOnStateChange(e);
      }
    };

    gp.player.onError = (e) => {
      dbg("onError", { error: e.data });
      if (typeof originalOnError === "function") {
        originalOnError(e);
      }
    };

    return () => {
      dbg("Unbinding GlobalPlayer events");
      if (!gp.player) return;
      gp.player.onStateChange = originalOnStateChange;
      gp.player.onError = originalOnError;
    };
  }, [onVideoEnd]);

  // Load video when currentId changes
  useEffect(() => {
    dbg("currentId changed", { currentId });

    if (!currentId) return;

    // iOS: do NOT load video until gesture unlock
    if (isIOS && !unlocked) {
      dbg("iOS: waiting for gesture unlock before loading video");
      return;
    }

    if (!window.GlobalPlayer || !window.GlobalPlayer.loadVideo) {
      dbg("GlobalPlayer not ready, cannot load video yet");
      return;
    }

    dbg("Calling GlobalPlayer.loadVideo()", { currentId });
    window.GlobalPlayer.loadVideo(currentId);
  }, [currentId, unlocked, isIOS]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* iOS invisible gesture overlay */}
      {isIOS && !unlocked && (
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: "transparent",
            cursor: "pointer",
          }}
        />
      )}

      <div
        id="yt-player"
        style={{
          width: "100%",
          height: "220px", // Prevents iframe collapse on iOS
          background: "black",
          borderRadius: "8px",
          marginTop: "8px",
          overflow: "visible", // Prevent Safari removing iframe
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}
