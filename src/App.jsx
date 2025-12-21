// File: src/App.jsx
// PCC v1.0 — Preservation-First Mode
// Global layout owner: Header, Footer, DebugOverlay

import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import Watch from "./pages/Watch";

import BootSplash from "./components/BootSplash";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DebugOverlay from "./components/DebugOverlay";

import { PlaylistProvider } from "./contexts/PlaylistContext";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <PlaylistProvider>
      <BootSplash ready={ready} />

      {ready && (
        <>
          {/* 🔒 GLOBAL DEBUG OVERLAY (ONCE) */}
          <DebugOverlay />

          {/* 🔒 GLOBAL HEADER (ONCE) */}
          <Header />

          {/* 🔒 ROUTES = CONTENT ONLY */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/playlists" element={<Playlists />} />
          </Routes>

          {/* 🔒 GLOBAL FOOTER (ONCE) */}
          <Footer />
        </>
      )}
    </PlaylistProvider>
  );
}
