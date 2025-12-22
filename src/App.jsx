// File: src/App.jsx
// PCC v3.1 — Correct layout spacing for miniplayer + footer

import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

import { PlaylistProvider } from "./contexts/PlaylistContext";
import { clearAllCaches } from "./utils/cacheManager";

export default function App() {
  const [ready, setReady] = useState(false);

  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const log = (msg) => window.debugLog?.(`App: ${msg}`);

  useEffect(() => {
    if (!currentVideo) log("currentVideo changed -> null");
    else log(`currentVideo changed -> id=${currentVideo.id || currentVideo.videoId}`);
  }, [currentVideo]);

  useEffect(() => {
    log(`isPlaying changed -> ${isPlaying}`);
  }, [isPlaying]);

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
    log(`togglePlay -> ${!isPlaying}`);
    setIsPlaying(!isPlaying);
  };

  const closePlayer = () => {
    log("closePlayer -> clearing currentVideo");
    setCurrentVideo(null);
    setIsPlaying(false);
  };

  return (
    <PlaylistProvider>
      <BootSplash ready={ready} />

      {ready && (
        <>
          <Header onSearch={handleSearch} />
          <DebugOverlay pageName="App" />

          <div
            style={{
              paddingBottom: currentVideo
                ? "calc(68px + var(--footer-height))"
                : "var(--footer-height)",
            }}
          >
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
        </>
      )}
    </PlaylistProvider>
  );
}
