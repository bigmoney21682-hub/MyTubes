// File: src/pages/Watch.jsx

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

export default function Watch() {
  const [params] = useSearchParams();
  const id = params.get("v");

  const navigate = useNavigate();
  const { loadVideo } = usePlayer();

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);

  async function fetchVideo() {
    setVideo(null);

    // PIPED
    try {
      const piped = await fetch(
        `https://pipedapi.kavin.rocks/streams/${id}`
      );
      if (piped.ok) {
        const data = await piped.json();
        window.debugApi("/piped/streams", "PIPED");

        setVideo({
          id,
          title: data.title,
          channel: data.uploader,
          thumbnail: data.thumbnailUrl,
          url: data.hls || data.videoStreams?.[0]?.url,
        });

        loadVideo({
          id,
          title: data.title,
          channelTitle: data.uploader,
          thumbnail: data.thumbnailUrl,
          url: data.hls || data.videoStreams?.[0]?.url,
        });

        return;
      }
    } catch {}

    // INVIDIOUS
    try {
      const inv = await fetch(`https://yewtu.be/api/v1/videos/${id}`);
      if (inv.ok) {
        const data = await inv.json();
        window.debugApi("/invidious/video", "INVIDIOUS");

        setVideo({
          id,
          title: data.title,
          channel: data.author,
          thumbnail: data.videoThumbnails?.[0]?.url,
          url: data.formatStreams?.[0]?.url,
        });

        loadVideo({
          id,
          title: data.title,
          channelTitle: data.author,
          thumbnail: data.videoThumbnails?.[0]?.url,
          url: data.formatStreams?.[0]?.url,
        });

        return;
      }
    } catch {}

    // YOUTUBE DATA API
    try {
      const key = import.meta.env.VITE_YT_API_PRIMARY;
      const yt = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${key}`
      );
      const data = await yt.json();
      window.debugApi("/youtube/video", key);

      const v = data.items[0];

      setVideo({
        id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        thumbnail: v.snippet.thumbnails.medium.url,
        url: null, // YouTube API does NOT provide playable URL
      });

      loadVideo({
        id,
        title: v.snippet.title,
        channelTitle: v.snippet.channelTitle,
        thumbnail: v.snippet.thumbnails.medium.url,
        url: null,
      });
    } catch {}
  }

  async function fetchRelated() {
    try {
      const piped = await fetch(
        `https://pipedapi.kavin.rocks/related/${id}`
      );
      if (piped.ok) {
        const data = await piped.json();
        window.debugApi("/piped/related", "PIPED");

        setRelated(
          data.relatedStreams.map((v) => ({
            id: v.url.split("v=")[1],
            title: v.title,
            channel: v.uploaderName,
            thumbnail: v.thumbnail,
          }))
        );
        return;
      }
    } catch {}

    try {
      const inv = await fetch(
        `https://yewtu.be/api/v1/videos/${id}`
      );
      if (inv.ok) {
        const data = await inv.json();
        window.debugApi("/invidious/related", "INVIDIOUS");

        setRelated(
          data.recommendedVideos.map((v) => ({
            id: v.videoId,
            title: v.title,
            channel: v.author,
            thumbnail: v.videoThumbnails?.[0]?.url,
          }))
        );
        return;
      }
    } catch {}

    try {
      const key = import.meta.env.VITE_YT_API_PRIMARY;
      const yt = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${id}&type=video&maxResults=25&key=${key}`
      );
      const data = await yt.json();
      window.debugApi("/youtube/related", key);

      setRelated(
        data.items.map((v) => ({
          id: v.id.videoId,
          title: v.snippet.title,
          channel: v.snippet.channelTitle,
          thumbnail: v.snippet.thumbnails.medium.url,
        }))
      );
    } catch {}
  }

  useEffect(() => {
    if (!id) return;
    fetchVideo();
    fetchRelated();
  }, [id]);

  if (!id) return <div style={{ color: "#fff" }}>Invalid video</div>;

  return (
    <div style={{ paddingTop: 68, paddingBottom: 68 }}>
      {!video && (
        <div style={{ color: "#fff", padding: 16 }}>Loading…</div>
      )}

      {video && (
        <div style={{ padding: 12 }}>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
            {video.title}
          </div>
          <div style={{ color: "#aaa", marginTop: 4 }}>
            {video.channel}
          </div>
        </div>
      )}

      <div style={{ padding: 12, color: "#fff", fontSize: 18 }}>
        Related
      </div>

      {related.map((v) => (
        <div
          key={v.id}
          onClick={() => navigate(`/watch?v=${v.id}`)}
          style={{
            display: "flex",
            marginBottom: 12,
            cursor: "pointer",
          }}
        >
          <img
            src={v.thumbnail}
            style={{
              width: 160,
              height: 90,
              borderRadius: 8,
              objectFit: "cover",
              marginRight: 12,
            }}
            alt=""
          />

          <div style={{ flexGrow: 1 }}>
            <div
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {v.title}
            </div>
            <div style={{ color: "#aaa", fontSize: 13 }}>
              {v.channel}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
