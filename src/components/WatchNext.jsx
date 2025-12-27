/**
 * File: WatchNext.jsx
 * Path: src/components/WatchNext.jsx
 * Description: Right-side "Up Next" list of videos.
 */

import VideoCard from "./VideoCard";

export default function WatchNext({ videos }) {
  return (
    <div style={{ width: "100%", marginTop: "20px" }}>
      <h3 style={{ marginBottom: "12px" }}>Up Next</h3>

      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}
