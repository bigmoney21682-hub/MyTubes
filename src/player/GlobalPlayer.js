// File: src/player/GlobalPlayer.js

import { debugBus } from "../debug/debugBus.js";
import { AutonextEngine } from "./AutonextEngine.js";

let player = null;
let apiReady = false;
let pendingLoads = [];

// Optional config injected by PlayerContext
let config = {
  onReady: null,
  onStateChange: null
};

/* ------------------------------------------------------------
   YouTube API Ready → Create Player
------------------------------------------------------------- */
function onYouTubeIframeAPIReady() {
  debugBus.log("YouTube API ready");
  apiReady = true;

  if (!player) {
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

          if (config.onReady) {
            try {
              config.onReady();
            } catch (err) {
              debugBus.error("GlobalPlayer onReady callback error:", err);
            }
          }
        },

        onStateChange: (event) => {
          debugBus.log(String(event.data));

          if (config.onStateChange) {
            try {
              config.onStateChange(event.data);
            } catch (err) {
              debugBus.error("GlobalPlayer onStateChange callback error:", err);
            }
          }

          // 0 = ENDED
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
  }

  // Process queued loads
  pendingLoads.forEach((id) => load(id));
  pendingLoads = [];
}

/* ------------------------------------------------------------
   Inject YouTube IFrame API script (once)
------------------------------------------------------------- */
if (typeof window !== "undefined") {
  if (!window.onYouTubeIframeAPIReady) {
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  }

  if (!document.getElementById("youtube-iframe-api")) {
    const tag = document.createElement("script");
    tag.id = "youtube-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

/* ------------------------------------------------------------
   GlobalPlayer API
------------------------------------------------------------- */
export const GlobalPlayer = {
  /* Called once by PlayerContext */
  init(cfg) {
    config = cfg || {};
    debugBus.log("GlobalPlayer.init() called");
  },

  /* Called by Watch.jsx */
  ensureMounted() {
    // No-op: #player div in Watch.jsx is enough
  },

  /* Load a video by ID */
  load(id) {
    if (!id) return;

    if (!apiReady || !player) {
      debugBus.log("YT API not ready, queueing load(" + id + ")");
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
