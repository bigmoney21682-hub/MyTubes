// File: src/App.jsx

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Playlists from "./pages/Playlists";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App({ apiKey }) {
  return (
    <div className="app-root">
      <Header />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home apiKey={apiKey} />} />
          <Route path="/watch/:id" element={<Watch apiKey={apiKey} />} />
          <Route path="/playlists" element={<Playlists />} />

          <Route
            path="*"
            element={
              <div style={{ padding: "2rem", opacity: 0.7 }}>
                Page not found
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
