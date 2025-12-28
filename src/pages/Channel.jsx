/**
 * File: Channel.jsx
 * Path: src/pages/Channel.jsx
 * Description: Channel page with safe destructuring, normalized IDs,
 *              channel details + channel videos, and PlayerContext wiring.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../player/PlayerContext.jsx";
import { debugBus } from "../debug/debugBus.js";

const API_KEY = import.meta.env.VITE_YT_API_KEY;

export default function Channel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadVideo, queueAdd } = usePlayer();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!id) return;

    fetchChannelDetails(id);
    fetchChannelVideos(id);
  }, [id]);

  // ------------------------------------------------------------
  // Fetch channel details
  // ------------------------------------------------------------
  async function fetchChannelDetails(channelId) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,statistics&id=${channelId}&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data.items) && data.items.length > 0) {
        setChannel(data.items[0]);
      } else {
        setChannel(null);
      }
    } catch (err) {
      debugBus.player("Channel.jsx → fetchChannelDetails error: " + err?.message);
    }
  }

  // ------------------------------------------------------------
  // Fetch channel videos
  // ------------------------------------------------------------
  async function fetchChannelVideos(channelId) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&channelId=${channelId}&maxResults=25&order=date&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      setVideos(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      debugBus.player("Channel.jsx → fetchChannelVideos error: " + err?.message);
    }
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (!channel) {
    return (
      <div style={{ padding: "16px", color: "#fff" }}>
        Loading channel…
      </div>
    );
  }

  const sn = channel?.snippet ?? {};
  const title = sn?.title ?? "Unknown Channel";
  const desc = sn?.description ?? "";
  const banner = sn?.thumbnails?.high?.url ?? "";

  return (
    <div style={{ paddingBottom: "80px", color: "#fff" }}>
      {/* Channel Header */}
      <div style={{ padding: "16px" }}>
        {banner && (
          <img
            src={banner}
            alt=""
            style={{
              width: "100%",
              maxHeight: "200px",
              objectFit: "cover",
              borderRadius: "6px",
              marginBottom: "16px"
            }}
          />
        )}

        <h2>{title}</h2>
        <p style={{ opacity: 0.8, whiteSpace: "pre-wrap" }}>{desc}</p>
      </div>

      {/* Channel Videos */}
      <div style={{ padding: "16px" }}>
        <h3>Videos</h3>

        {videos.map((item, i) => {
          const vid =
            item?.id?.videoId ??
            item?.id ??
            null;

          const vsn = item?.snippet ?? {};
          const thumb = vsn?.thumbnails?.medium?.url ?? "";

          if (!vid) return null;

          return (
            <div
              key={vid + "_" + i}
              style={{
                display: "flex",
                marginBottom: "16px",
                cursor: "pointer"
              }}
              onClick={() => {
                navigate(`/watch/${vid}`);
                loadVideo(vid);
              }}
            >
              <img
                src={thumb}
                alt=""
                style={{
                  width: "168px",
                  height: "94px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  marginRight: "12px"
                }}
              />

              <div>
                <div style={{ fontSize: "15px", fontWeight: "bold" }}>
                  {vsn.title ?? "Untitled"}
                </div>
                <div style={{ fontSize: "13px", opacity: 0.7 }}>
                  {vsn.channelTitle ?? title}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    queueAdd(vid);
                  }}
                  style={{
                    marginTop: "8px",
                    padding: "6px 10px",
                    background: "#222",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "4px"
                  }}
                >
                  + Queue
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
