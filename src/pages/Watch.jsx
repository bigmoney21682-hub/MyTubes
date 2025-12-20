import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RelatedVideos from "../components/RelatedVideos";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Player from "../components/Player";
import { API_KEY } from "../config";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pipVisible, setPipVisible] = useState(true);
  const playerRef = useRef(null);
  const touchStartRef = useRef(null);

  // Load video metadata
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`
        );
        const data = await res.json();
        if (data.items?.length > 0) setVideo(data.items[0]);
        else setVideo(null);
      } catch (err) {
        console.error("Video fetch error:", err);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Setup playlist
  useEffect(() => {
    if (video) {
      setPlaylist([video]); // replace with multi-track playlist as needed
      setCurrentIndex(0);
    }
  }, [video]);

  // Handle swipe from top-right to toggle mini-player
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (touch.clientX > window.innerWidth - 50 && touch.clientY < 50) {
      touchStartRef.current = touch.clientY;
    } else {
      touchStartRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    if (touch.clientY - touchStartRef.current > 50) {
      setPipVisible((v) => !v);
      touchStartRef.current = null;
    }
  };

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log("Playlist ended");
    }
  };

  if (loading)
    return (
      <div
        style={{
          paddingTop: "var(--header-height)",
          paddingBottom: "var(--footer-height)",
          minHeight: "100vh",
          background: "var(--app-bg)",
          color: "#fff",
        }}
      >
        <Header />
        <Spinner message="Loading video…" />
        <Footer />
      </div>
    );

  if (!video)
    return (
      <div
        style={{
          paddingTop: "var(--header-height)",
          paddingBottom: "var(--footer-height)",
          minHeight: "100vh",
          background: "var(--app-bg)",
          color: "#fff",
        }}
      >
        <Header />
        <div style={{ padding: 16 }}>
          <p>Video not found or unavailable.</p>
        </div>
        <Footer />
      </div>
    );

  const { snippet } = playlist[currentIndex];
  const embedUrl = `https://www.youtube.com/embed/${playlist[currentIndex].id}?autoplay=1&controls=1`;

  return (
    <div
      style={{
        paddingTop: "var(--header-height)",
        paddingBottom: "var(--footer-height)",
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "#fff",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <Header />

      <h2>{snippet.title}</h2>
      <p style={{ opacity: 0.7 }}>by {snippet.channelTitle}</p>

      {pipVisible && (
        <Player
          ref={playerRef}
          embedUrl={embedUrl}
          playing={true}
          onEnded={handleEnded}
          pipMode={true}
          draggable={true}
          trackTitle={snippet.title}
        />
      )}

      {playlist[currentIndex].id && (
        <RelatedVideos videoId={playlist[currentIndex].id} apiKey={API_KEY} />
      )}

      <Footer />
    </div>
  )
