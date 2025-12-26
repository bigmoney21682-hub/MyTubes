// File: src/App.jsx
// PCC v13.1 — App shell with PlayerProvider + GlobalPlayer + routes

import React from "react";
import { Routes, Route } from "react-router-dom";

import { PlayerProvider } from "./contexts/PlayerContext";
import GlobalPlayer from "./components/GlobalPlayer";

import Home from "./pages/Home";
import Watch from "./pages/Watch";
import SearchResults from "./pages/SearchResults";

export default function App() {
  return (
    <PlayerProvider>
      {/* Hidden global YouTube engine */}
      <GlobalPlayer />

      {/* Main routed UI */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/search" element={<SearchResults />} />

        {/* fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </PlayerProvider>
  );
}
