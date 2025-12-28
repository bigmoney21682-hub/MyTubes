/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Root application shell with routing, PlayerProvider,
 *              MiniPlayer, and page layout. Fully stable under StrictMode.
 */

import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import { PlayerProvider } from "../player/PlayerContext.jsx";
import MiniPlayer from "../player/MiniPlayer.jsx";

import Home from "../pages/Home/Home.jsx";
import Watch from "../pages/Watch/Watch.jsx";
import Search from "../pages/Search.jsx";
import Channel from "../pages/Channel.jsx";

export default function App() {
  return (
    <PlayerProvider>
      <HashRouter>
        <div style={{ paddingBottom: "80px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/channel/:id" element={<Channel />} />
          </Routes>
        </div>

        {/* Persistent global mini-player */}
        <MiniPlayer />
      </HashRouter>
    </PlayerProvider>
  );
}
