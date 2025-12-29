/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Root application shell with BrowserRouter, PlayerProvider,
 *              MiniPlayer, DebugOverlay, and iframe docking logic.
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

/* ------------------------------------------------------------
   RouterEvents
   Hooks into BrowserRouter and emits navigation logs
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
   IframeDock
   Moves the global YouTube iframe into the Watch page container
   when on /watch/:id, and back into its default mount otherwise.
------------------------------------------------------------- */
function IframeDock() {
  const location = useLocation();

  useEffect(() => {
    const global = document.getElementById("global-player");
    const watch = document.getElementById("player");

    if (!global) return;

    const path = location.pathname || "";

    // basename="/MyTube-Piped-Frontend" means path is like "/watch/..."
    const onWatchPage = path.startsWith("/watch/");

    if (onWatchPage) {
      // Move iframe into Watch page container
      if (watch && watch !== global.parentNode) {
        watch.appendChild(global);
      }
    } else {
      // Move iframe back to its default hidden mount
      const defaultMount = document.body.querySelector("#global-player");
      if (defaultMount && defaultMount !== global.parentNode) {
        defaultMount.appendChild(global);
      }
    }
  }, [location]);

  return null;
}

/* ------------------------------------------------------------
   App Shell
------------------------------------------------------------- */
export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter basename="/MyTube-Piped-Frontend">
        <RouterEvents />
        <IframeDock />

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

        {/* Runtime debug overlay */}
        <DebugOverlay />
      </BrowserRouter>
    </PlayerProvider>
  );
}
