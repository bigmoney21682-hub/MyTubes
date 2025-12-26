// File: src/App.jsx
// PCC v9.0 — Full App wiring with MiniPlayer + DebugOverlay + Routing

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { PlayerProvider } from "./contexts/PlayerContext";
import GlobalPlayer from "./components/GlobalPlayer";
import MiniPlayer from "./components/MiniPlayer";
import DebugOverlay from "./components/DebugOverlay";

import Home from "./pages/Home";
import Watch from "./pages/Watch";

export default function App() {
  return (
    <Router basename="/MyTube-Piped-Frontend">
      <PlayerProvider>
        {/* Global audio/video engine */}
        <GlobalPlayer />

        {/* Persistent bottom MiniPlayer */}
        <MiniPlayer />

        {/* Debug panel + floating button */}
        <DebugOverlay />

        {/* Main app routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch" element={<Watch />} />
        </Routes>
      </PlayerProvider>
    </Router>
  );
}
