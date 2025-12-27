/**
 * File: App.jsx
 * Path: src/app/App.jsx
 * Description: Main app shell with router + real Home/Watch pages and DebugOverlay.
 */
// src/pages/Home/Home.jsx
window.bootDebug?.boot("Home.jsx file loaded");

// src/components/VideoCard.jsx
window.bootDebug?.boot("VideoCard.jsx file loaded");

// src/api/youtube.js
window.bootDebug?.boot("youtube.js file loaded");

// src/api/trending.js
window.bootDebug?.boot("trending.js file loaded");


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
