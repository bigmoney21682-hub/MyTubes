import { useNavigate } from "react-router-dom";

export default function SearchResultCard({ video }) {
  const navigate = useNavigate();

  const id =
    typeof video.id === "string"
      ? video.id
      : video.id?.videoId || video.videoId;

  return (
    <div
      onClick={() => navigate(`/watch?v=${id}`)}
      style={{ display: "flex", gap: 12, cursor: "pointer" }}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        style={{
          width: 160,
          height: 90,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />

      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, color: "#fff" }}>{video.title}</h4>
        <p style={{ margin: 0, color: "#aaa" }}>{video.channelTitle}</p>
      </div>
    </div>
  );
}
