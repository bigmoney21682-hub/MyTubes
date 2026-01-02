/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description: Watch page with fixed global player, description,
 *              autonext (related + playlist), and related videos
 *              with Add to Queue + Playlist actions.
 */

import React, {
  useEffect,
  useState,
  useRef
} from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams
} from "react-router-dom";

import { usePlayer } from "../../player/PlayerContext.jsx";
import { AutonextEngine } from "../../player/AutonextEngine.js";
import { GlobalPlayer } from "../../player/GlobalPlayer.js";
import { debugBus } from "../../debug/debugBus.js";

import { updateMediaSessionMetadata } from "../../main.jsx";
import { getVideoDetails } from "../../api/video.js";
import { fetchRelatedVideos } from "../../api/related.js";
import { usePlaylists } from "../../contexts/PlaylistContext.jsx";

import PlaylistPickerModal from "../../components/PlaylistPickerModal.jsx";
import VideoActions from "../../components/VideoActions.jsx";

/* ------------------------------------------------------------
   Shared card styles for related
------------------------------------------------------------- */
const cardStyle = {
  width: "100%",
  marginBottom: "16px",
  textDecoration: "none",
  color: "#fff",
  display: "block"
};

const thumbStyle = {
  width: "100%",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  borderRadius: "8px",
  marginBottom: "8px"
};

const titleStyle = {
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "4px"
};

const channelStyle = {
  fontSize: "12px",
  opacity: 0.7,
  marginBottom: "4px"
};

const descStyle = {
  fontSize: "12px",
  opacity: 0.8,
  lineHeight: 1.4
};

/* ------------------------------------------------------------
   Component
------------------------------------------------------------- */
export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const src = params.get("src");          // "playlist" or "related"
  const playlistIdFromNav = params.get("pl");

  const player = usePlayer() ?? {};
  const loadVideo = player.loadVideo ?? (() => {});
  const queueAdd = player.queueAdd ?? (() => {});
  const autonextMode = player.autonextMode ?? "related";
  const setAutonextMode = player.setAutonextMode ?? (() => {});
  const activePlaylistId = player.activePlaylistId;
  const setActivePlaylistId = player.setActivePlaylistId;

  const { playlists, addVideoToPlaylist } = usePlaylists() ?? {
    playlists: [],
    addVideoToPlaylist: () => {}
  };

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const relatedRef = useRef([]);
  useEffect(() => {
    relatedRef.current = related;
  }, [related]);

  /* ------------------------------------------------------------
     ⭐ FIXED: Force autonext mode ONLY after src is available
  ------------------------------------------------------------- */
  useEffect(() => {
    if (src === null) return; // Prevent premature "related" mode

    if (src === "playlist") {
      setAutonextMode("playlist");
      AutonextEngine.setMode("playlist");

      if (playlistIdFromNav) {
        setActivePlaylistId(playlistIdFromNav);
      }
    } else {
      setAutonextMode("related");
      AutonextEngine.setMode("related");
    }
  }, [src, playlistIdFromNav]);

  /* ------------------------------------------------------------
     Load video + related (single stable load)
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    debugBus.log("PLAYER", `Watch.jsx → loadVideo(${id})`);
    loadVideo(id);

    loadVideoDetails(id);
    loadRelated(id);
  }, [id, loadVideo]);

  /* ------------------------------------------------------------
     Autonext: Related mode
  ------------------------------------------------------------- */
  useEffect(() => {
    AutonextEngine.registerRelatedCallback(() => {
      const list = relatedRef.current;
      if (!Array.isArray(list) || list.length === 0) return;

      const next = list[0]?.id;
      if (!next) return;

      navigate(`/watch/${next}?src=related`);
      loadVideo(next);
    });
  }, [navigate, loadVideo]);

  /* ------------------------------------------------------------
     Autonext: Playlist mode (loop forever)
  ------------------------------------------------------------- */
  useEffect(() => {
    AutonextEngine.registerPlaylistCallback(() => {
      if (!activePlaylistId) return;

      const playlist = playlists.find((p) => p.id === activePlaylistId);
      if (!playlist || !playlist.videos.length) return;

      const index = playlist.videos.findIndex((v) => v.id === id);
      const nextIndex = (index + 1) % playlist.videos.length;
      const nextVideo = playlist.videos[nextIndex];

      if (!nextVideo) return;

      navigate(
        `/watch/${nextVideo.id}?src=playlist&pl=${activePlaylistId}`
      );
      loadVideo(nextVideo.id);
    });
  }, [navigate, loadVideo, playlists, activePlaylistId, id]);

  /* ------------------------------------------------------------
     Load video details
  ------------------------------------------------------------- */
  async function loadVideoDetails(videoId) {
    try {
      const details = await getVideoDetails(videoId);

      if (!details) {
        setVideo(null);
        return;
      }

      setVideo({
        snippet: {
          title: details.title,
          description: details.description,
          channelId: details.channelId,
          channelTitle: details.channelTitle,
          publishedAt: details.publishedAt,
          thumbnails: details.thumbnails
        },
        statistics: details.statistics
      });
    } catch {
      setVideo(null);
    }
  }

  /* ------------------------------------------------------------
     Load related videos
  ------------------------------------------------------------- */
  async function loadRelated(videoId) {
    try {
      const list = await fetchRelatedVideos(videoId);

      if (!Array.isArray(list)) {
        setRelated([]);
        return;
      }

      const normalized = list.map((item) => ({
        id: item.id,
        snippet: {
          title: item.title,
          channelTitle: item.author,
          description: "",
          thumbnails: {
            medium: { url: item.thumbnail }
          }
        }
      }));

      setRelated(normalized);
    } catch {
      setRelated([]);
    }
  }

  /* ------------------------------------------------------------
     Media Session metadata
  ------------------------------------------------------------- */
  useEffect(() => {
    if (video && id) {
      const sn = video?.snippet ?? {};
      updateMediaSessionMetadata({
        title: sn.title ?? "Untitled",
        artist: sn.channelTitle ?? "Unknown Channel",
        artwork: sn.thumbnails?.medium?.url ?? ""
      });
    }
  }, [video, id]);

  /* ------------------------------------------------------------
     Add to playlist (main video)
  ------------------------------------------------------------- */
  function handleAddToPlaylist() {
    if (!id) return;

    if (!playlists || playlists.length === 0) {
      alert("You have no playlists yet. Create one first.");
      return;
    }

    setShowPicker(true);
  }

  const sn = video?.snippet ?? {};
  const title = sn?.title ?? (video ? "Untitled" : "Loading video…");
  const description = sn?.description ?? "";

  return (
    <div
      style={{
        paddingBottom: "80px",
        color: "#fff",
        marginTop: "calc(56.25vw + var(--header-height))"
      }}
    >
      {/* Fixed player */}
      <div
        style={{
          position: "fixed",
          top: "var(--header-height)",
          left: 0,
          width: "100%",
          height: "56.25vw",
          background: "#000",
          zIndex: 10
        }}
      >
        <div
          id="player"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
          }}
        ></div>
      </div>

      {/* Title */}
      <h2 style={{ padding: "16px" }}>{title}</h2>

      {/* Description */}
      <div style={{ padding: "0 16px 16px" }}>
        <div
          style={{
            opacity: 0.85,
            lineHeight: 1.4,
            maxHeight: descExpanded ? "none" : "3.6em",
            overflow: "hidden",
            transition: "max-height 0.2s ease"
          }}
        >
          {description}
        </div>

        <button
          onClick={() => setDescExpanded(!descExpanded)}
          style={{
            marginTop: "6px",
            background: "none",
            border: "none",
            color: "#3ea6ff",
            fontSize: "14px",
            cursor: "pointer",
            padding: 0
          }}
        >
          {descExpanded ? "Show less" : "Show more"}
        </button>
      </div>

      {/* Main actions */}
      <div style={{ padding: "16px", display: "flex", gap: "8px" }}>
        <button
          onClick={() => queueAdd(id)}
          style={{
            padding: "10px 16px",
            background: "#222",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: "4px"
          }}
        >
          + Add to Queue
        </button>

        <button
          onClick={handleAddToPlaylist}
          style={{
            padding: "10px 16px",
            background: "#222",
            color: "#3ea6ff",
            border: "1px solid #444",
            borderRadius: "4px"
          }}
        >
          + Playlist
        </button>
      </div>

      {/* Autonext Mode Toggle */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ fontSize: "14px", marginBottom: "6px" }}>
          Autonext Mode:
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              setAutonextMode("related");
              AutonextEngine.setMode("related");
            }}
            style={{
              padding: "8px 12px",
              background: autonextMode === "related" ? "#3ea6ff" : "#222",
              color: autonextMode === "related" ? "#000" : "#fff",
              border: "1px solid #444",
              borderRadius: "4px",
              fontSize: "13px"
            }}
          >
            Related
          </button>

          <button
            onClick={() => {
              setAutonextMode("playlist");
              AutonextEngine.setMode("playlist");

              if (!activePlaylistId) {
                setShowPicker(true);
              }
            }}
            style={{
              padding: "8px 12px",
              background: autonextMode === "playlist" ? "#3ea6ff" : "#222",
              color: autonextMode === "playlist" ? "#000" : "#fff",
              border: "1px solid #444",
              borderRadius: "4px",
              fontSize: "13px"
            }}
          >
            Playlist
          </button>
        </div>
      </div>

      {/* Related videos */}
      <div style={{ padding: "16px" }}>
        <h3 style={{ marginBottom: "12px" }}>Related Videos</h3>

        {related.map((item, i) => {
          const vid = item?.id ?? null;
          const rsn = item?.snippet ?? {};
          const thumb = rsn?.thumbnails?.medium?.url ?? "";

          if (!vid) return null;

          return (
            <div key={vid + "_" + i} style={{ marginBottom: "20px" }}>
              <Link to={`/watch/${vid}?src=related`} style={cardStyle}>
                <img
                  src={thumb}
                  alt={rsn.title ?? "Video thumbnail"}
                  style={thumbStyle}
                />

                <div style={titleStyle}>{rsn.title ?? "Untitled"}</div>
                <div style={channelStyle}>
                  {rsn.channelTitle ?? "Unknown Channel"}
                </div>
                <div style={descStyle}>{rsn.description ?? ""}</div>
              </Link>

              <VideoActions videoId={vid} videoSnippet={rsn} />
            </div>
          );
        })}
      </div>

      {/* Playlist picker modal */}
      {showPicker && (
        <PlaylistPickerModal
          playlists={playlists}
          onSelect={(playlist) => {
            setActivePlaylistId(playlist.id);

            const sn = video?.snippet ?? {};

            addVideoToPlaylist(playlist.id, {
              id,
              title: sn.title ?? "Untitled",
              author: sn.channelTitle ?? "Unknown Channel",
              thumbnail: sn.thumbnails?.medium?.url ?? ""
            });

            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
