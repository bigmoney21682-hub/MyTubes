// File: src/components/RelatedVideos.jsx
// PCC v7.0 — Hardened YouTube API related feed + in-memory caching + autonext source

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCached, setCached } from "../utils/youtubeCache";

export default function RelatedVideos({
  videoId,
  title,
  onDebugLog,
  onLoaded,
}) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const log = (msg, category = "API") => {
    if (typeof onDebugLog === "function") {
      onDebugLog(msg);
    } else {
      window.debugLog?.(`RelatedVideos: ${msg}`, category);
    }
  };

  useEffect(() => {
    const cleanId = String(videoId || "").trim();
    const apiKey = window.YT_API_KEY;

    if (!cleanId) {
      log("aborted: empty videoId", "ERROR");
      return;
    }

    if (!apiKey) {
      log("aborted: missing YT_API_KEY", "ERROR");
      return;
    }

    let cancelled = false;

    async function load() {
      setError(null);
      setVideos([]);

      const cacheKey = `related_${cleanId}`;
      const cached = getCached(cacheKey);

      if (cached && Array.isArray(cached) && cached.length > 0) {
        log(`using cached related videos (${cached.length})`, "API");
        if (!cancelled) {
          setVideos(cached);
          try {
            onLoaded?.(cached);
          } catch (e) {
            log(`onLoaded handler threw: ${e}`, "ERROR");
          }
        }
        return;
      }

      // -----------------------------------------
      // 1. Try relatedToVideoId
      // -----------------------------------------
      try {
        const url =
          "https://www.googleapis.com/youtube/v3/search" +
          `?part=snippet&type=video&maxResults=10&relatedToVideoId=${encodeURIComponent(
            cleanId
          )}&key=${apiKey}`;

        log(`YouTube relatedToVideoId → ${url}`, "API");

        const res = await fetch(url);
        const data = await res.json().catch((e) => {
          throw new Error(`JSON parse error: ${e?.message || e}`);
        });

        if (cancelled) return;

        if (data.error) {
          log(
            `YouTube relatedToVideoId error: ${data.error.message || "unknown"}`,
            "ERROR"
          );
        }

        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          const mapped = data.items
            .filter((v) => v?.id?.videoId)
            .map((v) => ({
              id: v.id.videoId,
              title: v.snippet?.title || "Untitled",
              thumbnail:
                v.snippet?.thumbnails?.default?.url ||
                v.snippet?.thumbnails?.medium?.url ||
                v.snippet?.thumbnails?.high?.url ||
                "",
            }));

          if (mapped.length > 0) {
            log(`applied ${mapped.length} items from relatedToVideoId`, "API");
            setCached(cacheKey, mapped);
            if (!cancelled) {
              setVideos(mapped);
              try {
                onLoaded?.(mapped);
              } catch (e) {
                log(`onLoaded handler threw: ${e}`, "ERROR");
              }
            }
            return;
          }
        }
      } catch (err) {
        log(`YouTube relatedToVideoId failed → ${err}`, "ERROR");
      }
      // -----------------------------------------
      // 2. Fallback: keyword search by title
      // -----------------------------------------
      if (!title) {
        log("skipping title-based fallback (no title provided)", "UI");
        return;
      }

      try {
        const query = encodeURIComponent(title);
        const url =
          "https://www.googleapis.com/youtube/v3/search" +
          `?part=snippet&type=video&maxResults=10&q=${query}&key=${apiKey}`;

        log(`YouTube fallback by title → ${url}`, "API");

        const res = await fetch(url);
        const data = await res.json().catch((e) => {
          throw new Error(`JSON parse error: ${e?.message || e}`);
        });

        if (cancelled) return;

        if (data.error) {
          log(
            `YouTube title fallback error: ${data.error.message || "unknown"}`,
            "ERROR"
          );
        }

        if (data.items && Array.isArray(data.items)) {
          const mapped = data.items
            .filter((v) => v?.id?.videoId)
            .map((v) => ({
              id: v.id.videoId,
              title: v.snippet?.title || "Untitled",
              thumbnail:
                v.snippet?.thumbnails?.default?.url ||
                v.snippet?.thumbnails?.medium?.url ||
                v.snippet?.thumbnails?.high?.url ||
                "",
            }));

          log(
            `applied ${mapped.length} items from YouTube title fallback`,
            "API"
          );
          setCached(cacheKey, mapped);
          if (!cancelled) {
            setVideos(mapped);
            try {
              onLoaded?.(mapped);
            } catch (e) {
              log(`onLoaded handler threw: ${e}`, "ERROR");
            }
          }
        }
      } catch (err) {
        log(`YouTube fallback failed → ${err}`, "ERROR");
        if (!cancelled) {
          setError(err.message || "Unknown error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [videoId, title, onLoaded]);

  if (error)
    return (
      <p style={{ color: "red", padding: 8 }}>
        Error loading related videos: {error}
      </p>
    );

  if (!videos.length)
    return <p style={{ padding: 8 }}>Loading related…</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "12px",
        maxHeight: "300px",
        overflowY: "auto",
        borderTop: "1px solid #222",
      }}
    >
      {videos.map((v, index) => (
        <Link
          key={v.id || index}
          to={`/watch/${v.id}`}
          style={{ color: "#fff", textDecoration: "none" }}
          onClick={() => log(`clicked → ${v.title}`, "UI")}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {v.thumbnail ? (
              <img
                src={v.thumbnail}
                alt={v.title}
                width={80}
                height={45}
                style={{ borderRadius: 4, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 45,
                  borderRadius: 4,
                  background: "#333",
                }}
              />
            )}
            <span>{v.title}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
