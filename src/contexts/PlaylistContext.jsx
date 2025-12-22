// File: src/contexts/PlaylistContext.jsx
// PCC v2.0 — Stable playlists with IndexedDB and full API

import { createContext, useContext, useEffect, useState } from "react";

// IndexedDB constants
const DB_NAME = "MyTubeDB";
const STORE_NAME = "playlists";
const DB_VERSION = 1;

// Simple logger
const log = (msg) => window.debugLog?.(`PlaylistContext: ${msg}`);

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("IndexedDB failed to open");
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

// Fetch all playlists
function getAllPlaylists() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject("Failed to get playlists");
    });
  });
}

// Save or update a playlist
function savePlaylist(playlist) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(playlist);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Failed to save playlist");
    });
  });
}

// Delete a playlist
function deletePlaylistDB(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Failed to delete playlist");
    });
  });
}

// Context
const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);

  // Load playlists on mount
  useEffect(() => {
    getAllPlaylists()
      .then((data) => {
        const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setPlaylists(sorted);
        log(`Loaded ${sorted.length} playlists from IndexedDB`);
      })
      .catch((err) => log(`Error loading playlists: ${err}`));
  }, []);

  // Add new playlist
  const addPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      videos: [],
      order: playlists.length,
    };

    setPlaylists((prev) => {
      const updated = [...prev, newPlaylist];
      savePlaylist(newPlaylist).catch((err) =>
        log(`Failed to save new playlist: ${err}`)
      );
      log(`Added playlist: "${name}" (id=${newPlaylist.id})`);
      return updated;
    });

    return newPlaylist;
  };

  // Rename playlist
  const renamePlaylist = (id, newName) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, name: newName };
          savePlaylist(updated).catch((err) =>
            log(`Failed to rename playlist: ${err}`)
          );
          log(`Renamed playlist ${id} -> "${newName}"`);
          return updated;
        }
        return p;
      })
    );
  };

  // Delete playlist
  const deletePlaylist = (id) => {
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      deletePlaylistDB(id).catch((err) =>
        log(`Failed to delete playlist: ${err}`)
      );
      log(`Deleted playlist id=${id}`);
      return updated;
    });
  };

  // Add video to playlist
  const addToPlaylist = (playlistId, video) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          const updated = { ...p, videos: [...(p.videos || []), video] };
          savePlaylist(updated).catch((err) =>
            log(`Failed to add video to playlist: ${err}`)
          );
          log(
            `Added video "${video.title}" (id=${video.id}) to playlist "${p.name}" (${playlistId})`
          );
          return updated;
        }
        return p;
      })
    );
  };

  // Remove video from playlist
  const removeFromPlaylist = (playlistId, videoId) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          const updated = {
            ...p,
            videos: (p.videos || []).filter((v) => v.id !== videoId),
          };
          savePlaylist(updated).catch((err) =>
            log(`Failed to remove video from playlist: ${err}`)
          );
          log(
            `Removed video ${videoId} from playlist "${p.name}" (${playlistId})`
          );
          return updated;
        }
        return p;
      })
    );
  };

  // Reorder playlists
  const movePlaylist = (id, direction) => {
    setPlaylists((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      if (index < 0) return prev;

      let newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updated = [...prev];
      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];

      // Reassign order and persist
      updated.forEach((p, i) => {
        p.order = i;
        savePlaylist(p).catch((err) =>
          log(`Failed to save order for playlist ${p.id}: ${err}`)
        );
      });

      log(`Moved playlist ${id} ${direction}`);
      return updated;
    });
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        addPlaylist,
        renamePlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        movePlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

// Hook
export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (!context)
    throw new Error("usePlaylists must be used within a PlaylistProvider");
  return context;
}
