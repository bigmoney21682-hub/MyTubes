/**
 * File: VideoCard.jsx
 * Path: src/components/VideoCard.jsx
 * Description:
 *   Clickable video card that navigates to /watch/:id.
 *   Fully isolated from player lifecycle — never triggers
 *   a re-render of the Watch.jsx player container.
 */

window.bootDebug?.boot("VideoCard.jsx file loaded");

import { useNavigate } from "react-router-dom";
import { normalizeId } from "../utils/normalizeId.js"; // ← NEW

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  // Normalize ID using shared utility
  const id = normalizeId(video);

  const thumbnail =
    video?.thumbnail ||
    video?.thumbnails?.medium?.url ||
    "https://via.placeholder.com/160x90?text=No+Image";

  const title =
    video?.title ||
    video?.snippet?.title ||
    "Untitled video";

  const channel =
    video?.channel ||
    video?.snippet?.channelTitle ||
    "Unknown channel";

  const views =
    video?.views ||
    video?.statistics?.viewCount ||
    null;

  return (
    <div
      onClick={() => {
        const vidId = normalizeId(video);

        if (!vidId) {
          window.bootDebug?.warn("VideoCard → missing or invalid videocard video ID, navigation skipped");
          return;
        }

        window.bootDebug?.info("VideoCard → navigate to " + vidId);
        navigate(`/watch/${vidId}?src=trending`);
      }}
      style={{
        display: "flex",
        cursor: "pointer",
        marginBottom: "14px"
      }}
    >
      <img
        src={thumbnail}
        alt={title}
        style={{
          width: "160px",
          height: "90px",
          borderRadius: "6px",
          objectFit: "cover"
        }}
      />

      <div style={{ marginLeft: "10px", flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>
          {title}
        </div>

        <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
          {channel}
        </div>

        <div style={{ fontSize: "12px", opacity: 0.5 }}>
          {views ? Number(views).toLocaleString() + " views" : "— views"}
        </div>
      </div>
    </div>
  );
}
