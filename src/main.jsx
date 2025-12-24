// File: src/main.jsx
// PCC v10.0 — Bundle Hash Bump (no behavior change)
// rebuild-bundle-1
// rebuild-bundle-2
// rebuild-bundle-3
// rebuild-bundle-4


// ------------------------------------------------------------
// GLOBAL YT API KEY INJECTION (runs before ANY imports)
// ------------------------------------------------------------
window.YT_API_KEY = import.meta.env.VITE_YT_API_PRIMARY;

// ------------------------------------------------------------
// IMPORTS
// ------------------------------------------------------------
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { PlayerProvider } from "./contexts/PlayerContext";

// ------------------------------------------------------------
// GLOBAL CRASH LOGGER (PERSISTENT)
// ------------------------------------------------------------
window.__fatalErrors = window.__fatalErrors || [];

function persistError(type, message, extra) {
  const entry = {
    type,
    message: String(message),
    extra: extra ? String(extra) : "",
    time: new Date().toISOString(),
  };

  // Save to memory
  window.__fatalErrors.push(entry);

  // Save to localStorage (persists across reloads)
  try {
    const existing = JSON.parse(localStorage.getItem("fatal_errors") || "[]");
    existing.push(entry);
    localStorage.setItem("fatal_errors", JSON.stringify(existing));
  } catch {}
}

// Catch synchronous JS errors
window.onerror = function (msg, src, line, col, err) {
  persistError("window.onerror", msg, err?.stack || "");
};

// Catch async / promise errors
window.onunhandledrejection = function (event) {
  persistError("unhandledrejection", event.reason, "");
};

// ------------------------------------------------------------
// SAFETY: Prevent React Router from booting with corrupted hash
// ------------------------------------------------------------
(function ensureCleanHash() {
  try {
    const h = window.location.hash || "";

    // These corrupted states are the exact cause of:
    // "Right side of assignment cannot be destructured"
    if (
      h.includes("undefined") ||
      h.includes("[object") ||
      h.endsWith("/watch/") ||
      h === "#/watch" ||
      h === "#/watch/"
    ) {
      console.warn("[main] Detected corrupted hash route, resetting to root");
      window.location.replace("#/");
    }
  } catch (err) {
    console.warn("[main] Hash safety check failed:", err);
  }
})();

// ------------------------------------------------------------
// ROOT MOUNT
// ------------------------------------------------------------
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);
