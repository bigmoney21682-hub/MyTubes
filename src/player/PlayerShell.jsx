/**
 * File: PlayerShell.jsx
 * Path: src/player/PlayerShell.jsx
 * Description:
 *   Hosts the YouTube iframe player and wires
 *   GlobalPlayer → PlayerContext (onVideoEnd).
 *
 *   Notes:
 *     - Uses a fixed height instead of aspect-ratio to avoid
 *       iOS Safari iframe removal during layout reflow.
 */

import React, { useContext, useEffect } from "react";
import { PlayerContext } from "./PlayerContext.jsx";

function dbg(label, data = {}) {
  console.group(`[PlayerShell] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

export default function PlayerShell() {
  const { currentId, onVideoEnd } = useContext(PlayerContext);

  // Mount/unmount logging
  useEffect(() => {
    dbg("MOUNT");
    return () => dbg("UNMOUNT");
  }, []);

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
    if (!window.GlobalPlayer || !window.GlobalPlayer.loadVideo) {
      dbg("GlobalPlayer not ready, cannot load video yet");
      return;
    }

    window.GlobalPlayer.loadVideo(currentId);
  }, [currentId]);

  return (
    <div
      id="yt-player"
      style={{
        width: "100%",
        height: "220px",        // 🔥 FIX: prevents iframe collapse on iOS
        background: "black",
        borderRadius: "8px",
        marginTop: "8px",
        overflow: "visible"     // 🔥 FIX: avoid Safari removing iframe
      }}
    />
  );
}
