/**
 * File: GlobalPlayerFix.js
 * Path: src/player/GlobalPlayerFix.js
 * Description:
 *   Final, stable, non–tree-shaken global player engine.
 *   - NO auto-init on module load (PlayerShell controls init timing)
 *   - Safe mount detection
 *   - Safe API-ready handling
 *   - Safe pending video handling
 *   - Clean YT.Player lifecycle
 */

import { AutonextEngine } from "./AutonextEngine.js";

console.log("GlobalPlayerFix.js → FILE LOADED at path:", import.meta.url);
window.bootDebug?.player(
  "GlobalPlayerFix.js → FILE LOADED at path: " + import.meta.url
);
window.bootDebug?.player("GlobalPlayerFix.js → FILE LOADED");

export const GlobalPlayer = {
  _player: null,
  _apiReady: false,
  _pendingVideoId: null,
  _initialized: false,

  /* ------------------------------------------------------------
     init()
     Called ONLY from PlayerShell AFTER mount exists.
  ------------------------------------------------------------ */
  init() {
    window.bootDebug?.player("GlobalPlayer.init() → ENTERED");
    console.log("GlobalPlayer.init() → ENTERED");

    if (this._initialized) {
      window.bootDebug?.player("GlobalPlayer.init() → ALREADY INITIALIZED");
      return;
    }

    this._initialized = true;

    const mount = document.getElementById("global-player-iframe");
    window.bootDebug?.player("GlobalPlayer.init() → mount =", mount);
    console.log("GlobalPlayer.init() → mount =", mount);

    if (!mount) {
      window.bootDebug?.player("GlobalPlayer.init() → MOUNT NOT FOUND");
      console.warn("GlobalPlayer.init(): mount point missing");
      return;
    }

    // If API already ready, create player immediately
    if (this._apiReady) {
      window.bootDebug?.player(
        "GlobalPlayer.init() → API READY, creating player"
      );
      this._createPlayer(mount);
      return;
    }

    // Otherwise wait for API
    window.bootDebug?.player("GlobalPlayer.init() → WAITING FOR API");
  },

  /* ------------------------------------------------------------
     load(videoId)
     Called by PlayerContext.loadVideo()
  ------------------------------------------------------------ */
  load(videoId) {
    window.bootDebug?.player("GlobalPlayer.load(" + videoId + ")");
    console.log("GlobalPlayer.load(" + videoId + ")");

    if (!this._player) {
      window.bootDebug?.player("GlobalPlayer.load → NO PLAYER YET, pending");
      this._pendingVideoId = videoId;
      return;
    }

    try {
      this._player.loadVideoById(videoId);
    } catch (err) {
      console.warn("GlobalPlayer.load() failed:", err);
    }
  },

  /* ------------------------------------------------------------
     Internal: create YT.Player instance
  ------------------------------------------------------------ */
  _createPlayer(mount) {
    window.bootDebug?.player("GlobalPlayer._createPlayer() → ENTERED");
    console.log("GlobalPlayer._createPlayer() → ENTERED");

    this._player = new YT.Player(mount, {
      height: "100%",
      width: "100%",
      videoId: this._pendingVideoId || "",
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        playsinline: 1
      },
      events: {
        onReady: (e) => {
          window.bootDebug?.player("GlobalPlayer → onReady");
          console.log("GlobalPlayer → onReady");

          if (this._pendingVideoId) {
            e.target.loadVideoById(this._pendingVideoId);
            this._pendingVideoId = null;
          }
        },

        onStateChange: (e) => {
          const state = e.data;
          window.bootDebug?.player(
            "GlobalPlayer → onStateChange " + state
          );
          console.log("GlobalPlayer → onStateChange", state);

          // YT.PlayerState.ENDED === 0
          if (state === YT.PlayerState.ENDED || state === 0) {
            window.bootDebug?.player(
              "GlobalPlayer → detected ENDED, calling AutonextEngine.handleEnded()"
            );
            try {
              AutonextEngine.handleEnded();
            } catch (err) {
              console.warn(
                "GlobalPlayer → AutonextEngine.handleEnded() failed:",
                err
              );
            }
          }
        },

        onError: (e) => {
          window.bootDebug?.player(
            "GlobalPlayer → onError " + JSON.stringify(e)
          );
          console.log("GlobalPlayer → onError", e);
        }
      }
    });
  }
};

/* ------------------------------------------------------------
   YouTube IFrame API callback
   (fires BEFORE or AFTER init() depending on load order)
------------------------------------------------------------ */
window.onYouTubeIframeAPIReady = () => {
  window.bootDebug?.player("YT API → READY");
  console.log("YT API → READY");

  GlobalPlayer._apiReady = true;

  // If init() already ran and mount exists, create player now
  if (GlobalPlayer._initialized) {
    const mount = document.getElementById("global-player-iframe");
    if (mount) {
      window.bootDebug?.player("YT API → creating player immediately");
      GlobalPlayer._createPlayer(mount);
    }
  }
};
