/**
 * File: PlayerContext.jsx
 * Path: src/player/PlayerContext.jsx
 * Description:
 *   Stable global player context providing:
 *   - loadVideo(id)
 *   - autonext mode
 *   - active playlist ID
 *   - no StrictMode reload loops
 */

import React, { createContext, useContext, useRef, useState, useCallback } from "react";
import { GlobalPlayer } from "./GlobalPlayer.js";
import { AutonextEngine } from "./AutonextEngine.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  /* ------------------------------------------------------------
     1. Autonext mode + playlist state
  ------------------------------------------------------------- */
  const [autonextMode, setAutonextModeState] = useState("related"); // "related" | "playlist"
  const [activePlaylistId, setActivePlaylistIdState] = useState(null);

  const setAutonextMode = useCallback((mode) => {
    setAutonextModeState(mode);
    AutonextEngine.setMode(mode);
  }, []);

  const setActivePlaylistId = useCallback((id) => {
    setActivePlaylistIdState(id);
  }, []);

  /* ------------------------------------------------------------
     2. Stable loadVideo() function
        - NEVER changes identity
        - Prevents infinite reload loops
  ------------------------------------------------------------- */
  const loadVideo = useCallback((id) => {
    if (!id) {
      debugBus.error("PlayerContext → loadVideo called with invalid id:", id);
      return;
    }

    debugBus.log("PlayerContext → loadVideo(" + id + ")");
    GlobalPlayer.load(id);
  }, []);

  /* ------------------------------------------------------------
     3. Provide stable context value
  ------------------------------------------------------------- */
  const value = useRef({
    loadVideo,
    autonextMode,
    activePlaylistId,
    setAutonextMode,
    setActivePlaylistId
  });

  // Update mutable fields without changing object identity
  value.current.autonextMode = autonextMode;
  value.current.activePlaylistId = activePlaylistId;

  return (
    <PlayerContext.Provider value={value.current}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
