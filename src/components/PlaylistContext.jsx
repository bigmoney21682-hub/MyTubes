// File: src/components/PlayerContext.jsx
import { createContext, useContext, useRef, useState } from "react";
import Player from "./Player";

const PlayerContext = createContext();

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  const playerRef = useRef(null);
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
      value={{
        playerRef,
        currentVideo,
        playing,
        playVideo,
        pauseVideo,
        stopVideo,
      }}
    >
      {children}

      {/* Global Player */}
      {currentVideo && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 60,
            background: "#111",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            zIndex: 9999,
          }}
        >
          <Player
            ref={playerRef}
            src={`https://www.youtube.com/watch?v=${currentVideo.id}`}
            playing={playing}
            onEnded={stopVideo}
          />
          <span
            style={{
              color: "#fff",
              marginLeft: 12,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {currentVideo.title}
          </span>
          <button
            onClick={() => (playing ? pauseVideo() : playVideo(currentVideo))}
            style={{
              marginLeft: "auto",
              padding: "6px 12px",
              background: "#ff0000",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      )}
    </PlayerContext.Provider>
  );
}
