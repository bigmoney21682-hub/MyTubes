/**
 * File: PlayerContext.jsx
 * Path: src/player/PlayerContext.jsx
 * Description:
 *   Provides global player state + autonext logic.
 *   Now includes full debugging for Mac Web Inspector.
 */

import React, { createContext, useState, useCallback } from "react";
import { fetchRelated } from "../api/YouTubeAPI.js";

// ------------------------------------------------------------
// Debug helper
// ------------------------------------------------------------
function dbg(label, data = {}) {
  console.group(`[AUTONEXT] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentId, setCurrentId] = useState(null);
  const [related, setRelated] = useState([]);

  // ------------------------------------------------------------
  // Load a video
  // ------------------------------------------------------------
  const loadVideo = useCallback(async (id) => {
    dbg("loadVideo()", { id });

    setCurrentId(id);

    const rel = await fetchRelated(id);
    dbg("related fetched", { count: rel.length });

    setRelated(rel);

    // Tell GlobalPlayer to load it
    window.GlobalPlayer?.loadVideo(id);
  }, []);

  // ------------------------------------------------------------
  // Handle video end → autonext
  // ------------------------------------------------------------
  const onVideoEnd = useCallback(() => {
    dbg("onVideoEnd()", { currentId });

    if (!related.length) {
      dbg("No related videos available");
      return;
    }

    const next = related[0]?.id;
    dbg("nextVideo()", { next });

    if (next) loadVideo(next);
  }, [currentId, related, loadVideo]);

  return (
    <PlayerContext.Provider
      value={{
        currentId,
        related,
        loadVideo,
        onVideoEnd
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
