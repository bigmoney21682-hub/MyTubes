// File: src/pages/Playlists.jsx
import { useState, useEffect } from "react";
import { usePlaylists } from "../contexts/PlaylistContext";
import DebugOverlay from "../components/DebugOverlay";

export default function Playlists() {
  const { playlists, addToPlaylist } = usePlaylists();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.debugLog("DEBUG: Playlists page mounted");
    setLoading(false);
    window.debugLog(`DEBUG: Loaded playlists count: ${playlists.length}`);
  }, [playlists]);

  const handleAdd = () => {
    const name = prompt("Enter new playlist name:");
    if (name) {
      addToPlaylist(name);
      window.debugLog(`DEBUG: Added new playlist: ${name}`);
    }
  };

  return (
    <div style={{ paddingTop: "var(--header-height)", paddingBottom: "var(--footer-height)" }}>
      <DebugOverlay pageName="Playlists" />
      <h2>Playlists</h2>
      {loading && <p>Loading playlists…</p>}
      <button onClick={handleAdd}>+ Add Playlist</button>
      <ul>
        {playlists.map((p) => (
          <li key={p.id}>
            {p.name} ({p.videos?.length || 0} videos)
          </li>
        ))}
      </ul>
    </div>
  );
}
