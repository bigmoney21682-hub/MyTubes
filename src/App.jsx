// File: src/App.jsx
// PCC v1.0 — Preservation-First Mode

import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import Watch from "./pages/Watch"; // ✅ Added missing import

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
          {/* DEBUG OVERLAY MUST MOUNT BEFORE ROUTES */}
          <DebugOverlay />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route
              path="/watch/:id"
              element={<Watch apiKey={import.meta.env.VITE_YOUTUBE_API_KEY} />}
            /> {/* ✅ Added missing Watch route */}
          </Routes>

          <Footer />
        </>
      )}
    </PlaylistProvider>
  );
}
