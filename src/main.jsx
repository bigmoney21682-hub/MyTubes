/**
 * File: main.jsx
 * Path: src/main.jsx
 * Description: React entry point with bootDebug, global error listeners,
 *              Network Diagnostic Logger, and clean React root mount.
 */

import React from "react";
import ReactDOM from "react-dom/client";

// ------------------------------------------------------------
// 1. Initialize global debug system BEFORE anything else
// ------------------------------------------------------------
import "./debug/bootDebug";

// ------------------------------------------------------------
// 2. Install Network Diagnostic Logger
// ------------------------------------------------------------
import "./debug/bootDebug";
import { installNetworkLogger } from "./debug/NetworkLogger";
import { installPlayerLogger } from "./debug/PlayerLogger";

installNetworkLogger();
installPlayerLogger();


// ------------------------------------------------------------
// 3. Global error listeners (safe in production)
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
// 4. App root
// ------------------------------------------------------------
import App from "./app/App";

function mount() {
  window.bootDebug?.boot("main.jsx → React root mounting");

  const rootElement = document.getElementById("root");
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  window.bootDebug?.boot("main.jsx → React root mounted");
}

mount();
