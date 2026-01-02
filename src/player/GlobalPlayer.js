// File: src/player/GlobalPlayer.js

import { debugBus } from "../debug/debugBus.js";
import { AutonextEngine } from "./AutonextEngine.js";

let player = null;
let apiReady = false;
let playerReady = false;
let pendingLoads = [];

/* YouTube API ready */
function onApiReady() {
  debugBus.info("YouTube API ready (GlobalPlayer)");
  apiReady = true;
  ensurePlayer();
}

/* Ensure player exists */
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
    playerReady = false;

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
          playerReady = true;

          const queue = [...pendingLoads];
          pendingLoads = [];

          if (queue.length) {
            debugBus.player(
              "GlobalPlayer → flushing queued loads: " + queue.length
            );
          }

          queue.forEach((id) => trySafeLoad(id));
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

/* Only call loadVideoById when safe */
function trySafeLoad(id) {
  if (!player) {
    debugBus.warn("GlobalPlayer.trySafeLoad → no player instance");
    pendingLoads.push(id);
    return;
  }

  if (!playerReady || typeof player.loadVideoById !== "function") {
    debugBus.info(
      "GlobalPlayer.trySafeLoad → player not ready or loadVideoById missing, queueing " +
        id
    );
    pendingLoads.push(id);
    return;
  }

  debugBus.player("GlobalPlayer.trySafeLoad → loadVideoById(" + id + ")");

  try {
    player.loadVideoById(id);
  } catch (err) {
    debugBus.error(
      "GlobalPlayer.trySafeLoad → loadVideoById failed: " + err?.message
    );
  }
}

/* Public API */
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

    // 🔑 No direct loadVideoById here anymore
    trySafeLoad(id);
  }
};
