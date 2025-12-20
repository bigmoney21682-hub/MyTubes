// File: src/pages/Watch.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RelatedVideos from "../components/RelatedVideos";
import { YOUTUBE_API_KEY } from "../config";
import Spinner from "../components/Spinner";

export default function Watch() {
  const { id } = useParams();

  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchVideoInfo = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${YOUTUBE_API_KEY}`
        );
        const data = await res.json();

        if (!data.items || !data.items.length) {
          setError("Video not found or not accessible");
          setVideoInfo(null);
          return;
        }

        setVideoInfo(data.items[0]);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoInfo();
  }, [id]);

  if (loading) return <Spinner message="Loading video…" />;
  if (error)
    return (
      <div style={{ padding: "2rem", color: "#fff" }}>
        <h3>Playback error</h3>
        <p style={{ opacity: 0.8 }}>{error}</p>
      </div>
    );

  const snippet = videoInfo.snippet;

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ color: "#fff", marginBottom: "1rem" }}>
        {snippet.title}
      </h2>

      <iframe
        width="100%"
        height="480"
        src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
        title={snippet.title}
        allow="autoplay; encrypted-media"
        frameBorder="0"
        allowFullScreen
      />

      <p style={{ marginTop: "0.5rem", opacity: 0.6 }}>
        Uploaded by: {snippet.channelTitle}
      </p>

      <RelatedVideos videoId={id} apiKey={YOUTUBE_API_KEY} />
    </div>
  );
}
