/**
 * File: main.jsx
 * Path: src/main.jsx
 */

import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./debug/bootDebug.js";

window.addEventListener("error", (e) => {
  window.bootDebug?.error("GLOBAL ERROR → " + e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  window.bootDebug?.error(
    "PROMISE REJECTION → " + (e.reason?.message || e.reason)
  );
});

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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    window.bootDebug?.boot("main.jsx → React root mounted");
    window.bootDebug?.ready?.("main.jsx → app ready");
  } catch (err) {
    window.bootDebug?.error("main.jsx → React mount error: " + err?.message);
    throw err;
  }
}

mount();
