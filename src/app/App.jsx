/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description:
 *   Top-level UI shell of the app.
 *   - Renders Header, Footer, MiniPlayer, and all Routes
 *   - Hosts FullPlayer overlay (expanded player)
 *   - MiniPlayer triggers FullPlayer via onExpand()
 *   - Does NOT contain providers (those live in main.jsx)
 *   - Pure layout + navigation container
 */

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "../components/Header.jsx";
import Footer from "../layout/Footer.jsx";
import MiniPlayer from "../player/MiniPlayer.jsx";
import FullPlayer from "../player/FullPlayer.jsx"; // ⭐ NEW

import Home from "../pages/Home/Home.jsx";
import Playlists from "../pages/Playlists.jsx";
import Search from "../pages/Search.jsx";

export default function App() {
  // ⭐ Controls whether FullPlayer is visible
  const [fullOpen, setFullOpen] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        color: "#fff",
        overflowX: "hidden",
        position: "relative"
      }}
    >
      <Header />

      {/* ⭐ Main routed content */}
      <div
        style={{
          paddingTop: "60px",
          paddingBottom: "56px"
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlists" element={<Playlists />} />
        </Routes>
      </div>

      {/* ⭐ FullPlayer overlays everything when open */}
      <FullPlayer
        isOpen={fullOpen}
        onClose={() => setFullOpen(false)}
      />

      {/* ⭐ MiniPlayer sits above Footer and opens FullPlayer */}
      <div style={{ position: "fixed", bottom: "56px", width: "100%", zIndex: 999 }}>
        <MiniPlayer onExpand={() => setFullOpen(true)} />
      </div>

      <Footer />
    </div>
  );
}
