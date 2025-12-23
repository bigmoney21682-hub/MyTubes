// File: src/App.jsx
// PCC v6.0 — Uses PlayerContext + GlobalPlayer for background audio

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
import GlobalPlayer from "./components/GlobalPlayer";

import { clearAllCaches } from "./utils/cacheManager";
import { usePlayer } from "./contexts/PlayerContext";

export default function App() {
  const [ready, setReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { currentVideo, playing, setPlaying, stopVideo } = usePlayer();

  const navigate = useNavigate();
  const log = (msg) => window.debugLog?.(`App: ${msg}`);

  const prevVideoRef = useRef(null);
  const prevPlayingRef = useRef(null);

  useEffect(() => {
    if (prevVideoRef.current !== currentVideo) {
      if (!currentVideo) log("currentVideo changed -> null");
      else
        log(
          `currentVideo changed -> id=${
            currentVideo.id || currentVideo.id?.videoId
          }`
        );
      prevVideoRef.current = currentVideo;
    }
  }, [currentVideo]);

  useEffect(() => {
    if (prevPlayingRef.current !== playing) {
      log(`isPlaying changed -> ${playing}`);
      prevPlayingRef.current = playing;
    }
  }, [playing]);

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
    setPlaying((prev) => !prev);
  };

  const closePlayer = () => {
    log("closePlayer -> stopVideo");
    stopVideo();
  };

  return (
    <>
      <BootSplash ready={ready} />

      {ready && (
        <div className="app-root">
          <Header onSearch={handleSearch} />
          <DebugOverlay pageName="App" />

          {/* Global audio engine — always mounted, no visible UI */}
          <GlobalPlayer />

          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>

          <MiniPlayer onTogglePlay={togglePlay} onClose={closePlayer} />

          <Footer />
        </div>
      )}
    </>
  );
}
