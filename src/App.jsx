// File: src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Playlists from "./pages/Playlists";
import "./index.css";

export default function App({ apiKey }) {
  if (!apiKey) {
    return (
      <div style={{ padding: "2rem", color: "#fff" }}>
        <h3>Error: Missing YouTube API Key</h3>
        <p>Please provide a valid API key to App component.</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* ✅ Home page with apiKey passed */}
      <Route path="/" element={<Home apiKey={apiKey} />} />

      {/* ✅ Watch video page */}
      <Route path="/watch/:id" element={<Watch apiKey={apiKey} />} />

      {/* ✅ Local playlists/favorites */}
      <Route path="/playlists" element={<Playlists />} />

      {/* Optional fallback */}
      <Route
        path="*"
        element={
          <div style={{ padding: "2rem", color: "#fff" }}>
            <h3>Page not found</h3>
          </div>
        }
      />
    </Routes>
  );
}
