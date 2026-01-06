/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description:
 *   Root router + pages.
 *   Now includes full route debugging for Mac Web Inspector.
 */

import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Watch from "../pages/Watch.jsx";
import Search from "../pages/Search.jsx";

// ------------------------------------------------------------
// Debug helper
// ------------------------------------------------------------
function dbg(label, data = {}) {
  console.group(`[ROUTER] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

export default function App() {
  const location = useLocation();

  // ------------------------------------------------------------
  // Log route changes
  // ------------------------------------------------------------
  useEffect(() => {
    dbg("Route changed", {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash
    });
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route path="/search/:query" element={<Search />} />
    </Routes>
  );
}
