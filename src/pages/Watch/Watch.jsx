/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 */

import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

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

  const player = usePlayer() ?? {};
  const loadVideo = player.loadVideo ?? (() => {});
  const queueAdd = player.queueAdd ?? (() => {});
  const autonextMode = player.autonextMode ?? "related";
  const setAutonextMode = player.setAutonextMode ?? (() => {});

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

  useLayoutEffect(() => {
    GlobalPlayer.ensureMounted();
  }, []);

  useEffect(() => {
    if (!id) return;

    const wait = setInterval(() => {
      if (GlobalPlayer.mounted) {
        clearInterval(wait);

        debugBus.log("PLAYER", `Watch.jsx → loadVideo(${id})`);
        loadVideo(id);

        loadVideoDetails(id);
        loadRelated(id);
      }
    }, 50);

    return () => clearInterval(wait);
  }, [id, loadVideo]);

  // ⭐ Register Autonext callback ONCE (no re-stacking)
  useEffect(() => {
    AutonextEngine.registerRelatedCallback(() => {
      const list = relatedRef.current;
      if (!Array.isArray(list) || list.length === 0) return;

      const next = list[0]?.id;
      if (!next) return;

      navigate(`/watch/${next}`);
      loadVideo(next);
    });
  }, [navigate, loadVideo]); // logic stable, callback registered once per mount

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
      {/* Fixed player at top */}
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

      {/* Main actions under player */}
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
              <Link to={`/watch/${vid}`} style={cardStyle}>
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

              {/* ⭐ Add to Queue + Playlist for related */}
              <VideoActions videoId={vid} videoSnippet={rsn} />
            </div>
          );
        })}
      </div>

      {/* Playlist picker modal for main video */}
      {showPicker && (
        <PlaylistPickerModal
          playlists={playlists}
          onSelect={(playlist) => {
            const sn = video?.snippet ?? {};

            addVideoToPlaylist(playlist.id, {
              id,
              title: sn.title ?? "Untitled",
              author: sn.channelTitle ?? "Unknown Channel",
              thumbnail: sn.thumbnails?.medium?.url ?? ""
            });

            setShowPicker(false);
            alert(`Added to playlist: ${playlist.name}`);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
