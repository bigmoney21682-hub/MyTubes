/**
 * File: App.jsx
 * Path: src/app/App.jsx
 */

import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home.jsx";
import Search from "../pages/Search.jsx";
import Playlist from "../pages/Playlist.jsx";
import Channel from "../pages/Channel.jsx";

import Menu from "../pages/Menu.jsx";
import Playlists from "../pages/Playlists.jsx";
import Shorts from "../pages/Shorts.jsx";
import Subs from "../pages/Subs.jsx";

import Header from "../components/Header.jsx";
import Footer from "../layout/Footer.jsx";

import PlayerShell from "../player/PlayerShell.jsx";

export default function App() {
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
        color: "#fff"
      }}
    >
      <Header />

      <PlayerShell />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: "60px",
          paddingBottom: "56px"
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/channel/:id" element={<Channel />} />

          <Route path="/menu" element={<Menu />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/subs" element={<Subs />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
