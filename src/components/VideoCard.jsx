/**
 * File: VideoCard.jsx
 * Path: src/components/VideoCard.jsx
 * Description: Clickable video card that navigates to /watch/:id
 */
window.bootDebug?.boot("VideoCard.jsx file loaded");

import { useNavigate } from "react-router-dom";

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        window.bootDebug?.info("VideoCard → navigate to " + video.id);
        navigate(`/watch/${video.id}`);
      }}
      style={{
        display: "flex",
        cursor: "pointer",
        marginBottom: "14px"
      }}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        style={{
          width: "160px",
          height: "90px",
          borderRadius: "6px",
          objectFit: "cover"
        }}
      />

      <div style={{ marginLeft: "10px", flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>
          {video.title}
        </div>

        <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
          {video.channel}
        </div>

        <div style={{ fontSize: "12px", opacity: 0.5 }}>
          {(video.views ? Number(video.views).toLocaleString() : "—") + " views"}
        </div>
      </div>
    </div>
  );
}
