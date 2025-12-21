// PCC v1.0 — Header moved to App
// File: src/App.jsx

import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Playlists from "./pages/Playlists";

import Header from "./components/Header";          // ✅ Import added
import BootSplash from "./components/BootSplash";
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

          {/* 🔹 HEADER MOVED HERE */}
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playlists" element={<Playlists />} />
          </Routes>

          <Footer />
        </>
      )}
    </PlaylistProvider>
  );
}
