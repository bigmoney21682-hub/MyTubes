/**
 * File: GlobalPlayer.js
 * Path: src/player/GlobalPlayer.js
 * Description:
 *   Centralized YouTube Iframe Player controller.
 *   - Safe API loader
 *   - Safe DOM attach
 *   - Safe pending load queue
 *   - Crash-proof initialization
 *   - No double-callbacks
 *   - AutonextEngine integration on video end
 */

import { debugBus } from "../debug/debugBus.js";
import { AutonextEngine } from "./AutonextEngine.js";

class GlobalPlayerClass {
  constructor() {
    this.player = null;
    this.apiReady = false;
    this.pendingLoad = null;

    this._onApiReady = this._onApiReady.bind(this);
    this._createPlayer = this._createPlayer.bind(this);
    this.load = this.load.bind(this);

    if (!window._globalPlayerCallbackInstalled) {
      window._globalPlayerCallbackInstalled = true;

      window.onYouTubeIframeAPIReady = () => {
        debugBus.log("YouTube API ready → GlobalPlayer");
        this._onApiReady();
      };
    }
  }

  /* ------------------------------------------------------------
     API READY → Create player (if DOM exists)
  ------------------------------------------------------------ */
  _onApiReady() {
    this.apiReady = true;

    if (this.player) return;
    this._createPlayer();
  }

  /* ------------------------------------------------------------
     Create the YT.Player instance safely
  ------------------------------------------------------------ */
  _createPlayer() {
    if (!this.apiReady) return;

    const container = document.getElementById("player");
    if (!container) {
      debugBus.warn("GlobalPlayer → #player not yet in DOM, retrying…");
      setTimeout(this._createPlayer, 50);
      return;
    }

    debugBus.log("GlobalPlayer → Creating YT.Player instance");

    try {
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
            debugBus.log("GlobalPlayer → Player ready");

            if (this.pendingLoad) {
              const id = this.pendingLoad;
              this.pendingLoad = null;
              this.load(id);
            }
          },
          onStateChange: (e) => {
            debugBus.log("GlobalPlayer → State = " + e.data);

            if (e.data === window.YT.PlayerState.ENDED) {
              debugBus.player("GlobalPlayer → Video ended → AutonextEngine");
              try {
                AutonextEngine._onVideoEnded();
              } catch (err) {
                debugBus.error(
                  "GlobalPlayer → AutonextEngine._onVideoEnded failed",
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
