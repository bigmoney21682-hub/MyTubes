/**
 * File: App.jsx
 * Path: src/App.jsx
 * Description: Minimal app shell with router, DebugOverlay, and
 *              full lifecycle logging for high‑performance debugging.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Home from "../pages/Home/Home.jsx";
import Watch from "../pages/Watch/Watch";

import DebugOverlay from "../debug/DebugOverlay";


export default function App() {
  // ------------------------------------------------------------
  // Lifecycle logging (sportscar mode)
  // ------------------------------------------------------------
  useEffect(() => {
    window.bootDebug.app("App.jsx mounted — initializing router");

    // Sanity test: verify all debug channels fire
    window.bootDebug.boot("SANITY → Boot channel OK");
    window.bootDebug.router("SANITY → Router channel OK");
    window.bootDebug.api("SANITY → Network/API channel OK");
    window.bootDebug.player("SANITY → Player channel OK");
    window.bootDebug.perf("SANITY → Perf channel OK");
    window.bootDebug.cmd("SANITY → Cmd channel OK");
    window.bootDebug.log("SANITY → Console/log channel OK");
    window.bootDebug.error("SANITY → Error channel OK");
  }, []);

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
        </Routes>
      </BrowserRouter>

      {/* Debug cockpit */}
      <DebugOverlay />
    </>
  );
}
