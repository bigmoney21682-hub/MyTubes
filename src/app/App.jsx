/**
 * File: App.jsx
 * Description:
 *   True layout controller.
 *   - PlayerArea pinned under header
 *   - MiniPlayer OR FullPlayer visible (never both)
 *   - Content scrolls underneath
 */

import React, { useState, useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "../components/Header.jsx";
import Footer from "../layout/Footer.jsx";

import MiniPlayer from "../player/MiniPlayer.jsx";
import FullPlayer from "../player/FullPlayer.jsx";

import { PlayerContext } from "../player/PlayerContext.jsx";

import Home from "../pages/Home/Home.jsx";
import Playlists from "../pages/Playlists.jsx";
import Search from "../pages/Search.jsx";

export default function App() {
  const [expanded, setExpanded] = useState(false);
  const { currentId } = useContext(PlayerContext);

  // ⭐ Auto-expand when a video starts
  useEffect(() => {
    if (currentId) setExpanded(true);
  }, [currentId]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#000", color: "#fff" }}>
      <Header />

      {/* ⭐ PLAYER AREA (pinned under header) */}
      <div
        style={{
          width: "100%",
          height: 220,
          position: "sticky",
          top: 60,
          zIndex: 1000,
          background: "#000"
        }}
      >
        {/* ⭐ IFRAME ALWAYS MOUNTED */}
        <div
          id="yt-player"
          style={{
            width: "100%",
            height: "100%",
            background: "#000",
            position: "absolute",
            inset: 0,
            zIndex: 1
          }}
        />

        {/* ⭐ FULLPLAYER OVERLAYS IFRAME */}
        {expanded && (
          <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
            <FullPlayer onClose={() => setExpanded(false)} />
          </div>
        )}
      </div>

      {/* ⭐ MINI PLAYER (only when collapsed) */}
      {!expanded && (
        <div
          style={{
            position: "sticky",
            top: 280,
            zIndex: 999
          }}
        >
          <MiniPlayer onExpand={() => setExpanded(true)} />
        </div>
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
