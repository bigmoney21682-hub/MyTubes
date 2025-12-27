/**
 * File: youtube.js
 * Path: src/api/youtube.js
 * Description: Full YouTube IFrame Player wrapper with persistent instance,
 *              accurate event mapping, debugBus logging, and clean teardown.
 */

import { logPlayerState, logPlayerEvent } from "../player/playerDebug";
import { debugBus } from "../debug/debugBus";

let player = null;
let apiReady = false;
let pendingVideoId = null;

// ------------------------------------------------------------
// Load YouTube IFrame API (only once)
// ------------------------------------------------------------
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    apiReady = true;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      resolve();
    };
  });
}

// ------------------------------------------------------------
// Create or reuse player instance
// ------------------------------------------------------------
async function ensurePlayer(containerId) {
  await loadYouTubeAPI();

  if (player) return player;

  player = new window.YT.Player(containerId, {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: () => {
        logPlayerState("ready");
        debugBus.log("PLAYER", "IFrame ready");

        if (pendingVideoId) {
          player.loadVideoById(pendingVideoId);
          pendingVideoId = null;
        }
      },

      onStateChange: (e) => {
        const stateMap = {
          [window.YT.PlayerState.UNSTARTED]: "unstarted",
          [window.YT.PlayerState.ENDED]: "ended",
          [window.YT.PlayerState.PLAYING]: "playing",
          [window.YT.PlayerState.PAUSED]: "paused",
          [window.YT.PlayerState.BUFFERING]: "buffering",
          [window.YT.PlayerState.CUED]: "cued"
        };

        const state = stateMap[e.data] || "unknown";
        logPlayerState(state);
        debugBus.log("PLAYER", "State → " + state);
      },

      onError: (e) => {
        logPlayerEvent("error", { code: e.data });
        debugBus.log("PLAYER", "Error → " + e.data);
      }
    }
  });

  return player;
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------
export async function loadVideo(containerId, videoId) {
  window.bootDebug?.player("loadVideo → " + videoId);

  const p = await ensurePlayer(containerId);

  if (!apiReady) {
    pendingVideoId = videoId;
    return;
  }

  try {
    p.loadVideoById(videoId);
    logPlayerEvent("load", { videoId });
  } catch (err) {
    debugBus.log("PLAYER", "loadVideo error: " + err.message);
  }
}

export function play() {
  try {
    player?.playVideo();
    logPlayerEvent("play");
  } catch (_) {}
}

export function pause() {
  try {
    player?.pauseVideo();
    logPlayerEvent("pause");
  } catch (_) {}
}

export function seek(seconds) {
  try {
    player?.seekTo(seconds, true);
    logPlayerEvent("seek", { seconds });
  } catch (_) {}
}

export function destroyPlayer() {
  if (player) {
    try {
      player.destroy();
      debugBus.log("PLAYER", "Player destroyed");
    } catch (_) {}
  }
  player = null;
}
