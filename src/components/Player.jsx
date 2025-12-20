// File: src/components/Player.jsx
import { forwardRef } from "react";
import ReactPlayer from "react-player";

const Player = forwardRef(({ src, playing, onEnded }, ref) => {
  return (
    <ReactPlayer
      ref={ref}
      url={src}
      width="0px"
      height="0px"
      playing={playing}
      onEnded={onEnded}
      controls={false}
      volume={1}
      muted={false}
      playsinline={true} // iOS background playback
    />
  );
});

export default Player;
