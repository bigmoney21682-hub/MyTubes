/**
 * File: PlayerContext.jsx
 * Path: src/player/PlayerContext.jsx
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback
} from "react";

import { GlobalPlayer } from "./GlobalPlayerFix.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [autonextMode, setAutonextModeState] = useState("related");
  const [activePlaylistId, setActivePlaylistIdState] = useState(null);

  const [isExpanded, setIsExpanded] = useState(false);

  const [playerMeta, setPlayerMetaState] = useState({
    title: "",
    thumbnail: "",
    channel: ""
  });

  // ⭐ NEW: dynamic player height (48 mini, 220 full)
  const [playerHeight, setPlayerHeight] = useState(0);

  const loadVideo = useCallback((videoId) => {
    if (!videoId) return;

    debugBus.player("PlayerContext.loadVideo(" + videoId + ")");
    setActiveVideoId(videoId);
    GlobalPlayer.load(videoId);
  }, []);

  const setAutonextMode = useCallback((mode) => {
    if (mode !== "related" && mode !== "playlist") {
      debugBus.warn("PlayerContext.setAutonextMode → invalid mode", mode);
      return;
    }

    debugBus.player("PlayerContext.setAutonextMode(" + mode + ")");
    setAutonextModeState(mode);
  }, []);

  const setActivePlaylistId = useCallback((playlistId) => {
    debugBus.player(
      "PlayerContext.setActivePlaylistId(" + JSON.stringify(playlistId) + ")"
    );
    setActivePlaylistIdState(playlistId || null);
  }, []);

  const expandPlayer = useCallback(() => {
    debugBus.player("PlayerContext.expandPlayer()");
    setIsExpanded(true);
  }, []);

  const collapsePlayer = useCallback(() => {
    debugBus.player("PlayerContext.collapsePlayer()");
    setIsExpanded(false);
  }, []);

  const setPlayerMeta = useCallback((meta) => {
    debugBus.player("PlayerContext.setPlayerMeta()");
    setPlayerMetaState((prev) => ({
      ...prev,
      ...meta
    }));
  }, []);

  const value = {
    activeVideoId,
    autonextMode,
    activePlaylistId,
    isExpanded,
    playerMeta,
    playerHeight,

    loadVideo,
    setAutonextMode,
    setActivePlaylistId,

    expandPlayer,
    collapsePlayer,
    setPlayerMeta,

    // ⭐ expose setter
    setPlayerHeight
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
