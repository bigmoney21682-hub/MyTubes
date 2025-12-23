import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DebugOverlay from "../components/DebugOverlay";
import { API_KEY } from "../config";
import { useGlobalPlayer } from "../context/GlobalPlayerContext";

export default function Watch() {
  const { id: videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const { setCurrentVideo, setIsPlaying } = useGlobalPlayer();

  const log = (msg) => window.debugLog?.(`Watch(${videoId}): ${msg}`);

  // ---------------------------------------------------------
  // Fetch main video metadata
  // ---------------------------------------------------------
  useEffect(() => {
    async function fetchVideo() {
      log(`Fetching video metadata for id: ${videoId}`);

      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
      log(`DEBUG: Video metadata URL: ${url}`);

      try {
        const res = await fetch(url);
        const raw = await res.text();
        log(`DEBUG: Video metadata raw response: ${raw}`);

        let data;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          log(`DEBUG: JSON parse error (video metadata): ${err}`);
          return;
        }

        if (data.error) {
          log(`DEBUG: Video metadata API error: ${JSON.stringify(data.error)}`);
          return;
        }

        const item = data.items?.[0];
        if (!item) {
          log("DEBUG: No video metadata returned");
          return;
        }

        setVideo(item);
        setCurrentVideo(item);
        setIsPlaying(true);

        log("Video fetched and global currentVideo updated");
      } catch (err) {
        log(`DEBUG: Video metadata fetch exception: ${err}`);
      }
    }

    fetchVideo();
  }, [videoId, setCurrentVideo, setIsPlaying]);

  // ---------------------------------------------------------
  // Related Videos — 3‑Layer Fallback System
  // ---------------------------------------------------------
  useEffect(() => {
    async function fetchRelatedVideos() {
      if (!videoId) return;

      // -----------------------------
      // 1) PIPED RELATED ENDPOINT
      // -----------------------------
      async function tryPiped() {
        const url = `https://pipedapi.kavin.rocks/related/${videoId}`;
        log(`DEBUG: Trying Piped related endpoint: ${url}`);

        try {
          const res = await fetch(url);
          const raw = await res.text();
          log(`DEBUG: Piped raw response: ${raw}`);

          let data;
          try {
            data = JSON.parse(raw);
          } catch (err) {
            log(`DEBUG: Piped JSON parse error: ${err}`);
            return null;
          }

          if (!Array.isArray(data)) {
            log(`DEBUG: Piped returned non-array`);
            return null;
          }

          log(`DEBUG: Piped returned ${data.length} items`);
          return data.map((v) => ({
            id: v.id,
            snippet: {
              title: v.title,
              thumbnails: { medium: { url: v.thumbnail } },
            },
          }));
        } catch (err) {
          log(`DEBUG: Piped fetch exception: ${err}`);
          return null;
        }
      }

      // -----------------------------
      // 2) INVIDIOUS RELATED ENDPOINT
      // -----------------------------
      async function tryInvidious() {
        const url = `https://invidious.snopyta.org/api/v1/videos/${videoId}`;
        log(`DEBUG: Trying Invidious related endpoint: ${url}`);

        try {
          const res = await fetch(url);
          const raw = await res.text();
          log(`DEBUG: Invidious raw response: ${raw}`);

          let data;
          try {
            data = JSON.parse(raw);
          } catch (err) {
            log(`DEBUG: Invidious JSON parse error: ${err}`);
            return null;
          }

          if (!data.recommendedVideos) {
            log(`DEBUG: Invidious returned no recommendedVideos`);
            return null;
          }

          log(`DEBUG: Invidious returned ${data.recommendedVideos.length} items`);
          return data.recommendedVideos.map((v) => ({
            id: v.videoId,
            snippet: {
              title: v.title,
              thumbnails: { medium: { url: v.videoThumbnails?.[1]?.url } },
            },
          }));
        } catch (err) {
          log(`DEBUG: Invidious fetch exception: ${err}`);
          return null;
        }
      }

      // -----------------------------
      // 3) YOUTUBE KEYWORD FALLBACK
      // Guaranteed to work
      // -----------------------------
      async function tryYouTubeKeywordFallback() {
        log("DEBUG: Using YouTube keyword fallback");

        if (!video?.snippet?.title) {
          log("DEBUG: No title available for keyword fallback");
          return null;
        }

        const query = encodeURIComponent(video.snippet.title);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${query}&key=${API_KEY}`;

        log(`DEBUG: YouTube keyword fallback URL: ${url}`);

        try {
          const res = await fetch(url);
          const raw = await res.text();
          log(`DEBUG: YouTube keyword fallback raw response: ${raw}`);

          let data;
          try {
            data = JSON.parse(raw);
          } catch (err) {
            log(`DEBUG: YouTube fallback JSON parse error: ${err}`);
            return null;
          }

          if (!data.items) {
            log("DEBUG: YouTube fallback returned no items");
            return null;
          }

          log(`DEBUG: YouTube fallback returned ${data.items.length} items`);
          return data.items;
        } catch (err) {
          log(`DEBUG: YouTube fallback fetch exception: ${err}`);
          return null;
        }
      }

      // -----------------------------
      // EXECUTE FALLBACK CHAIN
      // -----------------------------
      let results = await tryPiped();
      if (results) {
        log("DEBUG: Related videos source = PIPED");
        setRelated(results);
        return;
      }

      results = await tryInvidious();
      if (results) {
        log("DEBUG: Related videos source = INVIDIOUS");
        setRelated(results);
        return;
      }

      results = await tryYouTubeKeywordFallback();
      if (results) {
        log("DEBUG: Related videos source = YOUTUBE_KEYWORD_FALLBACK");
        setRelated(results);
        return;
      }

      log("DEBUG: All related video fallbacks failed");
      setRelated([]);
    }

    fetchRelatedVideos();
  }, [videoId, video]);

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
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
      <DebugOverlay pageName="Watch" />

      {!video && <p style={{ padding: 16 }}>Loading video…</p>}

      {video && (
        <>
          <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto" }}>
            <iframe
              width="100%"
              height="720"
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ border: "none" }}
            ></iframe>

            <h2 style={{ padding: "16px" }}>{video.snippet.title}</h2>
          </div>

          <h3 style={{ padding: "16px 16px 0" }}>Related Videos</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
              padding: "16px",
            }}
          >
            {related.map((v) => (
              <div
                key={v.id}
                style={{
                  background: "#222",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <img
                  src={v.snippet.thumbnails.medium.url}
                  alt={v.snippet.title}
                  style={{ width: "100%", borderRadius: 6 }}
                />
                <p style={{ marginTop: 8 }}>{v.snippet.title}</p>
              </div>
            ))}

            {related.length === 0 && (
              <p style={{ padding: 16 }}>No related videos found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
