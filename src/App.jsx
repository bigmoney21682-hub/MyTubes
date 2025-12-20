import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Playlists from "./pages/Playlists";
import "./index.css";

export default function App({ apiKey }) {
  if (!apiKey) {
    return (
      <div style={{ padding: "2rem", color: "#fff", background: "#000", minHeight: "100vh" }}>
        <h3>Error: Missing YouTube API Key</h3>
        <p>Please set VITE_YOUTUBE_API_KEY in your .env file.</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home apiKey={apiKey} />} />
      <Route path="/watch/:id" element={<Watch apiKey={apiKey} />} />
      <Route path="/playlists" element={<Playlists />} />
      <Route
        path="*"
        element={
          <div style={{ padding: "2rem", color: "#fff", background: "#000", minHeight: "100vh" }}>
            <h3>Page not found</h3>
          </div>
        }
      />
    </Routes>
  );
}
