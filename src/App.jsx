// File: src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import SettingsPage from "./pages/SettingsPage";

import BootSplash from "./components/BootSplash";
import Footer from "./components/Footer";
import DebugOverlay from "./components/DebugOverlay";
import Header from "./components/Header";

import { PlaylistProvider } from "./contexts/PlaylistContext";
import { clearAllCaches } from "./utils/cacheManager";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000);

    // Auto-clear caches if setting is ON
    const autoClear = localStorage.getItem("autoClearCache") === "true";
    if (autoClear) clearAllCaches();

    return () => clearTimeout(t);
  }, []);

  return (
    <PlaylistProvider>
      <BootSplash ready={ready} />
      {ready && (
        <>
          <Header />
          <DebugOverlay />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>

          <Footer />
        </>
      )}
    </PlaylistProvider>
  );
}
