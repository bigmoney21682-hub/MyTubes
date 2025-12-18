// src/components/PlaylistContext.jsx

import { createContext, useContext, useState, useEffect } from "react";

const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem("mytube_playlists");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [{ id: "0", name: "Favorites", videos: [] }];
  });

  const [currentPlaylistId, setCurrentPlaylistId] = useState("0");

  useEffect(() => {
    localStorage.setItem("mytube_playlists", JSON.stringify(playlists));
  }, [playlists]);

  const addPlaylist = (name) => {
    if (!name?.trim()) return;
    const newPl = { id: Date.now().toString(), name: name.trim(), videos: [] };
    setPlaylists(prev => [...prev, newPl]);
  };

  const renamePlaylist = (id, newName) => {
    if (!newName?.trim()) return;
    setPlaylists(prev =>
      prev.map(p => (p.id === id ? { ...p, name: newName.trim() } : p))
    );
  };

  const deletePlaylist = (id) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (currentPlaylistId === id) {
      setCurrentPlaylistId(playlists[0]?.id || null);
    }
  };

  const addToPlaylist = (playlistId, video) => {
    setPlaylists(prev => {
      return prev.map(p => {
        if (p.id === playlistId) {
          if (!p.videos.some(v => v.id === video.id)) {
            return { ...p, videos: [...p.videos, video] };
          }
        }
        return p;
      });
    });
  };

  const setCurrentPlaylist = (playlist) => {
    setCurrentPlaylistId(playlist.id);
  };

  const currentPlaylist = playlists.find(p => p.id === currentPlaylistId) || playlists[0] || { name: "", videos: [] };

  return (
    <PlaylistContext.Provider value={{
      playlists,
      currentPlaylist,
      setCurrentPlaylist,
      addPlaylist,
      renamePlaylist,
      deletePlaylist,
      addToPlaylist,
    }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export const usePlaylists = () => useContext(PlaylistContext);
