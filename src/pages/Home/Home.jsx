/**
 * File: Home.jsx
 * Path: src/pages/Home/Home.jsx
 * Description: Home page showing trending videos from YouTube Data API v3
 *              via the unified youtubeApiRequest client.
 */

import React, { useEffect, useState } from "react";
import { fetchTrendingVideos } from "../../api/trending.js";
import { debugBus } from "../../debug/debugBus.js";
import VideoCard from "../../components/VideoCard/VideoCard.jsx";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.bootDebug.home("Home mounted → fetching trending videos");

    async function load() {
      const list = await fetchTrendingVideos("US");
      setVideos(list);
      setLoading(false);

      debugBus.log("ROUTER", `Home loaded → ${list.length} videos`);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2 style={{ color: "white" }}>Loading trending videos…</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px"
  },
  loading: {
    padding: "40px",
    textAlign: "center"
  }
};
