// File: src/player/PlayerContext.jsx
// Description:
//   Global player state + safe video loading + autonext mode + MiniPlayer API.
//   Fully ID‑safe. Prevents ALL "Invalid video id" crashes.

import React, { createContext, useContext, useState, useCallback } from "react";
import { GlobalPlayer } from "./GlobalPlayer.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

/* ------------------------------------------------------------
   NORMALIZE VIDEO ID (CRITICAL)
------------------------------------------------------------ */
function normalizeId(raw) {
  if (!raw) return null;

  if (typeof raw === "string") return raw;
  if (typeof raw.id === "string") return raw.id;
  if (typeof raw.videoId === "string") return raw.videoId;
  if (raw.id && typeof raw.id.videoId === "string") return raw.id.videoId;
  if (raw.snippet?.resourceId?.videoId) return raw.snippet.resourceId.videoId;

  return null;
}

/* ------------------------------------------------------------
   PROVIDER
------------------------------------------------------------ */
export function PlayerProvider({ children }) {
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState("Playing…");

  const [autonextMode, setAutonextModeState] = useState("related");
  const [activePlaylistId, setActivePlaylistIdState] = useState(null);

  /* ------------------------------------------------------------
     SAFE loadVideo() — ALWAYS receives a clean ID
  ------------------------------------------------------------ */
  const loadVideo = useCallback((raw) => {
    const id = normalizeId(raw);

    if (!id) {
      debugBus.error("PlayerContext → Invalid video id:", raw);
      return;
    }

    debugBus.player("PlayerContext → loadVideo(" + id + ")");
    setCurrentVideoId(id);

    // Update title if available
    if (raw?.title || raw?.snippet?.title) {
      setCurrentVideoTitle(raw.title ?? raw.snippet.title);
    }

    GlobalPlayer.load(id);
  }, []);

  /* ------------------------------------------------------------
     AUTONEXT MODE
  ------------------------------------------------------------ */
  const setAutonextMode = useCallback((mode) => {
    debugBus.player("PlayerContext → setAutonextMode(" + mode + ")");
    setAutonextModeState(mode);
  }, []);

  /* ------------------------------------------------------------
     ACTIVE PLAYLIST ID
  ------------------------------------------------------------ */
  const setActivePlaylistId = useCallback((plId) => {
    debugBus.player("PlayerContext → setActivePlaylistId(" + plId + ")");
    setActivePlaylistIdState(plId);
  }, []);

  /* ------------------------------------------------------------
     ⭐ SAFE MiniPlayer.expand()
     Prevents ALL /watch/undefined crashes
  ------------------------------------------------------------ */
  const mini = {
    visible: Boolean(currentVideoId),
    title: currentVideoTitle,

    expand: () => {
      const id = normalizeId(currentVideoId);

      if (!id) {
        debugBus.warn("PlayerContext.mini.expand → blocked: invalid ID", currentVideoId);
        return;
      }

      debugBus.player("MiniPlayer → expand(" + id + ")");
      window.location.hash = `#/watch/${id}?src=miniplayer`;

      // Ensure player loads correct video
      GlobalPlayer.load(id);
    }
  };

  /* ------------------------------------------------------------
     CONTEXT VALUE
  ------------------------------------------------------------ */
  return (
    <PlayerContext.Provider
      value={{
        currentVideoId,
        currentVideoTitle,

        loadVideo,

        autonextMode,
        setAutonextMode,

        activePlaylistId,
        setActivePlaylistId,

        mini
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}

