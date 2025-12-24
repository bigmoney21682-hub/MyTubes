// File: src/pages/Subscriptions.jsx
// PCC v3.0 — Local subscriptions + channel strip + merged feed + channel page support

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DebugOverlay from "../components/DebugOverlay";
import VideoCard from "../components/VideoCard";
import { getCached, setCached } from "../utils/youtubeCache";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState("ALL");
  const [videos, setVideos] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  const navigate = useNavigate();
  const log = (msg) => window.debugLog?.(`Subscriptions: ${msg}`);

  // Load subscriptions from localStorage
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("mytube_subscriptions") || "[]"
    );
    setSubs(stored);
    log(`Loaded ${stored.length} subscriptions`);

    if (stored.length === 0) {
      setVideos([]);
      setLoadingFeed(false);
    }
  }, []);

  // Normalize a search result item into your VideoCard shape
  const normalizeItem = (item) => {
    if (!item || !item.id?.videoId || !item.snippet) return null;

    const t = item.snippet.thumbnails;
    const thumbnail =
      t?.maxres?.url ||
      t?.high?.url ||
      t?.medium?.url ||
      t?.default?.url ||
      null;

    return {
      id: item.id.videoId,
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      thumbnail,
      duration: null,
      publishedAt: item.snippet.publishedAt,
    };
  };

  // Build the feed whenever subs or selectedChannelId changes
  useEffect(() => {
    async function buildFeed() {
      if (!subs.length) {
        setVideos([]);
        setLoadingFeed(false);
        return;
      }

      setLoadingFeed(true);

      const apiKey = window.YT_API_KEY;
      if (!apiKey) {
        log("Missing YT_API_KEY, cannot build subscriptions feed");
        setVideos([]);
        setLoadingFeed(false);
        return;
      }

      const activeSubs =
        selectedChannelId === "ALL"
          ? subs
          : subs.filter((s) => s.channelId === selectedChannelId);

      log(
        `Building feed for ${
          selectedChannelId === "ALL" ? "ALL" : "one"
        } channel(s), count=${activeSubs.length}`
      );

      const allVideos = [];

      for (const ch of activeSubs) {
        const cacheKey = `subs_feed_${ch.channelId}`;
        const cached = getCached(cacheKey);

        let items;

        if (cached) {
          log(`Using cached feed for channelId=${ch.channelId}`);
          items = cached;
        } else {
          try {
            const q = encodeURIComponent(ch.title);
            const url =
              "https://www.googleapis.com/youtube/v3/search" +
              `?part=snippet&type=video&maxResults=10&q=${q}&key=${apiKey}`;

            log(`Fetching subs feed for "${ch.title}" → ${url}`);

            const res = await fetch(url);
            const data = await res.json();

            if (!data.items || !Array.isArray(data.items)) {
              log(
                `No items returned for channel "${ch.title}", raw=${JSON.stringify(
                  data
                ).slice(0, 200)}`
              );
              items = [];
            } else {
              items = data.items;
              setCached(cacheKey, items);
            }
          } catch (err) {
            log(`Error fetching feed for channel "${ch.title}" → ${err}`);
            items = [];
          }
        }

        const normalized = items.map(normalizeItem).filter(Boolean);

        for (const v of normalized) {
          allVideos.push({
            ...v,
            _sourceChannelId: ch.channelId,
          });
        }
      }

      // Sort newest → oldest by publishedAt
      allVideos.sort((a, b) => {
        const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return tb - ta;
      });

      log(`Final merged feed size=${allVideos.length}`);

      setVideos(allVideos);
      setLoadingFeed(false);
    }

    buildFeed();
  }, [subs, selectedChannelId]);

  const renderChannelStrip = () => {
    if (!subs.length) return null;

    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "8px 4px 8px 0",
          marginBottom: 12,
        }}
      >
        {/* "All" pill */}
        <button
          onClick={() => setSelectedChannelId("ALL")}
          style={{
            flex: "0 0 auto",
            padding: "6px 12px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            background:
              selectedChannelId === "ALL" ? "#fff" : "rgba(255,255,255,0.08)",
            color: selectedChannelId === "ALL" ? "#000" : "#fff",
            fontWeight: 500,
          }}
        >
          All
        </button>

        {subs.map((ch) => {
          const selected = selectedChannelId === ch.channelId;
          return (
            <button
              key={ch.channelId}
              onClick={() => setSelectedChannelId(ch.channelId)}
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: selected
                  ? "#fff"
                  : "rgba(255,255,255,0.08)",
                color: selected ? "#000" : "#fff",
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/channel/${encodeURIComponent(ch.channelId)}`, {
                    state: {
                      channelTitle: ch.title,
                      channelThumb: ch.thumbnail,
                    },
                  });
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#333",
                  flexShrink: 0,
                }}
              >
                {ch.thumbnail && (
                  <img
                    src={ch.thumbnail}
                    alt={ch.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
              <span
                style={{
                  maxWidth: 120,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: 13,
                }}
              >
                {ch.title}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <DebugOverlay pageName="Subscriptions" sourceUsed="YOUTUBE_API+CACHE" />

      <div style={{ padding: 16, color: "#fff" }}>
        <h2 style={{ marginBottom: 8 }}>Subscriptions</h2>

        {subs.length === 0 && (
          <p style={{ opacity: 0.7 }}>
            You haven’t subscribed to any channels yet.
          </p>
        )}

        {renderChannelStrip()}

        {loadingFeed && subs.length > 0 && (
          <p style={{ opacity: 0.7 }}>Loading your subscription feed…</p>
        )}

        {!loadingFeed && videos.length === 0 && subs.length > 0 && (
          <p style={{ opacity: 0.7 }}>
            No recent videos found for your subscribed channels yet.
          </p>
        )}

        <div
          style={{
            marginTop: 8,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {videos.map((v) => (
            <VideoCard key={v.id + v._sourceChannelId} video={v} />
          ))}
        </div>
      </div>
    </>
  );
}
