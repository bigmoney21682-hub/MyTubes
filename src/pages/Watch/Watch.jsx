/**
 * File: Watch.jsx
 * Path: src/pages/Watch/Watch.jsx
 * Description: Video watch page with ReactPlayer, metadata loading,
 *              quota tracking, and DebugOverlay logging.
 */

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { getVideoDetails } from "../../api/youtube";

export default function Watch() {
  const { id } = useParams();
  const [videoUrl, setVideoUrl] = useState("");
  const [details, setDetails] = useState(null);

  /* -------------------------------------------------------
     MOUNT LOG
  ------------------------------------------------------- */
  useEffect(() => {
    window.bootDebug?.watch("Watch.jsx mounted with id:", id);
  }, [id]);

  /* -------------------------------------------------------
     BUILD VIDEO URL
  ------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    const url = `https://www.youtube.com/watch?v=${id}`;
    setVideoUrl(url);

    window.bootDebug?.player("Watch.jsx → video URL set:", url);
  }, [id]);

  /* -------------------------------------------------------
     FETCH METADATA
  ------------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    window.bootDebug?.api("Watch.jsx → Fetching video details…");

    getVideoDetails(id).then((info) => {
      setDetails(info);
      window.bootDebug?.api("Watch.jsx → Metadata loaded:", info);
    });
  }, [id]);

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "40px"
      }}
    >
      {/* Player */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          aspectRatio: "16 / 9",
          background: "#000",
          overflow: "hidden",
          position: "relative",
          marginTop: "20px"
        }}
      >
        <ReactPlayer
          url={videoUrl}
          playing={true}
          controls={true}
          width="100%"
          height="100%"
          onPlay={() => window.bootDebug?.player("ReactPlayer → play")}
          onPause={() => window.bootDebug?.player("ReactPlayer → pause")}
          onEnded={() => window.bootDebug?.player("ReactPlayer → ended")}
          onError={(e) => window.bootDebug?.error("ReactPlayer error:", e)}
        />
      </div>

      {/* Metadata */}
      {details && (
        <div style={{ width: "100%", maxWidth: "900px", marginTop: "20px" }}>
          <h2 style={{ margin: 0 }}>{details.title}</h2>

          <div style={{ opacity: 0.7, marginTop: 4 }}>
            {details.channel} • {Number(details.views).toLocaleString()} views
          </div>

          <p style={{ marginTop: "16px", lineHeight: 1.5, opacity: 0.9 }}>
            {details.description}
          </p>
        </div>
      )}
    </div>
  );
}
