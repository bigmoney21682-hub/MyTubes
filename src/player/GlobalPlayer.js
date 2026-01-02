/**
 * File: src/player/GlobalPlayer.js
 * Description:
 *   Singleton wrapper around the YouTube IFrame API.
 *   Handles:
 *     - API readiness
 *     - Lazy player creation
 *     - Safe video loading
 *     - Autonext integration
 */

import { debugBus } from "../debug/debugBus.js";
import { AutonextEngine } from "./AutonextEngine.js";

let player = null;
let apiReady = false;
let pendingLoads = [];

/* ------------------------------------------------------------
   Called by Watch.jsx when the YouTube API is ready
------------------------------------------------------------- */
function onApiReady() {
  debugBus.info("YouTube API ready (GlobalPlayer)");
  apiReady = true;

  ensurePlayer();

  // Flush queued loads
  if (pendingLoads.length > 0) {
    debugBus.info("GlobalPlayer → flushing queued loads: " + pendingLoads.length);
  }

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
    debugBus.warn("GlobalPlayer.ensurePlayer → #player missing, retrying…");
    setTimeout(ensurePlayer, 50);
    return false;
  }

  debugBus.info("GlobalPlayer.ensurePlayer → creating YT.Player");

  try {
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
          debugBus.player("Player ready");
        },
        onStateChange: (event) => {
          debugBus.player("Player state → " + event.data);

          if (event.data === window.YT.PlayerState.ENDED) {
            AutonextEngine.handleEnded();
          }
        },
        onError: (event) => {
          debugBus.error("Player error: " + event.data);
        }
      }
    });
  } catch (err) {
    debugBus.error("YT.Player constructor failed: " + err?.message);
  }

  return true;
}

/* ------------------------------------------------------------
   Public API
------------------------------------------------------------- */
export const GlobalPlayer = {
  onApiReady,

  load(id) {
    if (!id) {
      debugBus.warn("GlobalPlayer.load → no id provided");
      return;
    }

    if (!apiReady) {
      debugBus.info("GlobalPlayer.load → API not ready, queueing " + id);
      pendingLoads.push(id);
      return;
    }

    if (!ensurePlayer()) {
      debugBus.info("GlobalPlayer.load → player not ready, queueing " + id);
      pendingLoads.push(id);
      return;
    }

    debugBus.player("Loading video " + id);

    try {
      player.loadVideoById(id);
    } catch (err) {
      debugBus.error("GlobalPlayer.load → loadVideoById failed: " + err?.message);
    }
  }
};
