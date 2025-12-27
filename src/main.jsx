/**
 * File: main.jsx
 * Path: src/main.jsx
 * Description: React entry point with DebugOverlay v3 boot initialization.
 */
window.addEventListener("error", (e) => {
  window.bootDebug?.error("GLOBAL ERROR → " + e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  window.bootDebug?.error("PROMISE REJECTION → " + (e.reason?.message || e.reason));
});

import "./debug/bootDebug";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";




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
