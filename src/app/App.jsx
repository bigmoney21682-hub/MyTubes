/**
 * File: App.jsx
 * Description:
 *   True layout controller.
 *   - PlayerArea is pinned at the top
 *   - MiniPlayer OR FullPlayer is shown (never both)
 *   - Home/Search/Playlists scroll underneath
 */

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "../components/Header.jsx";
import Footer from "../layout/Footer.jsx";

import MiniPlayer from "../player/MiniPlayer.jsx";
import FullPlayer from "../player/FullPlayer.jsx";

import Home from "../pages/Home/Home.jsx";
import Playlists from "../pages/Playlists.jsx";
import Search from "../pages/Search.jsx";

export default function App() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ width: "100%", height: "100%", background: "#000", color: "#fff" }}>
      <Header />

      {/* ⭐ PLAYER AREA (pinned) */}
      <div style={{ width: "100%", height: 220, position: "relative", zIndex: 10 }}>
        {!expanded && (
          <div
            id="yt-player"
            style={{
              width: "100%",
              height: "100%",
              background: "#000"
            }}
          />
        )}

        {expanded && (
          <FullPlayer onClose={() => setExpanded(false)} />
        )}
      </div>

      {/* ⭐ MINI PLAYER (only when collapsed) */}
      {!expanded && (
        <MiniPlayer onExpand={() => setExpanded(true)} />
      )}

      {/* ⭐ CONTENT AREA */}
      <div style={{ paddingTop: 12, paddingBottom: 56 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlists" element={<Playlists />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
