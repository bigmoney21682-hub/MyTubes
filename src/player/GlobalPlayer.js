/**
 * File: GlobalPlayer.js
 * Path: src/player/GlobalPlayer.js
 * Description: Singleton wrapper around YouTube IFrame API.
 *              Provides safe load/play/pause and event callbacks.
 *              Fully crash‑proof for iOS/Safari timing issues.
 */

import { debugBus } from "../debug/debugBus.js";

let player = null;
let ready = false;
let pendingLoad = null;

let stateChangeCallbacks = [];
let endedCallbacks = [];

// Prevent double init
let initialized = false;

export const GlobalPlayer = {
  /**
   * Initialize YouTube IFrame API player.
   * Safe to call multiple times — only initializes once.
   */
  init() {
    if (initialized) {
      debugBus.player("GlobalPlayer.init() skipped (already initialized)");
      return;
    }
    initialized = true;

    debugBus.player("GlobalPlayer.init() starting…");

    // Ensure YT API exists
    if (!window.YT || !window.YT.Player) {
      debugBus.player("GlobalPlayer.init() → YT API not ready, waiting…");

      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          debugBus.player("GlobalPlayer → YT API detected");
          this._createPlayer();
        }
      }, 50);

      return;
    }

    this._createPlayer();
  },

  /**
   * Internal: create the iframe player safely.
   */
  _createPlayer() {
    try {
      player = new window.YT.Player("global-player", {
        height: "0",
        width: "0",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            debugBus.player("GlobalPlayer → onReady");
            ready = true;

            if (pendingLoad) {
              debugBus.player("GlobalPlayer → Executing pending load: " + pendingLoad);
              player.loadVideoById(pendingLoad);
              pendingLoad = null;
            }
          },

          onStateChange: (event) => {
            const state = event?.data;
            debugBus.player("GlobalPlayer → onStateChange: " + state);

            for (const cb of stateChangeCallbacks) {
              try {
                cb(state);
              } catch (err) {
                debugBus.player("GlobalPlayer → stateChange callback error: " + err?.message);
              }
            }

            // Fire ended callbacks
            if (state === window.YT.PlayerState.ENDED) {
              for (const cb of endedCallbacks) {
                try {
                  cb();
                } catch (err) {
                  debugBus.player("GlobalPlayer → ended callback error: " + err?.message);
                }
              }
            }
          }
        }
      });

      debugBus.player("GlobalPlayer → Player created");
    } catch (err) {
      debugBus.player("GlobalPlayer._createPlayer error: " + err?.message);
    }
  },

  /**
   * Load a video safely.
   */
  load(videoId) {
    if (!videoId) {
      debugBus.player("GlobalPlayer.load() ignored (no videoId)");
      return;
    }

    debugBus.player("GlobalPlayer.load(" + videoId + ")");

    if (!ready || !player) {
      debugBus.player("GlobalPlayer → Not ready, storing pending load");
      pendingLoad = videoId;
      return;
    }

    try {
      player.loadVideoById(videoId);
    } catch (err) {
      debugBus.player("GlobalPlayer.load error: " + err?.message);
    }
  },

  play() {
    if (!ready || !player) return;
    try {
      player.playVideo();
    } catch (err) {
      debugBus.player("GlobalPlayer.play error: " + err?.message);
    }
  },

  pause() {
    if (!ready || !player) return;
    try {
      player.pauseVideo();
    } catch (err) {
      debugBus.player("GlobalPlayer.pause error: " + err?.message);
    }
  },

  onStateChange(cb) {
    if (typeof cb !== "function") return;
    stateChangeCallbacks.push(cb);
  },

  onEnded(cb) {
    if (typeof cb !== "function") return;
    endedCallbacks.push(cb);
  }
};
