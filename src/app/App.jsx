/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Main application shell. No DebugOverlay here.
 */

import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import Header from "../components/Header.jsx";
import Footer, { FOOTER_HEIGHT } from "../layout/Footer.jsx";

// Pages
import Home from "../pages/Home/Home.jsx";
import Watch from "../pages/Watch/Watch.jsx";
import Menu from "../pages/Menu.jsx";
import Playlists from "../pages/Playlists.jsx";
import Playlist from "../pages/Playlist.jsx";
import Shorts from "../pages/Shorts.jsx";
import Subs from "../pages/Subs.jsx";
import Search from "../pages/Search.jsx";

// Player
import MiniPlayer from "../player/MiniPlayer.jsx";

export default function App() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",

        // ⭐ FIX: Hardcode header height so layout never collapses
        paddingTop: "56px",

        // ⭐ FIX: Footer always visible
        paddingBottom: FOOTER_HEIGHT,
        boxSizing: "border-box",
      }}
    >
      <Header />

      <MiniPlayer />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/search" element={<Search />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/subs" element={<Subs />} />
      </Routes>

      <Footer />
    </div>
  );
}
