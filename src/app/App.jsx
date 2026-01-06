/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description:
 *   Restored full app layout with:
 *   - Header (your version)
 *   - Footer (your version)
 *   - MiniPlayer (your version)
 *   - Page routing (no PlaylistDetail)
 */

import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "../components/Header.jsx";
import Footer from "../layout/Footer.jsx";
import MiniPlayer from "../player/MiniPlayer.jsx";

import Home from "../pages/Home/Home.jsx";
import Playlists from "../pages/Playlists.jsx";
import Watch from "../pages/Watch/Watch.jsx";
import Search from "../pages/Search.jsx";

export default function App() {
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
      {/* Header always visible */}
      <Header />

      {/* Main content area */}
      <div
        style={{
          paddingTop: "60px",   // Header height
          paddingBottom: "56px" // Footer height
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/watch/:id" element={<Watch />} />
        </Routes>
      </div>

      {/* MiniPlayer sits above footer */}
      <div style={{ position: "fixed", bottom: "56px", width: "100%", zIndex: 999 }}>
        <MiniPlayer />
      </div>

      {/* Footer always visible */}
      <Footer />
    </div>
  );
}
