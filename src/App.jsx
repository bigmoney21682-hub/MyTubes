// File: src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Search from "./pages/Search";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/watch" element={<Watch />} />
      <Route path="/search" element={<Search />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
