/**
 * File: App.jsx
 * Path: src/app/App.jsx
 */

import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "../pages/Home/Home.jsx";
import Search from "../pages/Search.jsx";

function dbg(label, data = {}) {
  console.group(`[ROUTER] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    dbg("Route changed", {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash
    });
  }, [location]);

  return (
    <Routes>
      {/* GitHub Pages base path */}
      <Route path="/MyTube-Piped-Frontend/" element={<Home />} />

      {/* Normal root */}
      <Route path="/" element={<Home />} />

      {/* Watch route */}
      <Route path="/watch/:id" element={<Home />} />

      {/* Search */}
      <Route path="/search/:query" element={<Search />} />

      {/* Catch-all → Home */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
