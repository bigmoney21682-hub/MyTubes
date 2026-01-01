/**
 * File: GlobalPlayer.js
 * Path: src/player/GlobalPlayer.js
 * Description: Singleton wrapper around the YouTube IFrame Player API.
 *              Mounts directly into #player on the Watch page.
 */

import { debugBus } from "../debug/debugBus.js";

class GlobalPlayerClass {
  constructor() {
    this.player = null;
    this.ready = false;
    this.pendingLoad = null;
    this.onReady = null;
    this.onStateChange = null;

    this._initStarted = false;
    this._mountCheckInterval = null;
  }

  init({ onReady, onStateChange }) {
    if (this._initStarted) {
      debugBus.log("PLAYER", "GlobalPlayer → init() ignored (already started)");
      return;
    }

    this._initStarted = true;
    this.onReady = onReady;
    this.onStateChange = onStateChange;

    debugBus.log("PLAYER", "GlobalPlayer → Waiting for YT API…");

    window.onYouTubeIframeAPIReady = () => {
      debugBus.log("PLAYER", "GlobalPlayer → YT API ready (callback)");
      this.ensureMounted();
    };

    if (window.YT && window.YT.Player) {
      debugBus.log("PLAYER", "GlobalPlayer → YT API already loaded");
      this.ensureMounted();
    }
  }

  ensureMounted() {
    if (this.player) return;
    if (this._mountCheckInterval) return;

    let attempts = 0;
    const maxAttempts = 50;

    this._mountCheckInterval = setInterval(() => {
      const mount = document.getElementById("player");

      if (mount) {
        clearInterval(this._mountCheckInterval);
        this._mountCheckInterval = null;
        this._createPlayer(mount);
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        clearInterval(this._mountCheckInterval);
        this._mountCheckInterval = null;
        debugBus.log("PLAYER", "GlobalPlayer → ERROR: #player never appeared");
      } else if (attempts === 1) {
        debugBus.log(
          "PLAYER",
          "GlobalPlayer → #player not found yet, will wait for Watch page"
        );
      }
    }, 100);
  }

  _createPlayer(mount) {
    if (this.player) {
      debugBus.log("PLAYER", "GlobalPlayer → Player already exists (createPlayer)");
      return;
    }

    if (!mount) {
      debugBus.log("PLAYER", "GlobalPlayer → ERROR: mount element missing");
      return;
    }

    if (!window.YT || !window.YT.Player) {
      debugBus.log(
        "PLAYER",
        "GlobalPlayer → ERROR: YT API not ready in _createPlayer"
      );
      return;
    }

    debugBus.log("PLAYER", "GlobalPlayer → Creating player in #player…");

    this.player = new window.YT.Player(mount, {
      height: "100%",
      width: "100%",
      videoId: "",
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        playsinline: 1,
        modestbranding: 1,
        iv_load_policy: 3,
        showinfo: 0,
        disablekb: 0
      },
      events: {
        onReady: () => {
          debugBus.log("PLAYER", "GlobalPlayer → Player ready");
          this.ready = true;

          // ⭐ REMOVED: setSize() call that caused background pauses

          if (typeof this.onReady === "function") {
            this.onReady();
          }

          if (this.pendingLoad) {
            const id = this.pendingLoad;
            this.pendingLoad = null;
            debugBus.log(
              "PLAYER",
              "GlobalPlayer → Running pending load after ready: " + id
            );
            this._safeLoadNow(id);
          }
        },

        onStateChange: (e) => {
          const state = this._translateState(e.data);
          debugBus.log("PLAYER", "GlobalPlayer → State: " + state);

          if (typeof this.onStateChange === "function") {
            this.onStateChange(state);
          }
        }
      }
    });
  }

  load(id) {
    if (!id) return;

    if (!this.player) {
      debugBus.log(
        "PLAYER",
        "GlobalPlayer → No player yet, will wait for #player and queue load(" + id + ")"
      );
      this.pendingLoad = id;
      this.ensureMounted();
      return;
    }

    if (!this.ready) {
      debugBus.log("PLAYER", "GlobalPlayer → Not ready, queuing load(" + id + ")");
      this.pendingLoad = id;
      return;
    }

    this._safeLoadNow(id);
  }

  _safeLoadNow(id) {
    try {
      if (!this.player || !this.ready) {
        debugBus.log(
          "PLAYER",
          "GlobalPlayer → _safeLoadNow called but player not ready, re-queuing " + id
        );
        this.pendingLoad = id;
        return;
      }

      debugBus.log("PLAYER", "GlobalPlayer → load(" + id + ")");
      this.player.loadVideoById(id);

      // ⭐ REMOVED: 50ms timeout + setSize() that caused background pauses

    } catch (err) {
      debugBus.log("PLAYER", "GlobalPlayer.load error: " + (err?.message || err));
    }
  }

  _translateState(code) {
    if (!window.YT || !window.YT.PlayerState) return "unknown";

    switch (code) {
      case window.YT.PlayerState.UNSTARTED:
        return "unstarted";
      case window.YT.PlayerState.ENDED:
        return "ended";
      case window.YT.PlayerState.PLAYING:
        return "playing";
      case window.YT.PlayerState.PAUSED:
        return "paused";
      case window.YT.PlayerState.BUFFERING:
        return "buffering";
      case window.YT.PlayerState.CUED:
        return "cued";
      default:
        return "unknown";
    }
  }
}

export const GlobalPlayer = new GlobalPlayerClass();
window.GlobalPlayer = GlobalPlayer;
