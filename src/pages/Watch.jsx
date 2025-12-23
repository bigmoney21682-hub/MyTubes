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

  // -----------------------------
  // Fetch main video metadata
  // -----------------------------
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

  // -----------------------------
  // Fetch related videos (DEEP DEBUG)
  // -----------------------------
  useEffect(() => {
    async function fetchRelated() {
      log(`DEBUG: Fetching related videos for id: ${videoId}`);

      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=5&key=${API_KEY}`;
      log(`DEBUG: RelatedVideos request URL: ${url}`);

      try {
        const res = await fetch(url);
        log(`DEBUG: RelatedVideos HTTP status: ${res.status}`);

        const raw = await res.text();
        log(`DEBUG: RelatedVideos raw response: ${raw}`);

        let data;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          log(`DEBUG: JSON parse error (related videos): ${err}`);
          return;
        }

        if (data.error) {
          log(`DEBUG: RelatedVideos API error: ${JSON.stringify(data.error)}`);
          return;
        }

        log(`DEBUG: RelatedVideos items count: ${data.items?.length || 0}`);
        setRelated(data.items || []);
      } catch (err) {
        log(`DEBUG: RelatedVideos fetch exception: ${err}`);
      }
    }

    fetchRelated();
  }, [videoId]);

  // -----------------------------
  // UI
  // -----------------------------
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
                key={v.id.videoId}
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
