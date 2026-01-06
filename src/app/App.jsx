/**
 * File: App.jsx
 * Description:
 *   Top-level layout:
 *   - Header
 *   - GlobalPlayerFix iframe (inside Home)
 *   - MiniPlayer (pinned under player)
 *   - Content area
 *   - Footer
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

      {/* ⭐ FullPlayer replaces the player area, not full screen */}
      <FullPlayer
        isOpen={expanded}
        onClose={() => setExpanded(false)}
      />

      {/* ⭐ MiniPlayer sits directly under the player */}
      <MiniPlayer
        onExpand={() => setExpanded(true)}
        onCollapse={() => setExpanded(false)}
      />

      {/* ⭐ Content area scrolls normally */}
      <div style={{ paddingTop: "12px", paddingBottom: "56px" }}>
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
