/**
 * File: src/player/GlobalPlayer.js
 * Description:
 *   Central YouTube player wrapper.
 *   Handles:
 *     - Safe creation of YT.Player
 *     - Safe load queue
 *     - Background audio stability
 *     - Lock‑screen controls
 *     - AutonextEngine dispatch
 */

import { AutonextEngine } from "./AutonextEngine.js";
import { debugBus } from "../debug/debugBus.js";

let playerInstance = null;
let apiReady = false;
let loadQueue = [];

/**
 * Called by Watch.jsx when the YouTube API is ready.
 */
function onApiReady() {
  debugBus.player("YouTube API ready (GlobalPlayer)");
  apiReady = true;
  ensurePlayer();
  flushQueue();
}

/**
 * Create the YT.Player instance safely.
 * This version is HARD‑GUARDED against NotFoundError.
 */
function ensurePlayer() {
  if (playerInstance) return;

  const container = document.getElementById("player");

  // 🔒 HARD GUARD: If the DOM node isn't there, DO NOT create the player.
  if (!container) {
    debugBus.player(
      "GlobalPlayer.ensurePlayer → #player not found, skipping YT.Player creation"
    );
    return;
  }

  debugBus.player("GlobalPlayer.ensurePlayer → creating YT.Player");

  try {
    playerInstance = new window.YT.Player("player", {
      height: "220",
      width: "100%",
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  } catch (err) {
    debugBus.error("GlobalPlayer.ensurePlayer → YT.Player creation failed", err);
  }
}

/**
 * Flush queued loads once the player is ready.
 */
function flushQueue() {
  if (!playerInstance || !playerInstance.loadVideoById) return;

  debugBus.player(
    `GlobalPlayer → flushing queued loads: ${loadQueue.length}`
  );

  for (const vid of loadQueue) {
    trySafeLoad(vid);
  }

  loadQueue = [];
}

/**
 * Safe load wrapper.
 * If player isn't ready, queue the request.
 */
function trySafeLoad(videoId) {
  if (!playerInstance || !playerInstance.loadVideoById) {
    debugBus.player(
      "GlobalPlayer.trySafeLoad → player not ready or loadVideoById missing, queueing " +
        videoId
    );
    loadQueue.push(videoId);
    return;
  }

  debugBus.player("GlobalPlayer.trySafeLoad → loadVideoById(" + videoId + ")");
  try {
    playerInstance.loadVideoById(videoId);
  } catch (err) {
    debugBus.error("GlobalPlayer.trySafeLoad → loadVideoById failed", err);
  }
}

/**
 * Player ready event.
 */
function onPlayerReady() {
  debugBus.player("Player ready");
  flushQueue();
}

/**
 * Player state change event.
 */
function onPlayerStateChange(event) {
  debugBus.player("Player state → " + event.data);

  // 0 = ended
  if (event.data === window.YT.PlayerState.ENDED) {
    AutonextEngine.handleEnded();
  }
}

/**
 * Player error event.
 */
function onPlayerError(err) {
  debugBus.error("Player error", err);
}

/**
 * Public API: load a video safely.
 */
function load(videoId) {
  ensurePlayer();
  trySafeLoad(videoId);
}

/**
 * Export API
 */
export const GlobalPlayer = {
  onApiReady,
  load
};
