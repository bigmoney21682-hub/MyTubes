/**
 * File: debugUtils.js
 * Path: src/debug/debugUtils.js
 * Description: Utility helpers for timestamps, formatting, and perf metrics.
 */

export function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

export function measureFPS(callback) {
  let last = performance.now();
  let frames = 0;

  function loop(now) {
    frames++;
    if (now - last >= 1000) {
      callback(frames);
      frames = 0;
      last = now;
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

export function measureEventLoopLag(callback) {
  let last = performance.now();

  setInterval(() => {
    const now = performance.now();
    const lag = now - last - 100;
    callback(Math.max(0, lag));
    last = now;
  }, 100);
}
