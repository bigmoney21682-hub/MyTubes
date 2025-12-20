import React, { forwardRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";

const Player = forwardRef(
  ({ embedUrl, playing, onEnded, pipMode, trackTitle, draggable }) => {
    const [isPip, setIsPip] = useState(pipMode || false);
    const [adOverlayActive, setAdOverlayActive] = useState(true);
    const [position, setPosition] = useState({ x: 16, y: 80 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // End ad overlay after fixed duration (simulate ad skip)
    useEffect(() => {
      const timer = setTimeout(() => setAdOverlayActive(false), 4000);
      return () => clearTimeout(timer);
    }, []);

    const handleDragStart = (e) => {
      if (!draggable) return;
      setDragging(true);
      const touch = e.touches ? e.touches[0] : e;
      setOffset({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    };

    const handleDragMove = (e) => {
      if (!dragging) return;
      const touch = e.touches ? e.touches[0] : e;
      setPosition({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    };

    const handleDragEnd = () => setDragging(false);

    return (
      <>
        <div
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{
            position: isPip ? "fixed" : "relative",
            bottom: isPip ? undefined : 0,
            right: isPip ? undefined : 0,
            top: isPip ? position.y : undefined,
            left: isPip ? position.x : undefined,
            zIndex: isPip ? 9999 : "auto",
            cursor: draggable && isPip ? "grab" : "default",
            borderRadius: 8,
          }}
        >
          <ReactPlayer
            ref={forwardRef}
            url={embedUrl}
            width={isPip ? "320px" : "100%"}
            height={isPip ? "180px" : "400px"}
            playing={playing}
            controls={!isPip}
            volume={1}
            muted={adOverlayActive}
            pip={isPip}
            playsinline
            onEnded={onEnded}
            style={{
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: isPip ? "0 0 12px rgba(0,0,0,0.5)" : "none",
            }}
          />
        </div>

        {isPip && (
          <div
            style={{
              position: "fixed",
              top: position.y - 24,
              left: position.x,
              zIndex: 10000,
              background: "#111",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 12,
              pointerEvents: "none",
            }}
          >
            🎵 {trackTitle} {adOverlayActive ? "(Ad…)" : ""}
          </div>
        )}
      </>
    );
  }
);

export default Player;
