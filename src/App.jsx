// File: src/App.jsx

import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import BootSplash from "./components/BootSplash";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <BootSplash ready={ready} />

      {ready && (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlists" element={<Playlists />} />
        </Routes>
      )}
    </>
  );
}
