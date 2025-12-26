// File: src/App.jsx
// PCC v13.3 — App shell with PlayerProvider + GlobalPlayer + DebugOverlay + routes

import React from "react";
import { Routes, Route } from "react-router-dom";

import { PlayerProvider } from "./contexts/PlayerContext";
import GlobalPlayer from "./components/GlobalPlayer";
import DebugOverlay from "./components/DebugOverlay";

import Home from "./pages/Home";
import Watch from "./pages/Watch";
import SearchResults from "./pages/SearchResults";

export default function App() {
  return (
    <PlayerProvider>
      <GlobalPlayer />
      <DebugOverlay />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </PlayerProvider>
  );
}
