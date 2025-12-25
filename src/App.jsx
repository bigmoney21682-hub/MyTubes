// File: src/App.jsx
// PCC v8.0 — Stable Routes + Rebuild Marker + Safe Boot + Router Instrumentation
// rebuild-router-2

import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Watch from "./pages/Watch";
import ChannelPage from "./pages/ChannelPage";
import Playlists from "./pages/Playlists";
import Playlist from "./pages/Playlist";
import Subscriptions from "./pages/Subscriptions";
import SettingsPage from "./pages/SettingsPage";

import Header from "./components/Header";
import Footer from "./components/Footer";
import DebugOverlay from "./components/DebugOverlay";

// ------------------------------------------------------------
// SAFETY: Prevent invalid route params from crashing components
// ------------------------------------------------------------
function safeId(id) {
  if (!id || id === "undefined" || id === "[object Object]") return null;
  return id;
}

// ------------------------------------------------------------
// ROUTER LOGGER — logs every navigation event
// ------------------------------------------------------------
function RouteLogger() {
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname || "/";
    const search = location.search || "";
    const full = `${path}${search}`;

    if (window.debugEvent) {
      window.debugEvent(`ROUTE → ${full}`, "ROUTER");
    } else {
      window.debugLog?.(`ROUTE → ${full}`, "ROUTER");
    }
  }, [location.pathname, location.search]);

  return null;
}

// ------------------------------------------------------------
// MAIN APP
// ------------------------------------------------------------
export default function App() {
  return (
    <>
      {/* Router instrumentation */}
      <RouteLogger />

      <Header />
      <DebugOverlay pageName="AppShell" />

      <div
        style={{
          paddingTop: "var(--header-height)",
          paddingBottom: "var(--footer-height)",
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
        }}
      >
        <Routes>
          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* WATCH — safe param */}
          <Route path="/watch/:id" element={<WatchWrapper />} />

          {/* CHANNEL — safe param */}
          <Route path="/channel/:id" element={<ChannelWrapper />} />

          {/* PLAYLISTS */}
          <Route path="/playlists" element={<Playlists />} />

          {/* SINGLE PLAYLIST */}
          <Route path="/playlist/:id" element={<PlaylistWrapper />} />

          {/* SUBSCRIPTIONS */}
          <Route path="/subscriptions" element={<Subscriptions />} />

          {/* SETTINGS */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* FALLBACK → HOME */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

// ------------------------------------------------------------
// WRAPPERS — prevent destructuring crashes from invalid params
// ------------------------------------------------------------
function WatchWrapper() {
  const id = safeId(window.location.hash.split("/watch/")[1]);
  if (!id) return <Navigate to="/" replace />;
  return <Watch id={id} />;
}

function ChannelWrapper() {
  const id = safeId(window.location.hash.split("/channel/")[1]);
  if (!id) return <Navigate to="/" replace />;
  return <ChannelPage id={id} />;
}

function PlaylistWrapper() {
  const id = safeId(window.location.hash.split("/playlist/")[1]);
  if (!id) return <Navigate to="/" replace />;
  return <Playlist id={id} />;
}
