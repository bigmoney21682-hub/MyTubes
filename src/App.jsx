// File: src/App.jsx
// PCC v1.0 — Preservation-First Mode

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
      {/* 🔒 BOOT SPLASH ALWAYS MOUNTS */}
      <BootSplash ready={ready} />

      {/* 🔒 NOTHING ELSE EXISTS UNTIL READY */}
      {ready && (
        <>
          <DebugOverlay />
          {typeof Header === "function" && <Header />}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/playlists" element={<Playlists />} />
          </Routes>

          <Footer />
        </>
      )}
    </PlaylistProvider>
  );
}
