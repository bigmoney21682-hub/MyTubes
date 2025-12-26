// File: src/contexts/PlayerContext.jsx
// PCC v13.3 — Global player state + debug hooks (YouTube-only)

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { fetchRelatedVideos } from "../api/youtube";
import { debugPlayer, debugError } from "../utils/debug";

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
    debugPlayer(`playVideo(${video.id})`);

    setCurrentVideo(video);

    if (opts.replacePlaylist) {
      setPlaylist(opts.playlist || [video]);
    }

    try {
      debugPlayer(`Fetch related for ${video.id}`);
      const rel = await fetchRelatedVideos(video.id);
      setRelatedVideos(rel);
      debugPlayer(`Loaded ${rel.length} related for ${video.id}`);
    } catch (err) {
      debugError(`Failed to load related videos for id=${video.id}`);
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
