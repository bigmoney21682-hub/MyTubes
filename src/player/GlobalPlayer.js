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
  }

  /**
   * Initialize the YouTube player.
   * Called ONCE from PlayerContext, but the actual player is only
   * created once #player exists in the DOM (Watch page).
   */
  init({ onReady, onStateChange }) {
    if (this._initStarted) {
      debugBus.player("GlobalPlayer → init() ignored (already started)");
      return;
    }

    this._initStarted = true;
    this.onReady = onReady;
    this.onStateChange = onStateChange;

    debugBus.player("GlobalPlayer → Waiting for YT API…");

    window.onYouTubeIframeAPIReady = () => {
      debugBus.player("GlobalPlayer → YT API ready");
      this._ensurePlayerCreated();
    };

    if (window.YT && window.YT.Player) {
      debugBus.player("GlobalPlayer → YT API already loaded");
      this._ensurePlayerCreated();
    }
  }

  /**
   * Ensure player exists once #player is present in DOM.
   */
  _ensurePlayerCreated() {
    if (this.player) {
      debugBus.player("GlobalPlayer → Player already exists");
      return;
    }

    const mount = document.getElementById("player");
    if (!mount) {
      debugBus.player("GlobalPlayer → #player not found yet, will wait for Watch page");
      return;
    }

    this._createPlayer(mount);
  }

  /**
   * Create the player inside the given mount.
   */
  _createPlayer(mount) {
    if (this.player) {
      debugBus.player("GlobalPlayer → Player already exists (createPlayer)");
      return;
    }

    if (!mount) {
      debugBus.player("GlobalPlayer → ERROR: mount element missing");
      return;
    }

    debugBus.player("GlobalPlayer → Creating player in #player…");

    this.player = new window.YT.Player(mount, {
      height: "100%",
      width: "100%",
      videoId: "",
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        playsinline: 1
      },
      events: {
        onReady: () => {
          debugBus.player("GlobalPlayer → Player ready");
          this.ready = true;

          try {
            this.player.setSize("100%", "100%");
            debugBus.player("GlobalPlayer → setSize(100%,100%) after init");
          } catch {}

          if (typeof this.onReady === "function") {
            this.onReady();
          }

          if (this.pendingLoad) {
            debugBus.player("GlobalPlayer → Running pending load: " + this.pendingLoad);
            this.load(this.pendingLoad);
            this.pendingLoad = null;
          }
        },

        onStateChange: (e) => {
          const state = this._translateState(e.data);
          debugBus.player("GlobalPlayer → State: " + state);

          if (typeof this.onStateChange === "function") {
            this.onStateChange(state);
          }
        }
      }
    });
  }

  /**
   * Public hook to allow Watch page to signal that #player exists.
   */
  ensureMounted() {
    if (window.YT && window.YT.Player) {
      this._ensurePlayerCreated();
    }
  }

  load(id) {
    if (!id) return;

    if (!this.player) {
      debugBus.player("GlobalPlayer → No player yet, will wait for #player and queue load(" + id + ")");
      this.pendingLoad = id;
      this._ensurePlayerCreated();
      return;
    }

    if (!this.ready) {
      debugBus.player("GlobalPlayer → Not ready, queuing load(" + id + ")");
      this.pendingLoad = id;
      return;
    }

    try {
      debugBus.player("GlobalPlayer → load(" + id + ")");
      this.player.loadVideoById(id);

      setTimeout(() => {
        try {
          this.player.setSize("100%", "100%");
          debugBus.player("GlobalPlayer → setSize after load");
        } catch {}
      }, 50);
    } catch (err) {
      debugBus.player("GlobalPlayer.load error: " + (err?.message || err));
    }
  }

  _translateState(code) {
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
