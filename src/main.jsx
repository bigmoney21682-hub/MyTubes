/**
 * File: main.jsx
 * Path: src/main.jsx
 * Description: React entry point with DebugOverlay v3 boot initialization.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Debug system (bootDebug, debugBus, etc.)
import "./debug/debugBoot";

function mount() {
  // Log root mount
  window.bootDebug?.boot("main.jsx → React root mounting");

  const root = ReactDOM.createRoot(document.getElementById("root"));

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Log completion
  window.bootDebug?.boot("main.jsx → React root mounted");
}

mount();
