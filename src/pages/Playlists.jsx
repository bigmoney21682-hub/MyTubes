import { useEffect } from "react";
import { usePlaylists } from "../contexts/PlaylistContext";

export default function Playlists() {
  const { playlists, addPlaylist } = usePlaylists();

  useEffect(() => {
    window.debugLog?.("DEBUG: Playlists page mounted");
    window.debugLog?.(`DEBUG: Playlists count = ${playlists.length}`);
  }, [playlists.length]);

  const handleAdd = () => {
    const name = prompt("Enter new playlist name:");
    if (name) addPlaylist(name);
  };

  return (
    <div style={{ paddingTop: "var(--header-height)", paddingBottom: "var(--footer-height)" }}>
      <h2>Playlists</h2>
      <button onClick={handleAdd}>+ Add Playlist</button>

      <ul>
        {playlists.map((p) => (
          <li key={p.id}>{p.name} ({p.videos?.length || 0} videos)</li>
        ))}
      </ul>
    </div>
  );
}
