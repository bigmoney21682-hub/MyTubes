// File: src/contexts/PlayerContext.jsx
// PCC v13.3 — Global player state + debug hooks

import React, { createContext, useContext, useState, useCallback } from "react";
import { fetchRelatedVideos } from "../api/youtube";

const PlayerContext = createContext(null);
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [playerMetrics, setPlayerMetrics] = useState({
    state: "idle",
    currentTime: 0,
    duration: 0,
  });

  const playVideo = useCallback(async (video, opts = {}) => {
    window.debugLog?.(`playVideo(${video.id})`, "PLAYER");

    setCurrentVideo(video);

    if (opts.replacePlaylist) {
      setPlaylist(opts.playlist || [video]);
    }

    try {
      const rel = await fetchRelatedVideos(video.id);
      setRelatedVideos(rel);
      window.debugLog?.(`Loaded ${rel.length} related`, "PLAYER");
    } catch (err) {
      window.debugLog?.("Failed to load related videos", "ERROR");
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentVideo,
        playlist,
        relatedVideos,
        playVideo,
        playerMetrics,
        setPlayerMetrics,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
