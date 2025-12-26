/**
 * File: main.jsx
 * Path: src/main.jsx
 * Description: Application entry point. Initializes React and logs boot events.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

bootDebug.info("main.jsx loaded — starting React mount");

try {
  const rootEl = document.getElementById("root");

  if (!rootEl) {
    bootDebug.error("Root element #root not found");
  } else {
    bootDebug.info("Root element found, mounting React…");
  }

  ReactDOM.createRoot(rootEl).render(<App />);

  bootDebug.info("React mounted successfully");
} catch (err) {
  bootDebug.error("React failed to mount: " + err.message);
  console.error(err);
}
