/**
 * File: AutonextEngine.js
 * Path: src/player/AutonextEngine.js
 * Description: Handles autonext behavior when a video ends.
 *              Supports two modes:
 *                - "playlist": use QueueStore.next()
 *                - "related": notify PlayerContext/Watch.jsx to fetch related
 */

import { GlobalPlayer } from "./GlobalPlayer.js";
import { QueueStore } from "./QueueStore.jsx";
import { debugBus } from "../debug/debugBus.js";

let mode = "related"; // default
let relatedCallback = null; // Watch.jsx registers this

export const AutonextEngine = {
  /**
   * Initialize autonext engine.
   * Called once from PlayerContext after GlobalPlayer.init().
   */
  init() {
    debugBus.player("AutonextEngine.init()");

    GlobalPlayer.onEnded(() => {
      debugBus.player("AutonextEngine → Video ended");

      if (mode === "playlist") {
        const next = QueueStore.next();
        if (next) {
          debugBus.player("AutonextEngine → Playlist next: " + next);
          GlobalPlayer.load(next);
        } else {
          debugBus.player("AutonextEngine → Playlist ended (no next)");
        }
        return;
      }

      if (mode === "related") {
        debugBus.player("AutonextEngine → Related mode triggered");
        if (relatedCallback) {
          relatedCallback();
        } else {
          debugBus.player(
            "AutonextEngine → No relatedCallback registered (Watch.jsx missing?)"
          );
        }
      }
    });
  },

  /**
   * Set autonext mode: "playlist" or "related".
   */
  setMode(newMode) {
    mode = newMode;
    debugBus.player("AutonextEngine → Mode set to " + newMode);
  },

  /**
   * Register a callback for related-mode autonext.
   * Watch.jsx will call this and provide a function that:
   *   - fetches related videos
   *   - picks the next one
   *   - calls GlobalPlayer.load(id)
   */
  registerRelatedCallback(cb) {
    relatedCallback = cb;
    debugBus.player("AutonextEngine → Related callback registered");
  }
};
