/**
 * File: AutonextEngine.js
 * Path: src/player/AutonextEngine.js
 * Description:
 *   Centralized autonext controller for both playlist and related modes.
 *   Watch.jsx registers callbacks; GlobalPlayer triggers them on video end.
 */

import { debugBus } from "../debug/debugBus.js";

/* ------------------------------------------------------------
   Internal state
------------------------------------------------------------- */
let mode = "related"; // "related" | "playlist"
let relatedCallback = null;
let playlistCallback = null;

/* ------------------------------------------------------------
   Public API
------------------------------------------------------------- */
export const AutonextEngine = {
  /* ------------------------------------------------------------
     Set autonext mode
  ------------------------------------------------------------- */
  setMode(newMode) {
    mode = newMode;
    debugBus.log("AutonextEngine", `Mode set → ${mode}`);
  },

  /* ------------------------------------------------------------
     Register related-mode callback
  ------------------------------------------------------------- */
  registerRelatedCallback(cb) {
    relatedCallback = cb;
    debugBus.log("AutonextEngine", "Related callback registered");
  },

  /* ------------------------------------------------------------
     Register playlist-mode callback
  ------------------------------------------------------------- */
  registerPlaylistCallback(cb) {
    playlistCallback = cb;
    debugBus.log("AutonextEngine", "Playlist callback registered");
  },

  /* ------------------------------------------------------------
     Trigger autonext (called by GlobalPlayer on video end)
  ------------------------------------------------------------- */
  trigger() {
    debugBus.log("AutonextEngine", `Triggering autonext for mode="${mode}"`);

    if (mode === "playlist") {
      if (playlistCallback) {
        playlistCallback();
      } else {
        debugBus.log("AutonextEngine", "No playlist callback registered");
      }
      return;
    }

    // Related mode
    if (relatedCallback) {
      relatedCallback();
    } else {
      debugBus.log("AutonextEngine", "No related callback registered");
    }
  }
};
