/**
 * File: main.jsx
 * Path: src/main.jsx
 * Description:
 *   TRUE ROOT of the entire React application.
 *   - Loads GlobalPlayerFix BEFORE React mounts (critical for iOS)
 *   - Wraps the app in BrowserRouter, PlaylistProvider, PlayerProvider
 *   - Mounts DebugOverlay at the absolute top of the tree
 *   - Ensures player + autonext + debug systems work globally
 */

import "./player/GlobalPlayerFix.js"; 
// ⭐ Must load BEFORE React renders anything.
//    This ensures:
//    - YouTube Iframe API hooks register early
//    - window.onYouTubeIframeAPIReady is ready
//    - GlobalPlayerFix can initialize immediately
//    - iOS background audio works reliably

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App.jsx";
// ⭐ App.jsx is your UI shell (Header, Footer, MiniPlayer, Routes)

import { PlaylistProvider } from "./contexts/PlaylistContext.jsx";
// ⭐ Provides playlist storage + playlist editing globally

import { PlayerProvider } from "./player/PlayerContext.jsx";
// ⭐ Provides:
//    - currentId
//    - loadVideo()
//    - global player state
//    - MiniPlayer + Autonext integration

import DebugOverlay from "./debug/DebugOverlay.jsx";
// ⭐ Must be mounted at ROOT LEVEL.
//    This gives full visibility into:
//    - GlobalPlayerFix logs
//    - AutonextEngine logs
//    - Network logs
//    - UI events
//    - State transitions

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter basename="/MyTube-Piped-Frontend">
    {/* ⭐ Playlist + Player providers wrap the entire app */}
    <PlaylistProvider>
      <PlayerProvider>

        {/* ⭐ Main UI shell */}
        <App />

        {/* ⭐ Debug overlay MUST be here:
            - Above App
            - Above Router
            - Above MiniPlayer
            - Never unmounted
            - Never clipped
            - Always receives global toggle events */}
        <DebugOverlay />

      </PlayerProvider>
    </PlaylistProvider>
  </BrowserRouter>
);
