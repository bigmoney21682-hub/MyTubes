/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Main application shell with Footer, MiniPlayer, GlobalPlayer,
 *              DebugOverlay, and full routing. Router is provided by main.jsx.
 */

import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Header from "../components/Header.jsx";
import Footer, { FOOTER_HEIGHT } from "../layout/Footer.jsx";

// Pages
import Home from "../pages/Home/Home.jsx";
import Watch from "../pages/Watch/Watch.jsx";
import Menu from "../pages/Menu.jsx";
import Playlists from "../pages/Playlists.jsx";
import Shorts from "../pages/Shorts.jsx";
import Subs from "../pages/Subs.jsx";

// Player
import { GlobalPlayer } from "../player/GlobalPlayer.js";
import MiniPlayer from "../player/MiniPlayer.jsx";

// Debug
import DebugOverlay from "../debug/DebugOverlay.jsx";

export default function App() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        paddingBottom: FOOTER_HEIGHT
      }}
    >
      <Header />

      {/* GlobalPlayer is a singleton imported for side effects */}

      <MiniPlayer />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/subs" element={<Subs />} />
      </Routes>

      <DebugOverlay />
      <Footer />
    </div>
  );
}
