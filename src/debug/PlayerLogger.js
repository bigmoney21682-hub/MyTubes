/**
 * File: PlayerLogger.js
 * Path: src/debug/PlayerLogger.js
 * Description:
 *   EXTREME player diagnostics:
 *     - Logs HTML5 <video> events
 *     - Logs YouTube API readiness
 *     - Logs DOM mutations around #player
 *     - Logs iframe creation/removal
 *     - Logs YT.Player constructor attempts
 *     - Detects overwritten API callbacks
 */

import { debugBus } from "./debugBus.js";

export function installPlayerLogger() {
  if (window.__playerLoggerInstalled) return;
  window.__playerLoggerInstalled = true;

  debugBus.log("PLAYER", "PlayerLogger installed (EXTREME MODE)");

  /* ------------------------------------------------------------
     1. Detect if YT API callback is overwritten
  ------------------------------------------------------------ */
  let originalSetter = Object.getOwnPropertyDescriptor(window, "onYouTubeIframeAPIReady");

  Object.defineProperty(window, "onYouTubeIframeAPIReady", {
    configurable: true,
    enumerable: true,
    set(fn) {
      debugBus.log("PLAYER", "onYouTubeIframeAPIReady overwritten", { fn });
      if (typeof fn === "function") {
        window.__ytApiCallback = fn;
      }
    },
    get() {
      return window.__ytApiCallback;
    }
  });

  /* ------------------------------------------------------------
     2. Log when YT API actually fires
  ------------------------------------------------------------ */
  window.__ytApiCallback = function () {
    debugBus.log("PLAYER", "YouTube API ready (callback fired)");
  };

  /* ------------------------------------------------------------
     3. Log when YT.Player constructor is called
  ------------------------------------------------------------ */
  const originalPlayer = window.YT?.Player;

  if (originalPlayer) {
    window.YT.Player = function (...args) {
      debugBus.log("PLAYER", "YT.Player constructor called", { args });
      try {
        const instance = new originalPlayer(...args);
        debugBus.log("PLAYER", "YT.Player instance created");
        return instance;
      } catch (err) {
        debugBus.error("PLAYER", "YT.Player constructor FAILED", err);
        throw err;
      }
    };
  } else {
    debugBus.warn("PLAYER", "YT.Player not yet defined at logger install time");
  }

  /* ------------------------------------------------------------
     4. HTML5 <video> logger
  ------------------------------------------------------------ */
  const hookHTML5 = (video) => {
    if (!video || video.__playerLoggerAttached) return;
    video.__playerLoggerAttached = true;

    const events = [
      "play",
      "pause",
      "seeking",
      "seeked",
      "waiting",
      "playing",
      "ended",
      "error",
      "loadeddata",
      "timeupdate"
    ];

    events.forEach((ev) => {
      video.addEventListener(ev, () => {
        debugBus.log("PLAYER", `HTML5 → ${ev}`, {
          type: "html5",
          event: ev,
          currentTime: video.currentTime
        });
      });
    });
  };

  /* ------------------------------------------------------------
     5. DOM observer for <video> and #player
  ------------------------------------------------------------ */
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.tagName === "VIDEO") {
            debugBus.log("PLAYER", "<video> added to DOM", node);
            hookHTML5(node);
          }
          if (node.id === "player") {
            debugBus.log("PLAYER", "#player added to DOM", node);
          }
          if (node.tagName === "IFRAME") {
            debugBus.log("PLAYER", "iframe added", {
              src: node.src,
              id: node.id
            });
          }
        }
      });

      m.removedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.id === "player") {
            debugBus.error("PLAYER", "#player REMOVED from DOM");
          }
          if (node.tagName === "IFRAME") {
            debugBus.error("PLAYER", "iframe REMOVED", {
              src: node.src,
              id: node.id
            });
          }
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  /* ------------------------------------------------------------
     6. Log when the YT script tag is added
  ------------------------------------------------------------ */
  const scriptObserver = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.tagName === "SCRIPT" && node.src.includes("youtube.com/iframe_api")) {
          debugBus.log("PLAYER", "YouTube API script added", { src: node.src });
        }
      });
    });
  });

  scriptObserver.observe(document.head, { childList: true });

  debugBus.log("PLAYER", "PlayerLogger EXTREME MODE active");
}
