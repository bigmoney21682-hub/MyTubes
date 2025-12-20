// File: src/components/VideoCard.jsx
import { usePlayer } from "../contexts/PlayerContext.jsx";

export default function VideoCard({ video }) {
  const { playVideo } = usePlayer();

  const handleClick = () => {
    playVideo(video);
  };

  return (
    <div className="video-card" onClick={handleClick}>
      <img src={video.thumbnail} alt={video.title} loading="lazy" />
      <div className="video-info">
        <h4>{video.title}</h4>
        <p>{video.author}</p>
      </div>
    </div>
  );
}
