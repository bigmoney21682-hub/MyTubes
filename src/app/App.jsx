/**
 * File: App.jsx
 * Path: src/App.jsx
 * Description:
 *   Restored full app layout:
 *   - Header
 *   - Footer
 *   - MiniPlayer
 *   - Page routing
 */

import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MiniPlayer from "./player/MiniPlayer.jsx";

import Home from "./pages/Home/Home.jsx";
import Playlists from "./pages/Playlists/Playlists.jsx";
import PlaylistDetail from "./pages/Playlists/PlaylistDetail.jsx";
import Watch from "./pages/Watch/Watch.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Header />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />
          <Route path="/watch/:id" element={<Watch />} />
        </Routes>
      </div>

      <MiniPlayer />
      <Footer />
    </div>
  );
}
