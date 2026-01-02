// File: src/player/GlobalPlayer.js

import { debugBus } from "../debug/debugBus.js";

let player = null;
let apiReady = false;
let pendingLoads = [];

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
        onReady: (event) => {
          debugBus.log("Player ready");
        },
        onStateChange: (event) => {
          debugBus.log(String(event.data));
        },
        onError: (event) => {
          debugBus.error("Player error", event.data);
        }
      }
    });
  }

  pendingLoads.forEach((id) => load(id));
  pendingLoads = [];
}

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

export const GlobalPlayer = {
  ensureMounted() {
    // no-op here; mounting is handled by Watch.jsx having #player in DOM
  },

  load(id) {
    if (!id) return;

    if (!apiReady || !player) {
      debugBus.log("YT API not ready, queueing load(" + id + ")");
      pendingLoads.push(id);
      return;
    }

    debugBus.log("Loading video " + id);
    player.loadVideoById(id);
  }
};
