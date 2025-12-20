// File: src/components/PlaylistContext.jsx

import { createContext, useContext, useEffect, useState } from "react";

const PlaylistContext = createContext(null);

export function usePlaylists() {
  return useContext(PlaylistContext);
}

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState(() => {
    try {
      const stored = localStorage.getItem("mytube_playlists");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  useEffect(() => {
    localStorage.setItem("mytube_playlists", JSON.stringify(playlists));
  }, [playlists]);

  function addPlaylist(name) {
    setPlaylists((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        videos: [],
      },
    ]);
  }

  function renamePlaylist(id, name) {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  }

  function deletePlaylist(id) {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    if (currentPlaylist?.id === id) {
      setCurrentPlaylist(null);
    }
  }

  function addVideoToPlaylist(playlistId, video) {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, videos: [...p.videos, video] }
          : p
      )
    );
  }

  return (
    <PlaylistContext.Provider
      value={{
        playlists,              // ✅ ALWAYS an array
        currentPlaylist,
        setCurrentPlaylist,
        addPlaylist,
        renamePlaylist,
        deletePlaylist,
        addVideoToPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}
