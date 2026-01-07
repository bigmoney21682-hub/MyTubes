/**
 * ------------------------------------------------------------
 * File: main.jsx
 * Path: src/main.jsx
 * Description:
 *   React entrypoint for the MyTubes PWA.
 *   - Mounts React into #root
 *   - Initializes Router
 *   - Wraps app in global providers
 *   - Signals bootDebug.ready() when mounted
 *   - Production‑safe for GitHub Pages under /MyTubes/
 * ------------------------------------------------------------
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App.jsx";

import { PlayerProvider } from "./player/PlayerContext.jsx";
import { PlaylistProvider } from "./contexts/PlaylistContext.jsx";

// Global CSS
import "./index.css";

// Optional: global error boundary (prevents white screens)
function ErrorBoundary({ children }) {
  return (
    <React.Suspense fallback={<div style={{ color: "#fff" }}>Loading…</div>}>
      {children}
    </React.Suspense>
  );
}

// ------------------------------------------------------------
// Mount React
// ------------------------------------------------------------
const rootElement = document.getElementById("root");

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/MyTubes">
        <PlaylistProvider>
          <PlayerProvider>
            <App />
          </PlayerProvider>
        </PlaylistProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// ------------------------------------------------------------
// Signal bootDebug that React is ready
// ------------------------------------------------------------
try {
  if (window.bootDebug && typeof window.bootDebug.ready === "function") {
    window.bootDebug.ready("React mounted");
  }
} catch (_) {
  // Never crash on boot
}
