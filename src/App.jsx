// File: src/App.jsx
// PCC v10.0 — BootSplash + BootJosh + Global DebugOverlay + Subscriptions route
// DebugOverlay now mounts INSIDE the app shell, directly above the footer.

import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import Playlist from "./pages/Playlist";
import SettingsPage from "./pages/SettingsPage";
import Watch from "./pages/Watch";
import SubscriptionsPage from "./pages/Subscriptions";

import BootSplash from "./components/BootSplash";
import BootJosh from "./components/BootJosh";
import Footer from "./components/Footer";
import DebugOverlay from "./components/DebugOverlay";
import Header from "./components/Header";
import MiniPlayer from "./components/MiniPlayer";
import GlobalPlayer from "./components/GlobalPlayer";

import { clearAllCaches } from "./utils/cacheManager";
import { usePlayer } from "./contexts/PlayerContext";

export default function App() {
  const [ready, setReady] = useState(false);
  const [joshDone, setJoshDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { currentVideo, playing, setPlaying, stopVideo } = usePlayer();

  const navigate = useNavigate();
  const location = useLocation();

  const log = (msg) => window.debugLog?.(`App: ${msg}`);

  const prevVideoRef = useRef(null);
  const prevPlayingRef = useRef(null);

  // Track current page for DebugOverlay
  const getPageName = () => {
    if (location.pathname.startsWith("/watch")) return "Watch";
    if (location.pathname.startsWith("/playlist")) return "Playlist";
    if (location.pathname.startsWith("/playlists")) return "Playlists";
    if (location.pathname.startsWith("/settings")) return "Settings";
    if (location.pathname.startsWith("/subs")) return "Subscriptions";
    return "Home";
  };

  const pageName = getPageName();

  // Log video changes
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

  // Log playing changes
  useEffect(() => {
    if (prevPlayingRef.current !== playing) {
      log(`isPlaying changed -> ${playing}`);
      prevPlayingRef.current = playing;
    }
  }, [playing]);

  // BootSplash + BootJosh
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
      {/* BootSplash always renders first */}
      <BootSplash ready={ready} />

      {/* BootJosh renders second */}
      {ready && !joshDone && <BootJosh onDone={() => setJoshDone(true)} />}

      {/* Main app shell */}
      {ready && joshDone && (
        <div className="app-root">
          <Header onSearch={handleSearch} />

          {/* Global iframe player */}
          <GlobalPlayer />

          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/subs" element={<SubscriptionsPage />} />
            </Routes>
          </div>

          {/* ⭐ DebugOverlay now sits ABOVE the footer, inside the layout */}
          <DebugOverlay pageName={pageName} />

          <MiniPlayer onTogglePlay={togglePlay} onClose={closePlayer} />
          <Footer />
        </div>
      )}
    </>
  );
}
