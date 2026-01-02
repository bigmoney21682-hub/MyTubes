/**
 * File: PlaylistContext.jsx
 * Path: src/contexts/PlaylistContext.jsx
 * Description: Global playlist manager with IndexedDB persistence.
 *              Supports create, delete, rename, add/remove videos.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { debugBus } from "../debug/debugBus.js";

// IndexedDB helpers
const DB_NAME = "mytube-playlists-db";
const STORE_NAME = "playlists";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ------------------------------------------------------------
   Context
------------------------------------------------------------- */
const PlaylistContext = createContext(null);

export function usePlaylists() {
  return useContext(PlaylistContext);
}

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);

  /* ------------------------------------------------------------
     Load playlists from IndexedDB on startup
  ------------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const list = await dbGetAll();
        debugBus.log("PLAYLIST", `Loaded ${list.length} playlists from DB`);
        setPlaylists(list);
      } catch (err) {
        debugBus.log("PLAYLIST", "Error loading playlists: " + err?.message);
      }
    })();
  }, []);

  /* ------------------------------------------------------------
     Persist playlist changes
  ------------------------------------------------------------- */
  async function persist(playlist) {
    try {
      await dbPut(playlist);
      debugBus.log("PLAYLIST", `Persisted playlist "${playlist.name}"`);
    } catch (err) {
      debugBus.log("PLAYLIST", "Persist error: " + err?.message);
    }
  }

  async function removeFromDB(id) {
    try {
      await dbDelete(id);
      debugBus.log("PLAYLIST", `Deleted playlist ${id} from DB`);
    } catch (err) {
      debugBus.log("PLAYLIST", "Delete error: " + err?.message);
    }
  }

  /* ------------------------------------------------------------
     Create playlist
  ------------------------------------------------------------- */
  function createPlaylist(name) {
    const id = crypto.randomUUID();
    const newPlaylist = { id, name, videos: [] };

    setPlaylists((prev) => [...prev, newPlaylist]);
    persist(newPlaylist);

    debugBus.log("PLAYLIST", `Created playlist "${name}"`);
  }

  /* ------------------------------------------------------------
     Delete playlist
  ------------------------------------------------------------- */
  function deletePlaylist(id) {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    removeFromDB(id);

    debugBus.log("PLAYLIST", `Deleted playlist ${id}`);
  }

  /* ------------------------------------------------------------
     ⭐ Rename playlist
  ------------------------------------------------------------- */
  function renamePlaylist(id, newName) {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: newName } : p
      )
    );

    const updated = playlists.find((p) => p.id === id);
    if (updated) {
      persist({ ...updated, name: newName });
    }

    debugBus.log("PLAYLIST", `Renamed playlist ${id} → "${newName}"`);
  }

  /* ------------------------------------------------------------
     Add video to playlist
  ------------------------------------------------------------- */
  function addVideoToPlaylist(id, video) {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        // Prevent duplicates
        if (p.videos.some((v) => v.id === video.id)) {
          debugBus.log("PLAYLIST", `Video already in playlist: ${video.id}`);
          return p;
        }

        const updated = { ...p, videos: [...p.videos, video] };
        persist(updated);
        return updated;
      })
    );

    debugBus.log("PLAYLIST", `Added video ${video.id} → playlist ${id}`);
  }

  /* ------------------------------------------------------------
     Remove video from playlist
  ------------------------------------------------------------- */
  function removeVideoFromPlaylist(id, videoId) {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const updated = {
          ...p,
          videos: p.videos.filter((v) => v.id !== videoId)
        };

        persist(updated);
        return updated;
      })
    );

    debugBus.log("PLAYLIST", `Removed video ${videoId} from playlist ${id}`);
  }

  /* ------------------------------------------------------------
     Provide context
  ------------------------------------------------------------- */
  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,          // ⭐ NEW
        addVideoToPlaylist,
        removeVideoFromPlaylist
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}
