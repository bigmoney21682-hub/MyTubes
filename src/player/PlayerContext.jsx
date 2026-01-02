// File: src/player/PlayerContext.jsx

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect
} from "react";

import { GlobalPlayer } from "./GlobalPlayer.js";
import { AutonextEngine } from "./AutonextEngine.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  /* ------------------------------------------------------------
     1. Autonext state
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
     2. Initialize GlobalPlayer ONCE
     (This is the missing piece that caused the black screen)
  ------------------------------------------------------------- */
  useEffect(() => {
    debugBus.log("PlayerContext → Initializing GlobalPlayer");

    GlobalPlayer.init({
      onReady: () => {
        debugBus.log("PlayerContext → GlobalPlayer ready");
      },

      onStateChange: (state) => {
        debugBus.log("PlayerContext → Player state: " + state);

        // YouTube "ENDED" state = 0
        if (state === 0 || state === "ended") {
          debugBus.log("PlayerContext → Video ended → AutonextEngine.handleEnded()");
          AutonextEngine.handleEnded();
        }
      }
    });
  }, []);

  /* ------------------------------------------------------------
     3. Stable loadVideo()
     (Never changes identity, prevents reload loops)
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
     4. Stable context value
     (Object identity never changes)
  ------------------------------------------------------------- */
  const value = useRef({
    loadVideo,
    autonextMode,
    activePlaylistId,
    setAutonextMode,
    setActivePlaylistId
  });

  // Update dynamic fields without changing the object reference
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
