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
import normalizeId from "../utils/normalizeId.js";

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

    window.bootDebug?.router(
      "Channel.jsx → useEffect load for channel id = " + JSON.stringify(id)
    );

    fetchChannelInfo(id);
    fetchChannelVideos(id);
  }, [id]);

  async function fetchChannelInfo(channelId) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,statistics&id=${channelId}&key=${API_KEY}`;

      window.bootDebug?.router(
        "Channel.jsx → fetchChannelInfo URL = " + url
      );

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

      window.bootDebug?.router(
        "Channel.jsx → fetchChannelVideos URL = " + url
      );

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
    try {
      window.bootDebug?.router(
        "Channel.jsx → openVideo raw = " + JSON.stringify(raw)
      );
    } catch (_) {}

    const vidId = normalizeId(raw);

    window.bootDebug?.router(
      "Channel.jsx → openVideo normalizeId(raw) = " + JSON.stringify(vidId)
    );

    if (!vidId) {
      // 🔥 Do NOT throw here. Just log and bail.
      debugBus.log("PLAYER", "Channel.jsx → Invalid video ID (skipping)", raw);
      window.bootDebug?.router(
        "Channel.jsx → INVALID video ID, skipping navigation."
      );
      return;
    }

    const url = `/watch/${vidId}?src=channel`;

    window.bootDebug?.router(
      "Channel.jsx → navigate(" + JSON.stringify(url) + ")"
    );

    navigate(url);
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

        try {
          window.bootDebug?.router(
            "Channel.jsx → map item normalizeId(item) = " +
              JSON.stringify(vidId) +
              ", item = " +
              JSON.stringify(item)
          );
        } catch (_) {}

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
