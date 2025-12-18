// src/App.jsx

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Playlist from "./pages/Playlist";
import Playlists from "./pages/Playlists";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route path="/playlists" element={<Playlists />} />
      <Route path="/playlist/:id" element={<Playlist />} />  {/* Parameterized for single playlist */}
    </Routes>
  );
}
