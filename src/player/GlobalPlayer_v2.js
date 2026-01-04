throw new Error("GlobalPlayer_v2.js → FORCED CRASH");


/**
 * ------------------------------------------------------------
 * File: GlobalPlayer_v2.js (DEBUG INSTRUMENTED)
 * Path: src/player/GlobalPlayer_v2.js
 * Description:
 *   Centralized YouTube IFrame API controller.
 *   This version includes full debug logging to trace:
 *     - File load
 *     - init() execution
 *     - API readiness
 *     - Mount point existence
 *     - Player creation
 *     - loadVideoById calls
 *     - onReady / onStateChange
 * ------------------------------------------------------------
 */

window.bootDebug?.player("GlobalPlayer_v2.js → FILE LOADED");
console.log("GlobalPlayer_v2.js → FILE LOADED");

export const GlobalPlayer = {
  _player: null,
  _apiReady: false,
  _pendingVideoId: null,
  _initialized: false,

  init() {
    window.bootDebug?.player("GlobalPlayer.init() → ENTERED");
    console.log("GlobalPlayer.init() → ENTERED");

    if (this._initialized) {
      window.bootDebug?.player("GlobalPlayer.init() → ALREADY INITIALIZED");
      return;
    }

    this._initialized = true;

    // Check mount point
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
      window.bootDebug?.player("GlobalPlayer.init() → API READY, creating player");
      this._createPlayer(mount);
      return;
    }

    // Otherwise wait for API
    window.bootDebug?.player("GlobalPlayer.init() → Waiting for YT API");
    console.log("GlobalPlayer.init() → Waiting for YT API");
  },

  _createPlayer(mount) {
    window.bootDebug?.player("GlobalPlayer → Creating YT.Player instance");
    console.log("GlobalPlayer → Creating YT.Player instance");

    try {
      this._player = new YT.Player(mount, {
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: (e) => {
            window.bootDebug?.player("GlobalPlayer → onReady");
            console.log("GlobalPlayer → onReady");

            if (this._pendingVideoId) {
              this.loadVideo(this._pendingVideoId);
              this._pendingVideoId = null;
            }
          },
          onStateChange: (e) => {
            window.bootDebug?.player("GlobalPlayer → onStateChange =", e.data);
            console.log("GlobalPlayer → onStateChange =", e.data);
          }
        }
      });
    } catch (err) {
      window.bootDebug?.player("GlobalPlayer → FAILED to create player");
      console.error("GlobalPlayer → FAILED to create player", err);
    }
  },

  loadVideo(videoId) {
    window.bootDebug?.player("GlobalPlayer.loadVideo() →", videoId);
    console.log("GlobalPlayer.loadVideo() →", videoId);

    if (!this._player) {
      window.bootDebug?.player("GlobalPlayer.loadVideo() → NO PLAYER, QUEUING");
      console.log("GlobalPlayer.loadVideo() → NO PLAYER, QUEUING");
      this._pendingVideoId = videoId;
      return;
    }

    try {
      this._player.loadVideoById(videoId);
      window.bootDebug?.player("GlobalPlayer.loadVideo() → loadVideoById OK");
      console.log("GlobalPlayer.loadVideo() → loadVideoById OK");
    } catch (err) {
      window.bootDebug?.player("GlobalPlayer.loadVideo() → ERROR");
      console.error("GlobalPlayer.loadVideo() → ERROR", err);
    }
  },

  togglePlay() {
    if (!this._player) {
      window.bootDebug?.player("GlobalPlayer.togglePlay() → NO PLAYER");
      console.log("GlobalPlayer.togglePlay() → NO PLAYER");
      return;
    }

    const state = this._player.getPlayerState();
    window.bootDebug?.player("GlobalPlayer.togglePlay() → state =", state);
    console.log("GlobalPlayer.togglePlay() → state =", state);

    if (state === YT.PlayerState.PLAYING) {
      this._player.pauseVideo();
    } else {
      this._player.playVideo();
    }
  }
};

// ------------------------------------------------------------
// YouTube API Ready Callback
// ------------------------------------------------------------
window.onYouTubeIframeAPIReady = () => {
  window.bootDebug?.player("YT API → READY");
  console.log("YT API → READY");

  GlobalPlayer._apiReady = true;

  // Try to initialize again now that API is ready
  GlobalPlayer.init();
};
