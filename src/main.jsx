/**
 * File: main.jsx
 * Path: src/main.jsx
 * Description:
 *   Root entry for the React app.
 *   Wraps App with:
 *     - HashRouter (GitHub Pages compatible)
 *     - PlaylistProvider
 *     - PlayerProvider
 *     - DebugOverlay (global debug UI)
 */

// ⭐ Critical: ensures GlobalPlayerFix.js actually executes in production
import "./player/GlobalPlayerFix.js";

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./app/App.jsx";
import { PlaylistProvider } from "./contexts/PlaylistContext.jsx";
import { PlayerProvider } from "./player/PlayerContext.jsx";
import DebugOverlay from "./debug/DebugOverlay.jsx";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <HashRouter>
    <PlaylistProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </PlaylistProvider>

    <DebugOverlay />
  </HashRouter>
);
