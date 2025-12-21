// File: src/App.jsx
// Final Version: Background play via persistent miniplayer

import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import SettingsPage from "./pages/SettingsPage";
import Watch from "./pages/Watch";

import BootSplash from "./components/BootSplash";
import Footer from "./components/Footer";
import DebugOverlay from "./components/DebugOverlay";
import Header from "./components/Header";
import MiniPlayer from "./components/MiniPlayer";  // ← NEW

import { PlaylistProvider } from "./contexts/PlaylistContext";
import { clearAllCaches } from "./utils/cacheManager";

export default function App() {
  const [ready, setReady] = useState(false);

  // Global player state (shared across pages)
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000);
    const autoClear = localStorage.getItem("autoClearCache") === "true";
    if (autoClear) clearAllCaches();
    return () => clearTimeout(t);
  }, []);

  const handleSearch = (query) => {
    window.debugLog?.(`DEBUG: Search requested: ${query}`);
  };

  const playVideo = (video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    navigate(`/watch/${video.id}`);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const closePlayer = () => {
    setCurrentVideo(null);
    setIsPlaying(false);
  };

  return (
    <PlaylistProvider>
      <BootSplash ready={ready} />
      {ready && (
        <>
          <Header onSearch={handleSearch} />
          <DebugOverlay />

          <div style={{ paddingBottom: currentVideo ? "68px" : "var(--footer-height)" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route
                path="/watch/:id"
                element={
                  <Watch
                    currentVideo={currentVideo}
                    setCurrentVideo={setCurrentVideo}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                  />
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>

          <Footer />

          {/* Persistent MiniPlayer – enables background play */}
          <MiniPlayer
            currentVideo={currentVideo}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onClose={closePlayer}
          />
        </>
      )}
    </PlaylistProvider>
  );
}
