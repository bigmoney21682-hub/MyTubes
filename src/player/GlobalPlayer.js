/**
 * File: GlobalPlayer.js
 * Description: Centralized YouTube/Piped player wrapper with event dispatch.
 */

import { debugBus } from "../debug/debugBus.js";

let stateListeners = [];

export const GlobalPlayer = {
  player: null,
  mounted: false,

  /* ------------------------------------------------------------
     Subscribe to player state changes
  ------------------------------------------------------------- */
  onStateChange(cb) {
    stateListeners.push(cb);
  },

  _emitState(state) {
    debugBus.log("GlobalPlayer → State:", state);
    stateListeners.forEach((cb) => cb(state));
  },

  /* ------------------------------------------------------------
     Ensure #player exists before loading
  ------------------------------------------------------------- */
  ensureMounted() {
    if (this.mounted) return;

    const el = document.getElementById("player");
    if (!el) {
      debugBus.log("GlobalPlayer", "ensureMounted → #player not found");
      return;
    }

    this.mounted = true;
    debugBus.log("GlobalPlayer", "Mounted");
  },

  /* ------------------------------------------------------------
     Load a video into the player
  ------------------------------------------------------------- */
  load(id) {
    if (!this.mounted) {
      debugBus.log("GlobalPlayer", "load() called before mounted");
      return;
    }

    debugBus.log("GlobalPlayer", `Loading video ${id}`);

    // Destroy previous instance if needed
    if (this.player?.destroy) {
      this.player.destroy();
    }

    // Create new player
    this.player = new window.PipedPlayer("#player", {
      id,
      autoplay: true,
      controls: true,
      related: false
    });

    // Hook into player events
    this.player.on("stateChange", (state) => {
      this._emitState(state);
    });
  }
};
