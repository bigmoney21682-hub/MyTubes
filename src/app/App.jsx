/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Main app shell with router + real Home/Watch pages and DebugOverlay.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import DebugOverlay from "../debug/DebugOverlay";

// Real pages
import Home from "../pages/Home/Home";
import Watch from "../pages/Watch/Watch";

export default function App() {
  useEffect(() => {
    window.bootDebug?.boot("App.jsx mounted — initializing router");
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
        </Routes>
      </BrowserRouter>

      <DebugOverlay />
    </>
  );
}
