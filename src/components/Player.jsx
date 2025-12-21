// File: src/components/Player.jsx
import { forwardRef, useEffect } from "react";
import ReactPlayer from "react-player";

const Player = forwardRef(({ embedUrl, playing, onEnded, pipMode, draggable, trackTitle }, ref) => {
  useEffect(() => {
    console.log("DEBUG: Player mounted", { embedUrl, playing, pipMode, trackTitle });
    return () => console.log("DEBUG: Player unmounted", { trackTitle });
  }, [embedUrl, trackTitle]);

  if (!embedUrl) {
    console.warn("DEBUG: Player: embedUrl is empty");
    return null;
  }

  try {
    return (
      <ReactPlayer
        ref={ref}
        url={embedUrl}
        width="100%"       // Force visible width
        height="300px"     // Force visible height for iOS mount
        playing={playing}
        onEnded={() => {
          console.log("DEBUG: Player ended", { trackTitle });
          if (typeof onEnded === "function") onEnded();
        }}
        controls={false}
        volume={1}
        muted={false}
        playsinline={true} // iOS background playback
        style={{ borderRadius: pipMode ? 8 : 0 }}
      />
    );
  } catch (e) {
    console.error("DEBUG: Player error:", e);
    return null;
  }
});

export default Player;
