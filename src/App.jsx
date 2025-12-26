// File: src/App.jsx
// Adds centralized router logging with zero regression
console.log("APP: App.jsx loaded");

import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Watch from "./pages/Watch";

import Header from "./components/Header";
import GlobalPlayer from "./components/GlobalPlayer";
import MiniPlayer from "./components/MiniPlayer";
import DebugOverlay from "./components/DebugOverlay";

import { debugRouter } from "./utils/debug";

export default function App() {
  const location = useLocation();

  // Log every route + query change
  useEffect(() => {
    const path = location.pathname + location.search;
    debugRouter(`ROUTE → ${path}`);
  }, [location]);

  // Log initial mount
  useEffect(() => {
    debugRouter("App mounted");
  }, []);

  return (
    <div className="app-shell">
      <Header />
      <GlobalPlayer />
      <MiniPlayer />
      <DebugOverlay />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch" element={<Watch />} />
        </Routes>
      </div>
    </div>
  );
}
