/**
 * File: GlobalPlayer.js
 * Path: src/player/GlobalPlayer.js
 * Description: Centralized YouTube IFrame Player wrapper with event dispatch.
 */

import { debugBus } from "../debug/debugBus.js";

let stateListeners = [];

/* ------------------------------------------------------------
   Load YouTube IFrame API ONCE
------------------------------------------------------------- */
(function loadYouTubeAPI() {
  debugBus.log("YouTube", "Loader executed");

  if (window.YT && window.YT.Player) {
    debugBus.log("YouTube", "YT already available");
    return;
  }

  if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    debugBus.log("YouTube", "Injecting iframe_api script");

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    debugBus.log("YouTube", "iframe_api appended");
  }

  window.onYouTubeIframeAPIReady = () => {
    debugBus.log("YouTube API ready");
  };
})();

/* ------------------------------------------------------------
   GlobalPlayer API
------------------------------------------------------------- */
export const GlobalPlayer = {
  player: null,
  mounted: false,

  onStateChange(cb) {
    stateListeners.push(cb);
  },

  _emitState(state) {
    debugBus.log("GlobalPlayer → State:", state);
    stateListeners.forEach((cb) => cb(state));
  },

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

  load(id) {
    debugBus.log("GlobalPlayer", `load(${id}) called`);

    if (!this.mounted) {
      debugBus.log("GlobalPlayer", "load() called before mounted");
      return;
    }

    if (!window.YT || !window.YT.Player) {
      debugBus.log("GlobalPlayer", "YT API not ready, retrying…");
      setTimeout(() => this.load(id), 100);
      return;
    }

    const videoId = typeof id === "string" ? id : "";
    if (!videoId) {
      debugBus.error("GlobalPlayer", "Invalid video id passed to load()");
      return;
    }

    debugBus.log("GlobalPlayer", `Loading video ${videoId}`);

    if (this.player?.destroy) {
      this.player.destroy();
    }

    this.player = new window.YT.Player("player", {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0
      },
      events: {
        onReady: () => {
          debugBus.log("GlobalPlayer", "Player ready");
        },
        onStateChange: (event) => {
          this._emitState(event.data);
        }
      }
    });
  }
};
