/**
 * File: Channel.jsx
 * Path: src/pages/Channel.jsx
 * Description:
 *   Channel page with safe navigation using normalizeId().
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { usePlayer } from "../player/PlayerContext.jsx";
import { debugBus } from "../debug/debugBus.js";
import { getApiKey } from "../api/getApiKey.js";
import { normalizeId } from "../utils/normalizeId.js"; // ← NEW

const API_KEY = getApiKey();

export default function Channel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const player = usePlayer() ?? {};
  const loadVideo = player.loadVideo ?? (() => {});
  const queueAdd = player.queueAdd ?? (() => {});

  const [videos, setVideos] = useState([]);
  const [channelInfo, setChannelInfo] = useState(null);

  /* ------------------------------------------------------------
     Load channel info + videos
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!id) return;

    fetchChannelInfo(id);
    fetchChannelVideos(id);
  }, [id]);

  async function fetchChannelInfo(channelId) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,statistics&id=${channelId}&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      const items = Array.isArray(data?.items) ? data.items : [];
      setChannelInfo(items[0] ?? null);
    } catch (err) {
      debugBus.log(
        "PLAYER",
        "Channel.jsx → fetchChannelInfo error: " + (err?.message || err)
      );
      setChannelInfo(null);
    }
  }

  async function fetchChannelVideos(channelId) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&channelId=${channelId}&maxResults=25&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      setVideos(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      debugBus.log(
        "PLAYER",
        "Channel.jsx → fetchChannelVideos error: " + (err?.message || err)
      );
      setVideos([]);
    }
  }

  /* ------------------------------------------------------------
     Safe navigation using normalizeId()
  ------------------------------------------------------------ */
  function openVideo(raw) {
    const vidId = normalizeId(raw);

    if (!vidId) {
      debugBus.error("Channel.jsx → Invalid video ID:", raw);
      return;
    }

    navigate(`/watch/${vidId}?src=channel`);
    loadVideo(vidId);
  }

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */
  const sn = channelInfo?.snippet ?? {};
  const title = sn?.title ?? "Channel";

  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <h2>{title}</h2>

      {videos.map((item, i) => {
        const vidId = normalizeId(item);

        const sn = item?.snippet ?? {};
        const thumb = sn?.thumbnails?.medium?.url ?? "";

        if (!vidId) return null;

        return (
          <div
            key={vidId + "_" + i}
            style={{
              display: "flex",
              marginBottom: "16px",
              cursor: "pointer"
            }}
          >
            <img
              src={thumb}
              alt=""
              onClick={() => openVideo(item)}
              style={{
                width: "168px",
                height: "94px",
                objectFit: "cover",
                borderRadius: "4px",
                marginRight: "12px"
              }}
            />

            <div style={{ flex: 1 }}>
              <div
                onClick={() => openVideo(item)}
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  marginBottom: "4px"
                }}
              >
                {sn.title ?? "Untitled"}
              </div>

              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                {sn.channelTitle ?? "Unknown Channel"}
              </div>

              <button
                onClick={() => queueAdd(vidId)}
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
  );
}
