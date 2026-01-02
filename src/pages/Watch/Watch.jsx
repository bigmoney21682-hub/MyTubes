/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description:
 *   Fully corrected Watch page with:
 *   - Safe ID normalization (fixes [object Object])
 *   - Correct autonext (playlist + related)
 *   - Correct GlobalPlayer mounting
 *   - Correct loadVideo flow
 *   - Correct playlist param handling
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { usePlayer } from "../../player/PlayerContext.jsx";
import { AutonextEngine } from "../../player/AutonextEngine.js";
import { GlobalPlayer } from "../../player/GlobalPlayer.js";

import { usePlaylists } from "../../contexts/PlaylistContext.jsx";
import { debugBus } from "../../debug/debugBus.js";

export default function Watch() {
  /* ------------------------------------------------------------
     1. Normalize route ID (fixes [object Object])
  ------------------------------------------------------------- */
  const params = useParams();

  debugBus.log("Watch.jsx → raw route param", params.id);
debugBus.log("Watch.jsx → typeof param", typeof params.id);

  const rawId = params.id;

  const id =
    typeof rawId === "string"
      ? rawId
      : rawId?.id || rawId?.videoId || "";

  const navigate = useNavigate();
  const location = useLocation();

  const { loadVideo, setAutonextMode, setActivePlaylistId } = usePlayer();
  const { playlists } = usePlaylists();

  const [videoData, setVideoData] = useState(null);
  const [related, setRelated] = useState([]);

  /* ------------------------------------------------------------
     2. Ensure GlobalPlayer mounts
  ------------------------------------------------------------- */
  useEffect(() => {
    debugBus.log("Watch.jsx → ensureMounted()");
    GlobalPlayer.ensureMounted();
  }, []);

  /* ------------------------------------------------------------
     3. Determine source (playlist or related)
  ------------------------------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const src = params.get("src");
    const pl = params.get("pl");

    if (src === "playlist" && pl) {
      setAutonextMode("playlist");
      setActivePlaylistId(pl);
      debugBus.log("Autonext mode → playlist");
    } else {
      setAutonextMode("related");
      setActivePlaylistId(null);
      debugBus.log("Autonext mode → related");
    }
  }, [location.search, setAutonextMode, setActivePlaylistId]);

  /* ------------------------------------------------------------
     4. Load the video into the player
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!id) {
      debugBus.error("Watch.jsx → Invalid route id", rawId);
      return;
    }

    debugBus.log("Watch.jsx → loadVideo(" + id + ")");
    loadVideo(id);
  }, [id, rawId, loadVideo]);

  /* ------------------------------------------------------------
     5. Fetch video details + related videos
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const videoRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=AIzaSyA-TNtGohJAO_hsZW6zp9FcSOdfGV7VJW0`
        );
        const videoJson = await videoRes.json();
        setVideoData(videoJson.items?.[0] || null);

        const relatedRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${id}&type=video&maxResults=20&videoEmbeddable=true&key=AIzaSyA-TNtGohJAO_hsZW6zp9FcSOdfGV7VJW0`
        );
        const relatedJson = await relatedRes.json();
        setRelated(relatedJson.items || []);
      } catch (err) {
        debugBus.error("Watch.jsx → fetch error: " + err.message);
      }
    }

    fetchData();
  }, [id]);

  /* ------------------------------------------------------------
     6. Autonext: Playlist (CORRECTED)
  ------------------------------------------------------------- */
  useEffect(() => {
    AutonextEngine.registerPlaylistCallback(() => {
      const params = new URLSearchParams(location.search);
      const activePlaylistId = params.get("pl");

      if (!activePlaylistId) {
        debugBus.log("AutonextEngine", "No active playlist — aborting");
        return;
      }

      const playlist = playlists.find((p) => p.id === activePlaylistId);
      if (!playlist) {
        debugBus.log("AutonextEngine", "Playlist not found — aborting");
        return;
      }

      if (!playlist.videos.length) {
        debugBus.log("AutonextEngine", "Playlist empty — aborting");
        return;
      }

      const index = playlist.videos.findIndex((v) => v.id === id);

      if (index === -1) {
        debugBus.log(
          "AutonextEngine",
          `Current video ${id} not in playlist — aborting autonext`
        );
        return;
      }

      const nextIndex = (index + 1) % playlist.videos.length;
      const nextVideo = playlist.videos[nextIndex];

      debugBus.log(
        "AutonextEngine",
        `Playlist autonext → index ${index} → ${nextIndex} → ${nextVideo.id}`
      );

      navigate(`/watch/${nextVideo.id}?src=playlist&pl=${activePlaylistId}`);
      loadVideo(nextVideo.id);
    });
  }, [navigate, loadVideo, playlists, id, location.search]);

  /* ------------------------------------------------------------
     7. Autonext: Related
  ------------------------------------------------------------- */
  useEffect(() => {
    AutonextEngine.registerRelatedCallback(() => {
      if (!related.length) {
        debugBus.log("AutonextEngine", "No related videos — aborting");
        return;
      }

      const next = related[0];
      const nextId = next?.id?.videoId;

      if (!nextId) {
        debugBus.log("AutonextEngine", "Invalid related video — aborting");
        return;
      }

      debugBus.log("AutonextEngine", `Related autonext → ${nextId}`);

      navigate(`/watch/${nextId}?src=related`);
      loadVideo(nextId);
    });
  }, [related, navigate, loadVideo]);

  /* ------------------------------------------------------------
     8. Render
  ------------------------------------------------------------- */
  return (
    <div style={{ padding: "16px", color: "#fff" }}>
      <div
        id="player"
        style={{
          width: "100%",
          height: "220px",
          background: "#000",
          marginBottom: "16px"
        }}
      />

      {videoData && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
            {videoData.snippet.title}
          </h2>
          <div style={{ opacity: 0.7, marginTop: "4px" }}>
            {videoData.snippet.channelTitle}
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: "10px" }}>Related Videos</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {related.map((item) => {
          const vid = item.id?.videoId;
          if (!vid) return null;

          return (
            <div
              key={vid}
              onClick={() => navigate(`/watch/${vid}?src=related`)}
              style={{
                display: "flex",
                gap: "12px",
                cursor: "pointer"
              }}
            >
              <img
                src={item.snippet.thumbnails.medium.url}
                alt=""
                style={{
                  width: "140px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px"
                }}
              />
              <div>
                <div style={{ fontWeight: "600" }}>{item.snippet.title}</div>
                <div style={{ opacity: 0.7, fontSize: "13px" }}>
                  {item.snippet.channelTitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
