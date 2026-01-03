/**
 * File: main.jsx
 * Path: src/main.jsx
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./app/App.jsx";                     // ✅ Correct path
import { PlaylistProvider } from "./contexts/PlaylistContext.jsx"; // ✅ Correct
import { PlayerProvider } from "./player/PlayerContext.jsx";       // ✅ Correct
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
