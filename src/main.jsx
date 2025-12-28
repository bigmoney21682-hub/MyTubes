/**
 * File: main.jsx
 * Path: src/main.jsx
 * Description: React entry point with bootDebug, global error listeners,
 *              and clean React root mount. Network + Player loggers are
 *              already installed in index.html (before main.jsx).
 */

import React from "react";
import ReactDOM from "react-dom/client";

// ------------------------------------------------------------
// 1. Initialize global debug system BEFORE anything else
// ------------------------------------------------------------
import "./debug/bootDebug.js";

// ------------------------------------------------------------
// 2. Global error listeners (safe in production)
// ------------------------------------------------------------
window.addEventListener("error", (e) => {
  window.bootDebug?.error("GLOBAL ERROR → " + e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  window.bootDebug?.error(
    "PROMISE REJECTION → " + (e.reason?.message || e.reason)
  );
});

// ------------------------------------------------------------
// 3. App root
// ------------------------------------------------------------
import App from "./app/App.jsx";

function mount() {
  window.bootDebug?.boot("main.jsx → React root mounting");

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    window.bootDebug?.error("main.jsx → ERROR: #root not found in DOM");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    window.bootDebug?.boot("main.jsx → React root mounted");

    // ✅ NEW: Signal boot completion so Overlay 1 can dismiss
    window.bootDebug?.ready?.("main.jsx → app ready");
  } catch (err) {
    window.bootDebug?.error("main.jsx → React mount error: " + err?.message);
    throw err;
  }
}

mount();
