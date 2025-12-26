// File: src/contexts/PlayerContext.jsx
// PCC v13.1 — Global Player Engine + Metrics Integration
// Changes:
// - Added playerMetrics object
// - Added setPlayerMetrics()
// - Integrated with GlobalPlayer polling
// - Human-readable player states
// - No legacy utils

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

  // NEW: Player metrics
  const [playerMetrics, setPlayerMetrics] = useState({
    duration: 0,
    currentTime: 0,
    buffered: 0,
    state: "unstarted",
  });

  const playerRef = useRef(null);

  // ------------------------------------------------------------
  // LOGGING
  // ------------------------------------------------------------
  const log = (msg, category = "PLAYER") => {
    if (window.debugEvent) window.debugEvent(msg, category);
    else window.debugLog?.(msg, category);
  };

  // ------------------------------------------------------------
  // LOAD RELATED VIDEOS
  // ------------------------------------------------------------
  const loadRelated = async (videoId) => {
    if (!videoId) return;
    try {
      const items = await fetchRelatedVideos(videoId);
      setRelatedVideos(items);
      log(`Related videos loaded (${items.length})`);
    } catch (err) {
      log(`Failed to load related videos: ${err.message}`, "ERROR");
    }
  };

  // ------------------------------------------------------------
  // PLAY VIDEO
  // ------------------------------------------------------------
  const playVideo = (video, options = {}) => {
    if (!video || !video.id) return;

    if (options.replacePlaylist && Array.isArray(options.playlist)) {
      setPlaylist(options.playlist);
      const idx = options.playlist.findIndex((v) => v.id === video.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      const idx = playlist.findIndex((v) => v.id === video.id);
      if (idx >= 0) setCurrentIndex(idx);
    }

    setCurrentVideo(video);
    setPlaying(true);
    loadRelated(video.id);
  };

  // ------------------------------------------------------------
  // NEXT / PREV
  // ------------------------------------------------------------
  const playNext = () => {
    if (!playlist.length) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) return;

    const nextVideo = playlist[nextIndex];
    setCurrentIndex(nextIndex);
    setCurrentVideo(nextVideo);
    setPlaying(true);
    loadRelated(nextVideo.id);
  };

  const playPrev = () => {
    if (!playlist.length) return;
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) return;

    const prevVideo = playlist[prevIndex];
    setCurrentIndex(prevIndex);
    setCurrentVideo(prevVideo);
    setPlaying(true);
    loadRelated(prevVideo.id);
  };

  // ------------------------------------------------------------
  // SEEK RELATIVE
  // ------------------------------------------------------------
  const seekRelative = (seconds) => {
    try {
      const player = playerRef.current;
      if (player && player.seekTo) {
        player.seekTo(player.getCurrentTime() + seconds, true);
      }
    } catch {}
  };

  // ------------------------------------------------------------
  // AUTONEXT
  // ------------------------------------------------------------
  const handleEnded = () => {
    if (!autonext) {
      setPlaying(false);
      return;
    }
    playNext();
  };

  // ------------------------------------------------------------
  // ATTACH PLAYER REF
  // ------------------------------------------------------------
  const attachPlayerRef = (ref) => {
    playerRef.current = ref;
  };

  // ------------------------------------------------------------
  // CONTEXT VALUE
  // ------------------------------------------------------------
  const value = {
    currentVideo,
    playing,
    playlist,
    currentIndex,
    autonext,
    relatedVideos,
    playerMetrics,

    setPlaying,
    setPlaylist,
    setCurrentIndex,
    setAutonext,
    setRelatedVideos,
    setPlayerMetrics,

    playVideo,
    playNext,
    playPrev,
    seekRelative,
    handleEnded,
    attachPlayerRef,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
