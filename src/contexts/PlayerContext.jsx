// File: src/contexts/PlayerContext.jsx
// PCC v12.0 — Global Player Engine + Deep Telemetry
// rebuild-player-12

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  // ------------------------------------------------------------
  // CORE STATE
  // ------------------------------------------------------------
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playing, setPlaying] = useState(false);

  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [autonext, setAutonext] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);

  const playerRef = useRef(null);

  // ------------------------------------------------------------
  // INTERNAL LOGGING HELPERS
  // ------------------------------------------------------------
  const log = (msg, category = "PLAYER") => {
    if (window.debugEvent) window.debugEvent(msg, category);
    else window.debugLog?.(msg, category);
  };

  const logState = () => {
    log(
      `STATE → playing=${playing}, index=${currentIndex}, playlist=${playlist.length}, currentVideo=${currentVideo?.id || "null"}`,
      "PLAYER"
    );
  };

  // ------------------------------------------------------------
  // PLAY A SPECIFIC VIDEO
  // ------------------------------------------------------------
  const playVideo = (video, options = {}) => {
    if (!video || !video.id) {
      log(`playVideo() called with invalid video`, "ERROR");
      return;
    }

    log(`playVideo(id=${video.id})`, "PLAYER");

    // If caller wants to replace playlist
    if (options.replacePlaylist && Array.isArray(options.playlist)) {
      setPlaylist(options.playlist);
      const idx = options.playlist.findIndex((v) => v.id === video.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
      log(`Playlist replaced (${options.playlist.length} items)`, "PLAYER");
    } else {
      // If video exists in current playlist, update index
      const idx = playlist.findIndex((v) => v.id === video.id);
      if (idx >= 0) {
        setCurrentIndex(idx);
        log(`Index updated to ${idx}`, "PLAYER");
      }
    }

    setCurrentVideo(video);
    setPlaying(true);

    logState();
  };

  // ------------------------------------------------------------
  // PLAY NEXT
  // ------------------------------------------------------------
  const playNext = () => {
    if (!playlist.length) {
      log(`playNext() called but playlist empty`, "ERROR");
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= playlist.length) {
      log(`Reached end of playlist`, "PLAYER");
      return;
    }

    const nextVideo = playlist[nextIndex];
    log(`playNext → id=${nextVideo.id}`, "PLAYER");

    setCurrentIndex(nextIndex);
    setCurrentVideo(nextVideo);
    setPlaying(true);

    logState();
  };

  // ------------------------------------------------------------
  // PLAY PREVIOUS
  // ------------------------------------------------------------
  const playPrev = () => {
    if (!playlist.length) {
      log(`playPrev() called but playlist empty`, "ERROR");
      return;
    }

    const prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      log(`Already at start of playlist`, "PLAYER");
      return;
    }

    const prevVideo = playlist[prevIndex];
    log(`playPrev → id=${prevVideo.id}`, "PLAYER");

    setCurrentIndex(prevIndex);
    setCurrentVideo(prevVideo);
    setPlaying(true);

    logState();
  };

  // ------------------------------------------------------------
  // SEEK RELATIVE (± seconds)
  // ------------------------------------------------------------
  const seekRelative = (seconds) => {
    log(`seekRelative(${seconds})`, "PLAYER");

    try {
      const player = playerRef.current;
      if (player && player.seekTo) {
        player.seekTo(player.getCurrentTime() + seconds, true);
      }
    } catch (err) {
      log(`seekRelative error: ${err.message}`, "ERROR");
    }
  };

  // ------------------------------------------------------------
  // AUTONEXT HANDLER
  // ------------------------------------------------------------
  const handleEnded = () => {
    log(`Video ended`, "PLAYER");

    if (!autonext) {
      log(`Autonext disabled — stopping`, "PLAYER");
      setPlaying(false);
      return;
    }

    log(`Autonext triggered`, "PLAYER");
    playNext();
  };

  // ------------------------------------------------------------
  // PLAYER REF ATTACHMENT
  // ------------------------------------------------------------
  const attachPlayerRef = (ref) => {
    playerRef.current = ref;
    log(`Player ref attached`, "PLAYER");
  };

  // ------------------------------------------------------------
  // EXPOSED CONTEXT VALUE
  // ------------------------------------------------------------
  const value = {
    currentVideo,
    playing,
    playlist,
    currentIndex,
    autonext,
    relatedVideos,

    setPlaying,
    setPlaylist,
    setCurrentIndex,
    setAutonext,
    setRelatedVideos,

    playVideo,
    playNext,
    playPrev,
    seekRelative,
    handleEnded,
    attachPlayerRef,
  };

  // ------------------------------------------------------------
  // MOUNT/UNMOUNT LOGGING
  // ------------------------------------------------------------
  useEffect(() => {
    log(`PlayerContext mounted`, "UI");
    return () => log(`PlayerContext unmounted`, "UI");
  }, []);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
