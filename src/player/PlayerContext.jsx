/**
 * File: PlayerContext.jsx
 * Path: src/player/PlayerContext.jsx
 * Description:
 *   Global player state for the new architecture.
 *   - Tracks current video ID
 *   - Tracks current metadata (title + thumbnail)
 *   - Tracks playing state
 *   - Exposes loadVideo()
 *   - No autonext logic here (handled by AutonextEngine + Home.jsx)
 */

import React, {
  createContext,
  useState,
  useCallback,
  useMemo
} from "react";

function dbg(label, data = {}) {
  console.group(`[PLAYERCTX] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

export const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentId, setCurrentId] = useState(null);

  // ⭐ Metadata for MiniPlayer + FullPlayer
  const [currentMeta, setCurrentMeta] = useState({
    title: "",
    thumbnail: ""
  });

  // ⭐ Playing state (MiniPlayer UI)
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * Load a video globally.
   * - Updates currentId
   * - Updates metadata (if provided)
   * - Tells GlobalPlayerFix to load the video
   */
  const loadVideo = useCallback((id, meta = null) => {
    if (!id) {
      dbg("loadVideo() → invalid id", { id });
      return;
    }

    dbg("loadVideo()", { id, meta });

    setCurrentId(id);

    // If Home/Search provides metadata, store it
    if (meta) {
      setCurrentMeta({
        title: meta.title || "",
        thumbnail: meta.thumbnail || ""
      });
    }

    // Global unified player
    try {
      window.GlobalPlayer?.loadVideo(id);
    } catch (err) {
      dbg("GlobalPlayer.loadVideo() error", { err });
    }
  }, []);

  /**
   * Stable context value
   */
  const value = useMemo(() => {
    return {
      currentId,
      currentMeta,
      isPlaying,

      loadVideo,
      setCurrentMeta,
      setIsPlaying
    };
  }, [currentId, currentMeta, isPlaying, loadVideo]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
