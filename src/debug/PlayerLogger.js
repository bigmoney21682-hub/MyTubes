/**
 * File: PlayerLogger.js
 * Path: src/debug/PlayerLogger.js
 * Description: Global player event logger that instruments <video> elements
 *              and logs all playback events into debugBus with level="PLAYER".
 */

import { debugBus } from "./debugBus.js";

export function installPlayerLogger() {
  if (window.__playerLoggerInstalled) return;
  window.__playerLoggerInstalled = true;

  debugBus.log({
    level: "PLAYER",
    msg: "PlayerLogger → Installed",
    ts: Date.now()
  });

  // ------------------------------------------------------------
  // Helper: safe log wrapper
  // ------------------------------------------------------------
  function log(msg) {
    debugBus.log({
      level: "PLAYER",
      msg,
      ts: Date.now()
    });
  }

  // ------------------------------------------------------------
  // Helper: throttle timeupdate logs
  // ------------------------------------------------------------
  let lastTimeLog = 0;
  function throttledTimeLog(video) {
    const now = performance.now();
    if (now - lastTimeLog > 500) {
      lastTimeLog = now;
      log(`timeupdate → ${video.currentTime.toFixed(2)}s`);
    }
  }

  // ------------------------------------------------------------
  // Instrument a <video> element
  // ------------------------------------------------------------
  function attachVideoListeners(video) {
    if (!video || video.__playerLoggerAttached) return;
    video.__playerLoggerAttached = true;

    log("Video element detected → attaching listeners");

    video.addEventListener("play", () => log("play"));
    video.addEventListener("pause", () => log("pause"));
    video.addEventListener("ended", () => log("ended"));
    video.addEventListener("waiting", () => log("buffering…"));
    video.addEventListener("error", () => log("error → " + video.error?.message));
    video.addEventListener("seeking", () => log("seeking → " + video.currentTime.toFixed(2)));
    video.addEventListener("seeked", () => log("seeked → " + video.currentTime.toFixed(2)));
    video.addEventListener("ratechange", () => log("ratechange → " + video.playbackRate));
    video.addEventListener("volumechange", () => log("volumechange → " + video.volume));
    video.addEventListener("durationchange", () => log("durationchange → " + video.duration));

    video.addEventListener("timeupdate", () => throttledTimeLog(video));
  }

  // ------------------------------------------------------------
  // Observe DOM for new <video> elements
  // ------------------------------------------------------------
  const observer = new MutationObserver(() => {
    const videos = document.querySelectorAll("video");
    videos.forEach(attachVideoListeners);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Also attach to any video already present
  const existingVideos = document.querySelectorAll("video");
  existingVideos.forEach(attachVideoListeners);
}
