/**
 * File: src/player/PlayerContext.jsx
 * Description:
 *   Global player state shared across the app.
 *   Handles:
 *     - Current video ID
 *     - Autonext mode (playlist / related / trending)
 *     - Active playlist ID (if any)
 *     - loadVideo() → forwards to GlobalPlayer
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { GlobalPlayer } from "./GlobalPlayer.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  // ------------------------------------------------------------
  // Core state
  // ------------------------------------------------------------
  const [currentVideoId, setCurrentVideoId] = useState(null);

  // "playlist" | "related" | "trending"
  const [autonextMode, setAutonextMode] = useState("related");

  // Active playlist ID (only used when autonextMode === "playlist")
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  // ------------------------------------------------------------
  // Load video into GlobalPlayer
  // ------------------------------------------------------------
  const loadVideo = useCallback((id) => {
    if (!id) return;

    debugBus.player("PlayerContext → loadVideo(" + id + ")");
    setCurrentVideoId(id);

    // Forward to GlobalPlayer
    GlobalPlayer.load(id);
  }, []);

  // ------------------------------------------------------------
  // Exposed API
  // ------------------------------------------------------------
  const value = {
    currentVideoId,

    autonextMode,
    setAutonextMode,

    activePlaylistId,
    setActivePlaylistId,

    loadVideo
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
