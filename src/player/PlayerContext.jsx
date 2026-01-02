/**
 * File: PlayerContext.jsx
 * Path: src/player/PlayerContext.jsx
 * Description: Global player state + autonext mode controller +
 *              active playlist tracking for continuous playlist play.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import { GlobalPlayer } from "./GlobalPlayer.js";
import { AutonextEngine } from "./AutonextEngine.js";
import { debugBus } from "../debug/debugBus.js";

const PlayerContext = createContext(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  /* ------------------------------------------------------------
     Core player state
  ------------------------------------------------------------- */
  const [currentId, setCurrentId] = useState(null);
  const [playerState, setPlayerState] = useState("paused");

  /* ------------------------------------------------------------
     Autonext mode (related | playlist)
  ------------------------------------------------------------- */
  const [autonextMode, setAutonextModeState] = useState("related");

  function setAutonextMode(mode) {
    debugBus.log("PLAYER", `Autonext mode → ${mode}`);
    setAutonextModeState(mode);
    AutonextEngine.setMode(mode);
  }

  /* ------------------------------------------------------------
     Active playlist ID (for continuous playlist play)
  ------------------------------------------------------------- */
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  /* ------------------------------------------------------------
     Load video
  ------------------------------------------------------------- */
  function loadVideo(id) {
    setCurrentId(id);
    GlobalPlayer.load(id);
  }

  /* ------------------------------------------------------------
     Player state listener
  ------------------------------------------------------------- */
  useEffect(() => {
    GlobalPlayer.onStateChange((state) => {
      setPlayerState(state);
      debugBus.log("PlayerContext → Player state:", state);

      if (state === "ended") {
        debugBus.log("PlayerContext → Video ended");
        AutonextEngine.trigger(autonextMode);
      }
    });
  }, [autonextMode]);

  /* ------------------------------------------------------------
     Provide context
  ------------------------------------------------------------- */
  return (
    <PlayerContext.Provider
      value={{
        currentId,
        playerState,
        loadVideo,

        autonextMode,
        setAutonextMode,

        activePlaylistId,
        setActivePlaylistId
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

