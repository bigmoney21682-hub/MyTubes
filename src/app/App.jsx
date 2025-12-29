/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Root application shell with BrowserRouter, PlayerProvider,
 *              MiniPlayer, and DebugOverlay. No iframe docking.
 */

import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";

import { PlayerProvider } from "../player/PlayerContext.jsx";
import MiniPlayer from "../player/MiniPlayer.jsx";

import Home from "../pages/Home/Home.jsx";
import Watch from "../pages/Watch/Watch.jsx";
import Search from "../pages/Search.jsx";
import Channel from "../pages/Channel.jsx";

import DebugOverlay from "../debug/DebugOverlay.jsx";
import { installRouterLogger } from "../debug/debugRouter.js";

function RouterEvents() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    installRouterLogger(navigate, location);
  }, [location]);

  return null;
}

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter basename="/MyTube-Piped-Frontend">
        <RouterEvents />

        <div style={{ paddingBottom: "80px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/channel/:id" element={<Channel />} />
          </Routes>
        </div>

        <MiniPlayer />
        <DebugOverlay />
      </BrowserRouter>
    </PlayerProvider>
  );
}
