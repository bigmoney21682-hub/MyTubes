// File: src/main.jsx
// PCC v2.0 — Clean root with global error logging + API key init

import "./initApiKey";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { PlayerProvider } from "./contexts/PlayerContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import "./index.css";

// Global error logging → surfaced into DebugOverlay (for iOS / mobile)
window.onerror = function (message, source, lineno, colno, error) {
  window.debugLog?.(
    `GLOBAL ERROR: ${message} @ ${source}:${lineno}:${colno} :: ${
      error?.stack || "no stack"
    }`
  );
};

window.onunhandledrejection = function (event) {
  window.debugLog?.(
    `GLOBAL PROMISE REJECTION: ${
      event.reason?.message || event.reason || "no message"
    } :: ${event.reason?.stack || "no stack"}`
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <PlaylistProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </PlaylistProvider>
    </HashRouter>
  </React.StrictMode>
);
