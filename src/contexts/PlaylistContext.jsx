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
    } catch {}
  };

  /* ------------------------------------------------------------
     ADD VIDEO TO PLAYLIST
  ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     REMOVE VIDEO FROM PLAYLIST  ← MISSING BEFORE
  ------------------------------------------------------------ */
  const removeVideoFromPlaylist = useCallback(
    (playlistId, videoId) => {
      persist(
        playlists.map((pl) =>
          pl.id === playlistId
            ? {
                ...pl,
                videos: pl.videos.filter((v) => v.id !== videoId)
              }
            : pl
        )
      );
    },
    [playlists]
  );

  /* ------------------------------------------------------------
     CREATE PLAYLIST
  ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     DELETE PLAYLIST  ← MISSING BEFORE
  ------------------------------------------------------------ */
  const deletePlaylist = useCallback(
    (playlistId) => {
      persist(playlists.filter((pl) => pl.id !== playlistId));
    },
    [playlists]
  );

  /* ------------------------------------------------------------
     OPEN ADD-TO-PLAYLIST POPUP (TEMP UX)
  ------------------------------------------------------------ */
  const openAddToPlaylist = useCallback(
    (video) => {
      debugBus.log("PlaylistContext → openAddToPlaylist", video);

      if (!playlists.length) {
        const newId = createPlaylist("My Playlist", video);
        debugBus.log("Created playlist", newId);
        return;
      }

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
        removeVideoFromPlaylist,   // ← NOW EXPORTED
        createPlaylist,
        deletePlaylist,            // ← NOW EXPORTED
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
