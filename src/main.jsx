/**
 * File: main.jsx
 * Path: src/main.jsx
 */
console.log("MyTube main.jsx LOADED — version TEST-1");

// ------------------------------------------------------------
// 0. Media Session API: background audio + lockscreen controls
// ------------------------------------------------------------
if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", () => {
    document.querySelector("video")?.play();
  });

  navigator.mediaSession.setActionHandler("pause", () => {
    document.querySelector("video")?.pause();
  });

  navigator.mediaSession.setActionHandler("stop", () => {
    document.querySelector("video")?.pause();
  });
}

export function updateMediaSessionMetadata({ title, artist, artwork }) {
  if (!("mediaSession" in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    artwork: artwork
      ? [
          {
            src: artwork,
            sizes: "512x512",
            type: "image/png",
          },
        ]
      : [],
  });
}

import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// ------------------------------------------------------------
// 1. Initialize debug system BEFORE anything else
// ------------------------------------------------------------
import "./debug/bootDebug.js";

// ------------------------------------------------------------
// 2. Install global loggers
// ------------------------------------------------------------
import { installNetworkLogger } from "./debug/NetworkLogger.js";
import { installPlayerLogger } from "./debug/PlayerLogger.js";

installNetworkLogger();
installPlayerLogger();

// ------------------------------------------------------------
// 3. Global error listeners
// ------------------------------------------------------------
window.addEventListener("error", (e) => {
  window.bootDebug?.error("GLOBAL ERROR → " + e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  window.bootDebug?.error(
    "PROMISE REJECTION → " + (e.reason?.message || e.reason)
  );
});

// ------------------------------------------------------------
// 4. App root
// ------------------------------------------------------------
import App from "./app/App.jsx";
import { PlayerProvider } from "./player/PlayerContext.jsx";
import { PlaylistProvider } from "./contexts/PlaylistContext.jsx";
import DebugOverlay from "./debug/DebugOverlay.jsx";

function mount() {
  window.bootDebug?.boot("main.jsx → React root mounting");

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    window.bootDebug?.error("main.jsx → ERROR: #root not found in DOM");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <BrowserRouter basename="/MyTube-Piped-Frontend">
        <PlaylistProvider>
          <PlayerProvider>
            <App />
          </PlayerProvider>
        </PlaylistProvider>

        <DebugOverlay />
      </BrowserRouter>
    );

    window.bootDebug?.boot("main.jsx → React root mounted");
    window.bootDebug?.ready?.("main.jsx → app ready");

    // ⭐ IMPORTANT:
    // DO NOT mount GlobalPlayer here.
    // Watch.jsx mounts the player ONLY when #player exists.

  } catch (err) {
    window.bootDebug?.error("main.jsx → React mount error: " + err?.message);
    throw err;
  }
}

mount();
