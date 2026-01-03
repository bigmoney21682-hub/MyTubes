/**
 * File: main.jsx
 * Path: src/main.jsx
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./App.jsx";
import { PlaylistProvider } from "./contexts/PlaylistContext.jsx";
import { PlayerProvider } from "./contexts/PlayerContext.jsx";
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

    {/* Runtime Debug Overlay (now top-half after your DebugOverlay.jsx fix) */}
    <DebugOverlay />
  </HashRouter>
);
