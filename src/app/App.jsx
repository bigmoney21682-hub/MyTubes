/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Root application shell with BrowserRouter, PlayerProvider,
 *              MiniPlayer, and RouterEvents for DebugOverlay v3.
 */

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { PlayerProvider } from "../player/PlayerContext.jsx";
import MiniPlayer from "../player/MiniPlayer.jsx";

import Home from "../pages/Home/Home.jsx";
import Watch from "../pages/Watch/Watch.jsx";
import Search from "../pages/Search.jsx";
import Channel from "../pages/Channel.jsx";

import { installRouterLogger } from "../debug/debugRouter.js";

/* ------------------------------------------------------------
   RouterEvents
   Hooks into BrowserRouter and emits navigation logs
   into DebugOverlay via debugRouter.js
------------------------------------------------------------- */
function RouterEvents() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    installRouterLogger(navigate, location);
  }, [location]);

  return null;
}

/* ------------------------------------------------------------
   App Shell
------------------------------------------------------------- */
export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <RouterEvents />

        {/* Layout wrapper ensures MiniPlayer never overlaps content */}
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
      </BrowserRouter>
    </PlayerProvider>
  );
}
