/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description: YouTube‑accurate watch page using the IFrame API wrapper
 *              from src/api/youtube.js. Fully debug‑instrumented.
 */

import { useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  loadVideo,
  play,
  pause,
  seek,
  destroyPlayer
} from "../../api/youtube";

export default function Watch() {
  const { id } = useParams();

  useEffect(() => {
    window.bootDebug?.watch("Watch.jsx mounted → video " + id);

    // Load the video into the persistent player
    loadVideo("player-container", id);

    return () => {
      window.bootDebug?.watch("Watch.jsx unmounted → destroy player");
      destroyPlayer();
    };
  }, [id]);

  return (
    <div style={styles.page}>
      {/* Player container */}
      <div id="player-container" style={styles.player} />

      {/* Debug controls (optional) */}
      <div style={styles.controls}>
        <button onClick={() => play()} style={styles.btn}>Play</button>
        <button onClick={() => pause()} style={styles.btn}>Pause</button>
        <button onClick={() => seek(60)} style={styles.btn}>Seek 1:00</button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    background: "#000",
    color: "#fff",
    paddingBottom: "200px"
  },
  player: {
    width: "100%",
    height: "240px",
    background: "#111"
  },
  controls: {
    display: "flex",
    gap: "10px",
    padding: "12px"
  },
  btn: {
    padding: "6px 12px",
    background: "#333",
    border: "1px solid #555",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer"
  }
};
