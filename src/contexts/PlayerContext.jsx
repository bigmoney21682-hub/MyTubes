// File: src/contexts/PlayerContext.jsx
// PCC v1.0 — Preservation-First Mode

import { createContext, useContext, useState } from "react";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playing, setPlaying] = useState(false);

  function playVideo(video) {
    setCurrentVideo(video);
    setPlaying(true);
  }

  function pauseVideo() {
    setPlaying(false);
  }

  function stopVideo() {
    setPlaying(false);
    setCurrentVideo(null);
  }

  return (
    <PlayerContext.Provider
      value={{ currentVideo, playing, playVideo, pauseVideo, stopVideo }}
    >
      {children}
      {/* Hidden global Player temporarily removed for iOS PWA debugging */}
    </PlayerContext.Provider>
  );
}
