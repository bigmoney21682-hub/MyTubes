// File: src/contexts/PlayerContext.jsx
// PCC v13.0 — Global Player Engine + YouTube-Only Related Loader
// Changes:
// - Added fetchRelatedVideos import
// - Added loadRelated() helper
// - Auto-load related videos on playVideo()
// - Removed all legacy utils dependencies
// - Cleaned logging + state transitions

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

import { fetchRelatedVideos } from "../api/youtube";

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
  // LOAD RELATED VIDEOS (YouTube Data API)
  // ------------------------------------------------------------
  const loadRelated = async (videoId) => {
    if (!videoId) return;

    log(`Loading related videos for id=${videoId}`, "PLAYER");

    try {
      const items = await fetchRelatedVideos(videoId);
      setRelatedVideos(items);
      log(`Related videos loaded (${items.length})`, "PLAYER");
    } catch (err) {
      log(`Failed to load related videos: ${err.message}`, "ERROR");
    }
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

    // Replace playlist if requested
    if (options.replacePlaylist && Array.isArray(options.playlist)) {
      setPlaylist(options.playlist);
      const idx = options.playlist.findIndex((v) => v.id === video.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
      log(`Playlist replaced (${options.playlist.length} items)`, "PLAYER");
    } else {
      // Update index if video exists in current playlist
      const idx = playlist.findIndex((v) => v.id === video.id);
      if (idx >= 0) {
        setCurrentIndex(idx);
        log(`Index updated to ${idx}`, "PLAYER");
      }
    }

    setCurrentVideo(video);
    setPlaying(true);

    // Load related videos automatically
    loadRelated(video.id);

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

    loadRelated(nextVideo.id);

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

    loadRelated(prevVideo.id);

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

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
