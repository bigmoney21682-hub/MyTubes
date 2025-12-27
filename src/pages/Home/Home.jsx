/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description: Home page that loads trending videos and displays them
 *              using VideoCard. Fully wired to debugBus + youtube.js.
 */
window.bootDebug?.boot("Home.jsx file loaded");

import { useEffect, useState } from "react";
import { fetchTrendingVideos } from "../../api/trending";

import VideoCard from "../../components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState([]);

  // ------------------------------------------------------------
  // Load trending videos
  // ------------------------------------------------------------
  useEffect(() => {
    window.bootDebug?.home("Home.jsx mounted");
    window.bootDebug?.home("Fetching trending…");

    getTrending("US", 25).then((items) => {
      setVideos(items);
      window.bootDebug?.home(`Trending loaded: ${items.length}`);
    });
  }, []);

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Trending</h2>

      <div style={styles.list}>
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Styles
// ------------------------------------------------------------
const styles = {
  container: {
    padding: "16px",
    paddingBottom: "200px", // space above DebugOverlay
    maxWidth: "900px",
    margin: "0 auto"
  },

  header: {
    marginBottom: "16px",
    fontSize: "20px",
    fontWeight: "bold"
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  }
};
