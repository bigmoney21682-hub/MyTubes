/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description: Watch page with player events wired to DebugOverlay v3.
 */

import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { logPlayer } from "../../debug/debugBus";
// import YourPlayer from "../../components/YourPlayer"; // example

export default function Watch() {
  const { id } = useParams();

  useEffect(() => {
    logPlayer("Watch page loaded", { id });
    window.bootDebug?.info("WATCH → " + id);
  }, [id]);

  function handlePlayerReady() {
    logPlayer("Player ready", { id });
  }

  function handlePlayerPlay() {
    logPlayer("Play", { id });
  }

  function handlePlayerPause() {
    logPlayer("Pause", { id });
  }

  function handlePlayerEnded() {
    logPlayer("Ended", { id });
  }

  return (
    <div>
      {/* Replace with your real player component */}
      {/* 
      <YourPlayer
        videoId={id}
        onReady={handlePlayerReady}
        onPlay={handlePlayerPlay}
        onPause={handlePlayerPause}
        onEnded={handlePlayerEnded}
      />
      */}
      <div style={{ color: "#fff" }}>
        Player goes here for video: {id}
      </div>
    </div>
  );
}
