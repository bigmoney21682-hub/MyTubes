/**
 * File: GlobalPlayer.js
 * Path: src/player/GlobalPlayer.js
 * Description:
 *   Centralized YouTube Iframe Player controller.
 *   - Loads YouTube Iframe API safely
 *   - Creates player only when DOM is ready
 *   - Queues loads until API + player are ready
 *   - Retries player creation on transient failures
 *   - Handles video end → AutonextEngine.handleEnded()
 */

import { debugBus } from "../debug/debugBus.js";
import { AutonextEngine } from "./AutonextEngine.js";

class GlobalPlayerClass {
  constructor() {
    this.player = null;
    this.apiReady = false;
    this.pendingLoad = null;
    this._createAttempts = 0;

    this._onApiReady = this._onApiReady.bind(this);
    this._createPlayer = this._createPlayer.bind(this);
    this.load = this.load.bind(this);

    // Load YouTube Iframe API if not already present
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // Install global callback ONCE
    if (!window._globalPlayerCallbackInstalled) {
      window._globalPlayerCallbackInstalled = true;

      window.onYouTubeIframeAPIReady = () => {
        debugBus.player("YouTube API ready → GlobalPlayer");
        this._onApiReady();
      };
    }

    // Handle case where API is already loaded
    if (window.YT && window.YT.Player) {
      debugBus.player("YouTube API already loaded → GlobalPlayer");
      this._onApiReady();
    }
  }

  /* ------------------------------------------------------------
     API READY → Create player (if DOM exists)
  ------------------------------------------------------------ */
  _onApiReady() {
    this.apiReady = true;

    if (this.player) return;
    this._createAttempts = 0;
    this._createPlayer();
  }

  /* ------------------------------------------------------------
     Create the YT.Player instance safely, with retry
  ------------------------------------------------------------ */
  _createPlayer() {
    if (!this.apiReady) return;

    const container = document.getElementById("player");
    if (!container) {
      debugBus.warn("GlobalPlayer → #player not yet in DOM, retrying…");
      setTimeout(this._createPlayer, 50);
      return;
    }

    if (!window.YT || !window.YT.Player) {
      debugBus.warn("GlobalPlayer → YT API object not ready, retrying…");
      setTimeout(this._createPlayer, 50);
      return;
    }

    debugBus.player(
      "GlobalPlayer → Creating YT.Player instance (attempt " +
        (this._createAttempts + 1) +
        ")"
    );

    try {
      this._createAttempts += 1;

      this.player = new window.YT.Player("player", {
        height: "220",
        width: "100%",
        videoId: null,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: () => {
            debugBus.player("GlobalPlayer → Player ready");
            this._createAttempts = 0;

            if (this.pendingLoad) {
              const id = this.pendingLoad;
              this.pendingLoad = null;
              this.load(id);
            }
          },

          onStateChange: (e) => {
            debugBus.player("GlobalPlayer → State = " + e.data);

            if (e.data === window.YT.PlayerState.ENDED) {
              debugBus.player("GlobalPlayer → Video ended → AutonextEngine");
              try {
                AutonextEngine.handleEnded();
              } catch (err) {
                debugBus.error(
                  "GlobalPlayer → AutonextEngine.handleEnded failed",
                  err
                );
              }
            }
          },

          onError: (e) => {
            debugBus.error("GlobalPlayer → Error", e);
          }
        }
      });
    } catch (err) {
      debugBus.error("GlobalPlayer → Failed to create player", err);

      // Retry a few times with backoff to survive transient DOM/paint issues
      if (this._createAttempts < 10) {
        setTimeout(this._createPlayer, 100);
      }
    }
  }

  /* ------------------------------------------------------------
     Public load() method
  ------------------------------------------------------------ */
  load(videoId) {
    debugBus.player("GlobalPlayer.load(" + videoId + ")");

    if (!this.apiReady) {
      debugBus.warn("GlobalPlayer → API not ready, queuing load");
      this.pendingLoad = videoId;
      return;
    }

    if (!this.player) {
      debugBus.warn("GlobalPlayer → Player not created yet, queuing load");
      this.pendingLoad = videoId;
      this._createPlayer();
      return;
    }

    try {
      debugBus.player("GlobalPlayer → loadVideoById(" + videoId + ")");
      this.player.loadVideoById(videoId);
    } catch (err) {
      debugBus.error("GlobalPlayer → loadVideoById failed", err);
    }
  }
}

export const GlobalPlayer = new GlobalPlayerClass();
