// File: src/contexts/PlayerContext.jsx
// PCC v2.0 — Centralized player state (no UI yet, background-ready)

import { createContext, useContext, useState, useCallback } from "react";

const PlayerContext = createContext(null);
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playVideo = useCallback((video, list = null) => {
    if (Array.isArray(list) && list.length > 0) {
      setPlaylist(list);
      const idx = list.findIndex(
        (v) =>
          v.id === video.id ||
          v.id?.videoId === video.id ||
          v.id === video.id?.videoId
      );
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else if (video) {
      setPlaylist([video]);
      setCurrentIndex(0);
    }

    setCurrentVideo(video);
    setPlaying(true);
  }, []);

  const pauseVideo = useCallback(() => {
    setPlaying(false);
  }, []);

  const stopVideo = useCallback(() => {
    setPlaying(false);
    setCurrentVideo(null);
    setPlaylist([]);
    setCurrentIndex(0);
  }, []);

  const playNext = useCallback(() => {
    if (playlist.length <= 1) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentVideo(playlist[nextIndex]);
    setPlaying(true);
  }, [playlist, currentIndex]);

  const playPrev = useCallback(() => {
    if (playlist.length <= 1) return;
    const prevIndex =
      (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    setCurrentVideo(playlist[prevIndex]);
    setPlaying(true);
  }, [playlist, currentIndex]);

  const value = {
    currentVideo,
    playing,
    playlist,
    currentIndex,
    playVideo,
    pauseVideo,
    stopVideo,
    playNext,
    playPrev,
    setCurrentVideo,
    setPlaying,
    setPlaylist,
    setCurrentIndex,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Next step: mount hidden global ReactPlayer here */}
    </PlayerContext.Provider>
  );
}
