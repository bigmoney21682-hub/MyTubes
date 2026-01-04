/**
 * File: PlayerShell.jsx
 * Path: src/player/PlayerShell.jsx
 */

import React, { useEffect } from "react";
import { usePlayer } from "./PlayerContext.jsx";
import { GlobalPlayer } from "./GlobalPlayer_v2.js";

import MiniPlayer from "./MiniPlayer.jsx";
import FullPlayer from "./FullPlayer.jsx";

export default function PlayerShell() {
  const {
    activeVideoId,
    isExpanded,
    expandPlayer,
    collapsePlayer,
    playerMeta
  } = usePlayer();

  // ⭐ Initialize GlobalPlayer AFTER the mount point exists
  useEffect(() => {
    try {
      GlobalPlayer.init();
      window.bootDebug?.player("PlayerShell → GlobalPlayer.init() OK");
    } catch (err) {
      window.bootDebug?.player("PlayerShell → GlobalPlayer.init() FAILED");
      console.warn(err);
    }
  }, []);

  if (!activeVideoId) return null;

  return (
    <div
      style={{
        width: "100%",
        background: "#000",
        position: "fixed",
        top: "60px",
        left: 0,
        right: 0,
        zIndex: 900,
        transition: "height 0.25s ease",
        height: isExpanded ? "220px" : "48px",
        overflow: "hidden",
        borderBottom: "1px solid #222"
      }}
    >
      {isExpanded && (
        <FullPlayer
          onCollapse={collapsePlayer}
          meta={playerMeta}
        />
      )}

      {!isExpanded && (
        <MiniPlayer
          meta={playerMeta}
          onExpand={expandPlayer}
        />
      )}
    </div>
  );
}
