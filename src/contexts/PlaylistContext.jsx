// File: src/contexts/PlaylistContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem("playlists");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  }, [playlists]);

  const addPlaylist = (name) => {
    setPlaylists((prev) => [...prev, { id: uuidv4(), name, videos: [] }]);
  };

  const renamePlaylist = (id, name) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const deletePlaylist = (id) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const addToPlaylist = (id, video) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, videos: p.videos.some((v) => v.id === video.id) ? p.videos : [...p.videos, video] }
          : p
      )
    );
  };

  const reorderPlaylists = (fromIndex, toIndex) => {
    setPlaylists((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  const setCurrentPlaylist = (p) => {}; // placeholder if needed

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        addPlaylist,
        renamePlaylist,
        deletePlaylist,
        addToPlaylist,
        reorderPlaylists,
        setCurrentPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => useContext(PlaylistContext);
