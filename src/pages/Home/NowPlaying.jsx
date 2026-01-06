/**
 * File: NowPlaying.jsx
 * Path: src/pages/Home/NowPlaying.jsx
 *
 * Minimal version — displays metadata for the current video.
 */

import React, { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../../player/PlayerContext.jsx";
import { fetchVideo } from "../../api/YouTubeAPI.js";

// ------------------------------------------------------------
// Debug helper
// ------------------------------------------------------------
function dbg(label, data = {}) {
  console.group(`[NowPlaying] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

export default function NowPlaying() {
  const { currentId } = useContext(PlayerContext);
  const [meta, setMeta] = useState(null);

  // Fetch metadata when currentId changes
  useEffect(() => {
    if (!currentId) {
      dbg("No currentId");
      return;
    }

    dbg("Fetching metadata", { currentId });

    fetchVideo(currentId).then((data) => {
      dbg("Metadata loaded", data);
      setMeta(data?.snippet || null);
    });
  }, [currentId]);

  if (!currentId || !meta) return null;

  return (
    <div style={{ padding: "12px 16px", color: "#fff" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
        {meta.title}
      </h2>
      <div style={{ opacity: 0.7, fontSize: "13px" }}>
        {meta.channelTitle}
      </div>
    </div>
  );
}
