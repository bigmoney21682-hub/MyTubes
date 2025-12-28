/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: App shell with BrowserRouter, Home, Watch, Search, Channel,
 *              ErrorBoundary, DebugOverlay, PlayerProvider, and full router
 *              diagnostic logging.
 */

import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigationType
} from "react-router-dom";

import DebugOverlay from "../debug/DebugOverlay.jsx";
import { PlayerProvider } from "../player/PlayerContext.jsx";

import Home from "../pages/Home/Home.jsx";
import Watch from "../pages/Watch/Watch.jsx";
import Search from "../pages/Search.jsx";
import Channel from "../pages/Channel.jsx";

// ------------------------------------------------------------
// Router Diagnostic Logger Component
// ------------------------------------------------------------
function RouterLogger() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    const path = location.pathname + location.search + location.hash;

    window.bootDebug?.router?.(
      `ROUTER EVENT → ${path} | navType=${navType} | ts=${Date.now()}`
    );
  }, [location, navType]);

  return null;
}

// ------------------------------------------------------------
// Error Boundary
// ------------------------------------------------------------
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    try {
      window.bootDebug?.error("AppErrorBoundary → " + error.message);
      window.bootDebug?.error(
        "AppErrorBoundary stack → " + info.componentStack
      );
    } catch (_) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "16px", color: "white" }}>
          <h1>Something went wrong.</h1>
          <p>Check DebugOverlay for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ------------------------------------------------------------
// Main App Component
// ------------------------------------------------------------
export default function App() {
  useEffect(() => {
    window.bootDebug?.boot("App.jsx mounted — Router active");
  }, []);

  return (
    <PlayerProvider>
      <BrowserRouter>
        <RouterLogger />

        <AppErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/channel/:id" element={<Channel />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </AppErrorBoundary>
      </BrowserRouter>

      <DebugOverlay />
    </PlayerProvider>
  );
}
