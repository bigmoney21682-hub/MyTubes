/**
 * File: PlayerContext.jsx
 * Path: src/player/PlayerContext.jsx
 * Description: Global playback context that wraps GlobalPlayer, QueueStore,
 *              and AutonextEngine. Provides loadVideo(), queueAdd(),
 *              autonextMode, and safe state for MiniPlayer + Watch page.
 */

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { GlobalPlayer } from "./GlobalPlayer.js";
import { QueueStore } from "./QueueStore.js";
import { AutonextEngine } from "./AutonextEngine.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  // ------------------------------------------------------------
  // Local UI state
  // ------------------------------------------------------------
  const [currentId, setCurrentId] = useState(null);
  const [autonextMode, setAutonextMode] = useState("related");

  // Keep a ref so callbacks always see latest values
  const currentIdRef = useRef(null);
  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  // ------------------------------------------------------------
  // Initialize GlobalPlayer ONCE
  // ------------------------------------------------------------
  useEffect(() => {
    debugBus.player("PlayerContext → Initializing GlobalPlayer");

    GlobalPlayer.init({
      onReady: () => {
        debugBus.player("PlayerContext → GlobalPlayer ready");
      },
      onStateChange: (state) => {
        debugBus.player("PlayerContext → Player state: " + state);

        if (state === "ended") {
          debugBus.player("PlayerContext → Video ended");

          if (autonextMode === "playlist") {
            const next = QueueStore.next();
            if (next) {
              debugBus.player("PlayerContext → Playlist autonext → " + next);
              loadVideo(next);
            }
          } else {
            AutonextEngine.triggerRelated();
          }
        }
      }
    });
  }, [autonextMode]);

  // ------------------------------------------------------------
  // Public API: loadVideo
  // ------------------------------------------------------------
  function loadVideo(id) {
    if (!id) return;

    debugBus.player("PlayerContext → loadVideo(" + id + ")");

    try {
      setCurrentId(id);
      GlobalPlayer.load(id);
    } catch (err) {
      debugBus.player("PlayerContext.loadVideo error: " + (err?.message || err));
    }
  }

  // ------------------------------------------------------------
  // Public API: queueAdd
  // ------------------------------------------------------------
  function queueAdd(id) {
    if (!id) return;

    try {
      QueueStore.add(id);
      debugBus.player("PlayerContext → queueAdd(" + id + ")");
    } catch (err) {
      debugBus.player("PlayerContext.queueAdd error: " + (err?.message || err));
    }
  }

  // ------------------------------------------------------------
  // Provide context value
  // ------------------------------------------------------------
  const value = {
    currentId,
    loadVideo,
    queueAdd,
    autonextMode,
    setAutonextMode
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
