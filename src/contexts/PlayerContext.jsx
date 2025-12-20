// File: src/contexts/PlayerContext.jsx
import { createContext, useContext, useRef, useState } from "react";
import Player from "../components/Player";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  const playerRef = useRef(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playing, setPlaying] = useState(false);

  const playVideo = (video) => {
    setCurrentVideo(video);
    setPlaying(true);
  };

  const pauseVideo = () => setPlaying(false);
  const stopVideo = () => {
    setPlaying(false);
    setCurrentVideo(null);
  };

  return (
    <PlayerContext.Provider
      value={{
        playerRef,
        currentVideo,
        playing,
        playVideo,
        pauseVideo,
        stopVideo
      }}
    >
      {children}

      {/* Global headless player */}
      {currentVideo && (
        <Player
          ref={playerRef}
          src={`https://www.youtube.com/watch?v=${currentVideo.id}`}
          playing={playing}
          onEnded={stopVideo}
        />
      )}
    </PlayerContext.Provider>
  );
}
