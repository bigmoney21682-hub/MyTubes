/**
 * File: AutonextEngine.js
 * Description: Handles autonext logic for related + playlist modes.
 */

import { debugBus } from "../debug/debugBus.js";
import { QueueStore } from "./QueueStore.js";

let mode = "related";
let relatedCallback = null;

export const AutonextEngine = {
  /* ------------------------------------------------------------
     Set mode (related | playlist)
  ------------------------------------------------------------- */
  setMode(m) {
    mode = m;
    debugBus.log("AutonextEngine", `Mode set → ${mode}`);
  },

  /* ------------------------------------------------------------
     Register related-mode callback
  ------------------------------------------------------------- */
  registerRelatedCallback(cb) {
    relatedCallback = cb;
  },

  /* ------------------------------------------------------------
     Trigger autonext
  ------------------------------------------------------------- */
  trigger() {
    debugBus.log("AutonextEngine", `Triggering callback for mode="${mode}"`);

    if (mode === "playlist") {
      const next = QueueStore.next();
      if (next) {
        debugBus.log("AutonextEngine", `Playlist next → ${next}`);
        window.location.href = `/watch/${next}`;
      } else {
        debugBus.log("AutonextEngine", "Playlist ended");
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
