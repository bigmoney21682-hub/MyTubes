// File: src/contexts/PlaylistContext.jsx
// Description:
//   Fully corrected playlist manager with:
//   - Video ID normalizer
//   - Safe add/remove
//   - Guaranteed correct item shape
//   - LocalStorage persistence
//   - Compatible with Watch.jsx + AutonextEngine

import React, { createContext, useContext, useState, useCallback } from "react";
import { debugBus } from "../debug/debugBus.js";

const PlaylistContext = createContext(null);

/* ------------------------------------------------------------
   NORMALIZER — FIXES "Invalid video id"
------------------------------------------------------------ */
function normalizeVideoId(raw) {
  if (!raw) return null;

  // Already a string
  if (typeof raw === "string") return raw;

  // { id: "abc123" }
  if (typeof raw.id === "string") return raw.id;

  // { videoId: "abc123" }
  if (typeof raw.videoId === "string") return raw.videoId;

  // { id: { videoId: "abc123" } }
  if (raw.id && typeof raw.id.videoId === "string") return raw.id.videoId;

  // { snippet: { resourceId: { videoId: "abc123" } } }
  if (raw.snippet?.resourceId?.videoId) return raw.snippet.resourceId.videoId;

  return null;
}

/* ------------------------------------------------------------
   NORMALIZE FULL PLAYLIST ITEM
------------------------------------------------------------ */
function normalizePlaylistItem(raw) {
  const id = normalizeVideoId(raw);
  if (!id) return null;

  return {
    id,
    title:
      raw.title ||
      raw.snippet?.title ||
      "",
    thumbnail:
      raw.thumbnail ||
      raw.snippet?.thumbnails?.medium?.url ||
      raw.snippet?.thumbnails?.default?.url ||
      ""
  };
}

/* ------------------------------------------------------------
   PROVIDER
------------------------------------------------------------ */
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
     CREATE PLAYLIST
  ------------------------------------------------------------ */
  const createPlaylist = useCallback(
    (name, firstVideoRaw) => {
      const firstVideo = firstVideoRaw
        ? normalizePlaylistItem(firstVideoRaw)
        : null;

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
      debugBus.log("Playlist created:", id);
      return id;
    },
    [playlists]
  );

  /* ------------------------------------------------------------
     ADD VIDEO TO PLAYLIST (SAFE)
  ------------------------------------------------------------ */
  const addVideoToPlaylist = useCallback(
    (playlistId, rawVideo) => {
      const item = normalizePlaylistItem(rawVideo);
      if (!item) {
        debugBus.error("PlaylistContext → Invalid video added:", rawVideo);
        return;
      }

      const next = playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;

        // Prevent duplicates
        if (pl.videos.some((v) => v.id === item.id)) return pl;

        return {
          ...pl,
          videos: [...pl.videos, item]
        };
      });

      persist(next);
      debugBus.log("Added video to playlist:", playlistId, item.id);
    },
    [playlists]
  );

  /* ------------------------------------------------------------
     REMOVE VIDEO FROM PLAYLIST
  ------------------------------------------------------------ */
  const removeVideoFromPlaylist = useCallback(
    (playlistId, videoId) => {
      const next = playlists.map((pl) =>
        pl.id === playlistId
          ? {
              ...pl,
              videos: pl.videos.filter((v) => v.id !== videoId)
            }
          : pl
      );

      persist(next);
      debugBus.log("Removed video from playlist:", playlistId, videoId);
    },
    [playlists]
  );

  /* ------------------------------------------------------------
     DELETE PLAYLIST
  ------------------------------------------------------------ */
  const deletePlaylist = useCallback(
    (playlistId) => {
      const next = playlists.filter((pl) => pl.id !== playlistId);
      persist(next);
      debugBus.log("Deleted playlist:", playlistId);
    },
    [playlists]
  );

  /* ------------------------------------------------------------
     RENAME PLAYLIST
  ------------------------------------------------------------ */
  const renamePlaylist = useCallback(
    (playlistId, newName) => {
      const next = playlists.map((pl) =>
        pl.id === playlistId ? { ...pl, name: newName } : pl
      );
      persist(next);
      debugBus.log("Renamed playlist:", playlistId, newName);
    },
    [playlists]
  );

  /* ------------------------------------------------------------
     OPEN "ADD TO PLAYLIST" QUICK ACTION
  ------------------------------------------------------------ */
  const openAddToPlaylist = useCallback(
    (rawVideo) => {
      debugBus.log("PlaylistContext → openAddToPlaylist", rawVideo);

      const item = normalizePlaylistItem(rawVideo);
      if (!item) {
        debugBus.error("Invalid video passed to openAddToPlaylist:", rawVideo);
        return;
      }

      // If no playlists exist → auto-create one
      if (!playlists.length) {
        const newId = createPlaylist("My Playlist", item);
        debugBus.log("Created playlist automatically:", newId);
        return;
      }

      // For now: add to first playlist
      addVideoToPlaylist(playlists[0].id, item);
      debugBus.log("Added to playlist:", playlists[0].id);
    },
    [playlists, createPlaylist, addVideoToPlaylist]
  );

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        deletePlaylist,
        renamePlaylist,
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
