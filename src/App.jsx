// File: src/App.jsx
// PCC v5.1 — Quiet debug logging, prevents persistent spam in DebugOverlay

import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import Playlist from "./pages/Playlist";
import SettingsPage from "./pages/SettingsPage";
import Watch from "./pages/Watch";

import BootSplash from "./components/BootSplash";
import Footer from "./components/Footer";
import DebugOverlay from "./components/DebugOverlay";
import Header from "./components/Header";
import MiniPlayer from "./components/MiniPlayer";

import { clearAllCaches } from "./utils/cacheManager";

export default function App() {
  const [ready, setReady] = useState(false);

  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const log = (msg) => window.debugLog?.(`App: ${msg}`);

  // Track previous values to prevent spam
  const prevVideoRef = useRef(null);
  const prevPlayingRef = useRef(null);

  // Log only when currentVideo actually changes
  useEffect(() => {
    if (prevVideoRef.current !== currentVideo) {
      if (!currentVideo) log("currentVideo changed -> null");
      else log(`currentVideo changed -> id=${currentVideo.id || currentVideo.videoId}`);
      prevVideoRef.current = currentVideo;
    }
  }, [currentVideo]);

  // Log only when isPlaying actually changes
  useEffect(() => {
    if (prevPlayingRef.current !== isPlaying) {
      log(`isPlaying changed -> ${isPlaying}`);
      prevPlayingRef.current = isPlaying;
    }
  }, [isPlaying]);

  // Initial splash + optional cache clear
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000);

    const autoClear = localStorage.getItem("autoClearCache") === "true";
    if (autoClear) {
      log("Auto-clearing caches");
      clearAllCaches();
    }

    return () => clearTimeout(t);
  }, []);

  const handleSearch = (query) => {
    log(`Search requested: ${query}`);
    setSearchQuery(query);
    navigate("/");
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const closePlayer = () => {
    log("closePlayer -> clearing currentVideo");
    setCurrentVideo(null);
    setIsPlaying(false);
  };

  return (
    <>
      <BootSplash ready={ready} />

      {ready && (
        <div className="app-root">
          <Header onSearch={handleSearch} />
          <DebugOverlay pageName="App" />

          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<Playlist />} />
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

          <MiniPlayer
            currentVideo={currentVideo}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onClose={closePlayer}
          />

          <Footer />
        </div>
      )}
    </>
  );
}
