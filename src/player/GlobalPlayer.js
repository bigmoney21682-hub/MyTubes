/**
 * File: GlobalPlayer.js
 * Path: src/player/GlobalPlayer.js
 * Description: Singleton YouTube IFrame player, soft-reload mode, living in the
 *              hidden #global-player-root container in index.html.
 *              Exposes a simple control API and event subscription hooks.
 */

import { debugBus } from "../debug/debugBus.js";

const YT_IFRAME_API_SRC = "https://www.youtube.com/iframe_api";
const ROOT_ELEMENT_ID = "global-player-root";

// Internal singleton state
let ytScriptLoaded = false;
let ytApiReady = false;
let player = null;
let pendingVideoId = null;
let onStateChangeCallbacks = [];
let onEndedCallbacks = [];

// ---------------------------------------------------------------------------
// Script loading
// ---------------------------------------------------------------------------

function ensureRootElement() {
  const el = document.getElementById(ROOT_ELEMENT_ID);
  if (!el) {
    debugBus.player(
      `GlobalPlayer → Missing #${ROOT_ELEMENT_ID} in index.html`
    );
    return null;
  }
  return el;
}

function injectYouTubeScript() {
  if (ytScriptLoaded) return;

  const existing = document.querySelector(`script[src="${YT_IFRAME_API_SRC}"]`);
  if (existing) {
    ytScriptLoaded = true;
    debugBus.player("GlobalPlayer → YouTube IFrame API script already present");
    return;
  }

  const tag = document.createElement("script");
  tag.src = YT_IFRAME_API_SRC;
  document.body.appendChild(tag);

  ytScriptLoaded = true;
  debugBus.player("GlobalPlayer → Injected YouTube IFrame API script");
}

// Called by YouTube when API is ready (global hook)
window.onYouTubeIframeAPIReady = () => {
  ytApiReady = true;
  debugBus.player("GlobalPlayer → onYouTubeIframeAPIReady");

  createPlayerIfNeeded();
};

// ---------------------------------------------------------------------------
// Player creation / soft reload
// ---------------------------------------------------------------------------

function createPlayerIfNeeded() {
  if (!ytApiReady) {
    debugBus.player("GlobalPlayer → createPlayerIfNeeded called before API ready");
    return;
  }
  if (player) return;

  const root = ensureRootElement();
  if (!root) return;

  root.innerHTML = ""; // ensure clean slate
  const container = document.createElement("div");
  container.id = "global-player-iframe";
  root.appendChild(container);

  debugBus.player("GlobalPlayer → Creating YT.Player instance");

  player = new window.YT.Player(container.id, {
    height: "360",
    width: "640",
    videoId: pendingVideoId || "",
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: () => {
        debugBus.player("GlobalPlayer → Player ready");
        // If something requested a video before ready, load it now
        if (pendingVideoId) {
          debugBus.player(
            `GlobalPlayer → Soft-loading pending video ${pendingVideoId}`
          );
          player.loadVideoById(pendingVideoId);
          pendingVideoId = null;
        }
      },
      onStateChange: (e) => {
        const map = {
          "-1": "unstarted",
          "0": "ended",
          "1": "playing",
          "2": "paused",
          "3": "buffering",
          "5": "cued"
        };
        const label = map[e.data] ?? `unknown(${e.data})`;
        debugBus.player(`GlobalPlayer → State: ${label}`);

        // Notify subscribers
        onStateChangeCallbacks.forEach((cb) => {
          try {
            cb(e.data);
          } catch (err) {
            debugBus.player(
              "GlobalPlayer → onStateChange callback error: " + err?.message
            );
          }
        });

        if (e.data === window.YT.PlayerState.ENDED) {
          onEndedCallbacks.forEach((cb) => {
            try {
              cb();
            } catch (err) {
              debugBus.player(
                "GlobalPlayer → onEnded callback error: " + err?.message
              );
            }
          });
        }
      },
      onError: (e) => {
        debugBus.player(`GlobalPlayer → Error: ${e.data}`);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize the global player. Call once during app boot (e.g. in App.jsx).
 */
function init() {
  debugBus.player("GlobalPlayer.init()");

  ensureRootElement();
  injectYouTubeScript();

  // If API already ready (e.g. cached), create player immediately
  if (window.YT && window.YT.Player && !player) {
    ytApiReady = true;
    createPlayerIfNeeded();
  }
}

/**
 * Load a video by ID using soft reload (loadVideoById).
 */
function load(videoId) {
  debugBus.player(`GlobalPlayer.load(${videoId})`);

  if (!videoId) return;

  pendingVideoId = videoId;

  if (player && ytApiReady) {
    player.loadVideoById(videoId);
    return;
  }

  // Player not ready yet: ensure script + root, create when API ready
  injectYouTubeScript();
  createPlayerIfNeeded();
}

/**
 * Control helpers
 */
function play() {
  if (player && player.playVideo) {
    player.playVideo();
  }
}

function pause() {
  if (player && player.pauseVideo) {
    player.pauseVideo();
  }
}

function seek(seconds) {
  if (player && player.seekTo) {
    player.seekTo(seconds, true);
  }
}

function setVolume(volume) {
  if (player && player.setVolume) {
    player.setVolume(volume);
  }
}

function getCurrentTime() {
  if (player && player.getCurrentTime) {
    return player.getCurrentTime();
  }
  return 0;
}

function getDuration() {
  if (player && player.getDuration) {
    return player.getDuration();
  }
  return 0;
}

/**
 * Event subscriptions
 */
function onStateChange(cb) {
  if (typeof cb === "function") {
    onStateChangeCallbacks.push(cb);
  }
}

function onEnded(cb) {
  if (typeof cb === "function") {
    onEndedCallbacks.push(cb);
  }
}

// ---------------------------------------------------------------------------
// Exported singleton API
// ---------------------------------------------------------------------------

export const GlobalPlayer = {
  init,
  load,
  play,
  pause,
  seek,
  setVolume,
  getCurrentTime,
  getDuration,
  onStateChange,
  onEnded
};
