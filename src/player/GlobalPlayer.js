/**
 * File: src/player/GlobalPlayer.js
 * Description:
 *   Singleton YouTube player controller.
 *   - Creates the iframe once
 *   - Loads videos without remounting
 *   - Emits ended → AutonextEngine.handleEnded()
 */

import { AutonextEngine } from "./AutonextEngine.js";
import { debugBus } from "../debug/debugBus.js";

class GlobalPlayerClass {
  constructor() {
    this.player = null;
    this.apiReady = false;
    this.pendingVideoId = null;
  }

  /**
   * Called by Watch.jsx when the YouTube API is ready.
   * Creates the player if it doesn't exist.
   */
  onApiReady() {
    if (this.apiReady) return;
    this.apiReady = true;

    debugBus.player("GlobalPlayer → API ready");

    // If player already exists, do nothing
    if (this.player) return;

    const container = document.getElementById("player");
    if (!container) {
      debugBus.error("GlobalPlayer → #player container not found");
      return;
    }

    debugBus.player("GlobalPlayer → Creating YT.Player");

    this.player = new window.YT.Player("player", {
      height: "220",
      width: "100%",
      videoId: null,
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: () => this.onPlayerReady(),
        onStateChange: (e) => this.onStateChange(e)
      }
    });
  }

  /**
   * Player is ready — load any pending video.
   */
  onPlayerReady() {
    debugBus.player("GlobalPlayer → Player ready");

    if (this.pendingVideoId) {
      this.load(this.pendingVideoId);
      this.pendingVideoId = null;
    }
  }

  /**
   * Load a video into the existing iframe.
   */
  load(id) {
    if (!id) return;

    debugBus.player("GlobalPlayer → load(" + id + ")");

    // If API not ready yet, store for later
    if (!this.apiReady || !this.player) {
      this.pendingVideoId = id;
      return;
    }

    try {
      this.player.loadVideoById(id);
    } catch (err) {
      debugBus.error("GlobalPlayer → loadVideoById error", err);
    }
  }

  /**
   * Handle YouTube player state changes.
   */
  onStateChange(event) {
    const state = event.data;

    if (state === window.YT.PlayerState.ENDED) {
      debugBus.player("GlobalPlayer → Video ended → AutonextEngine.handleEnded()");
      AutonextEngine.handleEnded();
    }
  }
}

export const GlobalPlayer = new GlobalPlayerClass();
