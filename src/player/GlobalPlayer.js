// File: src/player/GlobalPlayer.js

import { debugBus } from "../debug/debugBus.js";
import { AutonextEngine } from "./AutonextEngine.js";

let player = null;
let apiReady = false;
let pendingLoads = [];

/* ------------------------------------------------------------
   Called by Watch.jsx when the YouTube API is ready
------------------------------------------------------------- */
function onApiReady() {
  debugBus.log("YouTube API ready (GlobalPlayer)");
  apiReady = true;

  // Try to create the player now that API is ready
  ensurePlayer();

  // Flush any queued loads
  pendingLoads.forEach((id) => GlobalPlayer.load(id));
  pendingLoads = [];
}

/* ------------------------------------------------------------
   Ensure player exists (lazy creation)
------------------------------------------------------------- */
function ensurePlayer() {
  if (!apiReady) return false;
  if (player) return true;

  const container = document.getElementById("player");
  if (!container) {
    debugBus.log("GlobalPlayer.ensurePlayer → #player missing, retrying…");
    setTimeout(ensurePlayer, 50);
    return false;
  }

  debugBus.log("GlobalPlayer.ensurePlayer → creating YT.Player");

  player = new window.YT.Player("player", {
    height: "220",
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
        debugBus.log("Player ready");
      },
      onStateChange: (event) => {
        debugBus.log(String(event.data));

        if (event.data === window.YT.PlayerState.ENDED) {
          debugBus.log("Player state → ENDED → AutonextEngine.handleEnded()");
          AutonextEngine.handleEnded();
        }
      },
      onError: (event) => {
        debugBus.error("Player error", event.data);
      }
    }
  });

  return true;
}

/* ------------------------------------------------------------
   Public API
------------------------------------------------------------- */
export const GlobalPlayer = {
  // Called by Watch.jsx when the API script fires its callback
  onApiReady,

  ensureMounted() {
    // no-op for now; kept for compatibility
  },

  load(id) {
    if (!id) return;

    if (!apiReady) {
      debugBus.log("GlobalPlayer.load → API not ready, queueing " + id);
      pendingLoads.push(id);
      return;
    }

    if (!ensurePlayer()) {
      debugBus.log("GlobalPlayer.load → player not ready, queueing " + id);
      pendingLoads.push(id);
      return;
    }

    debugBus.log("Loading video " + id);
    try {
      player.loadVideoById(id);
    } catch (err) {
      debugBus.error("GlobalPlayer.load error:", err);
    }
  }
};
