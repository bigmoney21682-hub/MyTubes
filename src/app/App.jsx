/**
 * File: App.jsx
 * Path: src/App.jsx
 * Description: Main application shell with router + layout + boot-ready signal.
 */

import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home.jsx";
import Search from "../pages/Search.jsx";
import Watch from "../pages/Watch/Watch.jsx";
import Playlist from "../pages/Playlist.jsx";
import Channel from "../pages/Channel.jsx";


import Header from "./components/Header.jsx";
import Footer from "./layout/Footer.jsx";

export default function App() {
  // Signal boot overlay to dismiss once React is mounted
  useEffect(() => {
    try {
      window.bootDebug?.ready();
    } catch (err) {
      console.warn("bootDebug.ready() failed:", err);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        overflow: "hidden"
      }}
    >
      <Header />

      {/* Main content area */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/channel/:id" element={<Channel />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
