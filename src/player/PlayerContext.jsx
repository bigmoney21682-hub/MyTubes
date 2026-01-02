// File: src/player/PlayerContext.jsx

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback
} from "react";
import { GlobalPlayer } from "./GlobalPlayer.js";
import { AutonextEngine } from "./AutonextEngine.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [autonextMode, setAutonextModeState] = useState("related");
  const [activePlaylistId, setActivePlaylistIdState] = useState(null);

  const setAutonextMode = useCallback((mode) => {
    setAutonextModeState(mode);
    AutonextEngine.setMode(mode);
  }, []);

  const setActivePlaylistId = useCallback((id) => {
    setActivePlaylistIdState(id);
  }, []);

  const loadVideo = useCallback((id) => {
    if (!id) {
      debugBus.error("PlayerContext → loadVideo called with invalid id:", id);
      return;
    }

    debugBus.log("PlayerContext → loadVideo(" + id + ")");
    GlobalPlayer.load(id);
  }, []);

  const value = useRef({
    loadVideo,
    autonextMode,
    activePlaylistId,
    setAutonextMode,
    setActivePlaylistId
  });

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
