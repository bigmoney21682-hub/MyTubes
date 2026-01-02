// File: src/contexts/PlaylistContext.jsx

import React, { createContext, useContext, useState, useCallback } from "react";
import { debugBus } from "../debug/debugBus.js";

const PlaylistContext = createContext(null);

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState(() => {
    try {
      const raw = localStorage.getItem("mytube_playlists");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persist = (next) => {
    setPlaylists(next);
    try {
      localStorage.setItem("mytube_playlists", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const addVideoToPlaylist = useCallback(
    (playlistId, video) => {
      persist(
        playlists.map((pl) =>
          pl.id === playlistId
            ? {
                ...pl,
                videos: pl.videos.some((v) => v.id === video.id)
                  ? pl.videos
                  : [...pl.videos, video]
              }
            : pl
        )
      );
    },
    [playlists]
  );

  const createPlaylist = useCallback(
    (name, firstVideo) => {
      const id = "pl_" + Date.now();
      const next = [
        ...playlists,
        {
          id,
          name,
          videos: firstVideo ? [firstVideo] : []
        }
      ];
      persist(next);
      return id;
    },
    [playlists]
  );

  const openAddToPlaylist = useCallback(
    (video) => {
      debugBus.log("PlaylistContext → openAddToPlaylist", video);

      // Minimal UX: if no playlists, create one automatically.
      if (!playlists.length) {
        const newId = createPlaylist("My Playlist", video);
        debugBus.log("Created playlist", newId);
        return;
      }

      // For now, just add to the first playlist.
      addVideoToPlaylist(playlists[0].id, video);
      debugBus.log("Added to playlist", playlists[0].id);
    },
    [playlists, addVideoToPlaylist, createPlaylist]
  );

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        addVideoToPlaylist,
        createPlaylist,
        openAddToPlaylist
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  return useContext(PlaylistContext);
}
