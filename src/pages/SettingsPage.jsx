// File: src/pages/SettingsPage.jsx
import { useState, useEffect } from "react";
import { clearAllCaches } from "../utils/cacheManager";
import Header from "../components/Header";

export default function SettingsPage() {
  const [autoClear, setAutoClear] = useState(
    localStorage.getItem("autoClearCache") === "true"
  );

  const toggleAutoClear = () => {
    const newValue = !autoClear;
    setAutoClear(newValue);
    localStorage.setItem("autoClearCache", newValue);
  };

  const handleManualClear = async () => {
    await clearAllCaches();
    alert("Caches cleared (except playlists)");
  };

  return (
    <div style={{ paddingTop: "var(--header-height)", paddingBottom: "var(--footer-height)" }}>
      <Header />
      <h2>Settings</h2>

      <div style={{ margin: "16px 0" }}>
        <label>
          <input type="checkbox" checked={autoClear} onChange={toggleAutoClear} />
          Auto-clear cache on boot (except playlists)
        </label>
      </div>

      <div style={{ margin: "16px 0" }}>
        <button onClick={handleManualClear}>Clear caches now</button>
      </div>

      <p style={{ opacity: 0.7 }}>
        Cache types:
        <ul>
          <li>PWA Asset Cache (Service Worker)</li>
          <li>Runtime Network Cache</li>
          <li>Dev Build Cache (Vite)</li>
        </ul>
      </p>
    </div>
  );
}
