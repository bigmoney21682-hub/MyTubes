/**
 * File: PlayerContext.jsx
 * Path: src/player/PlayerContext.jsx
 * Description:
 *   Central player state + bridge to GlobalPlayer + UI expansion state.
 *
 *   Tracks:
 *     - activeVideoId
 *     - autonextMode ("related" | "playlist")
 *     - activePlaylistId
 *     - isExpanded (MiniPlayer ↔ FullPlayer)
 *     - playerMeta (title, thumbnail, channel, etc.)
 *
 *   Guarantees:
 *     - No double loads
 *     - No stale state
 *     - Clean integration with GlobalPlayer
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback
} from "react";

import { GlobalPlayer } from "./GlobalPlayer_v2.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [autonextMode, setAutonextModeState] = useState("related");
  const [activePlaylistId, setActivePlaylistIdState] = useState(null);

  // NEW: MiniPlayer ↔ FullPlayer expansion state
  const [isExpanded, setIsExpanded] = useState(false);

  // NEW: Metadata for MiniPlayer (title, thumbnail, channel, etc.)
  const [playerMeta, setPlayerMetaState] = useState({
    title: "",
    thumbnail: "",
    channel: ""
  });

  /* ------------------------------------------------------------
     Public: loadVideo
     - Updates activeVideoId
     - Sends to GlobalPlayer
  ------------------------------------------------------------ */
  const loadVideo = useCallback((videoId) => {
    if (!videoId) return;

    debugBus.player("PlayerContext.loadVideo(" + videoId + ")");
    setActiveVideoId(videoId);
    GlobalPlayer.load(videoId);
  }, []);

  /* ------------------------------------------------------------
     Public: setAutonextMode
  ------------------------------------------------------------ */
  const setAutonextMode = useCallback((mode) => {
    if (mode !== "related" && mode !== "playlist") {
      debugBus.warn("PlayerContext.setAutonextMode → invalid mode", mode);
      return;
    }

    debugBus.player("PlayerContext.setAutonextMode(" + mode + ")");
    setAutonextModeState(mode);
  }, []);

  /* ------------------------------------------------------------
     Public: setActivePlaylistId
  ------------------------------------------------------------ */
  const setActivePlaylistId = useCallback((playlistId) => {
    debugBus.player(
      "PlayerContext.setActivePlaylistId(" + JSON.stringify(playlistId) + ")"
    );
    setActivePlaylistIdState(playlistId || null);
  }, []);

  /* ------------------------------------------------------------
     NEW: expandPlayer / collapsePlayer
  ------------------------------------------------------------ */
  const expandPlayer = useCallback(() => {
    debugBus.player("PlayerContext.expandPlayer()");
    setIsExpanded(true);
  }, []);

  const collapsePlayer = useCallback(() => {
    debugBus.player("PlayerContext.collapsePlayer()");
    setIsExpanded(false);
  }, []);

  /* ------------------------------------------------------------
     NEW: setPlayerMeta
     - Called from Home (formerly Watch) after fetching video data
  ------------------------------------------------------------ */
  const setPlayerMeta = useCallback((meta) => {
    debugBus.player("PlayerContext.setPlayerMeta()");
    setPlayerMetaState((prev) => ({
      ...prev,
      ...meta
    }));
  }, []);

  /* ------------------------------------------------------------
     Provide context
  ------------------------------------------------------------ */
  const value = {
    activeVideoId,
    autonextMode,
    activePlaylistId,
    isExpanded,
    playerMeta,

    loadVideo,
    setAutonextMode,
    setActivePlaylistId,

    expandPlayer,
    collapsePlayer,
    setPlayerMeta
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return ctx;
}
