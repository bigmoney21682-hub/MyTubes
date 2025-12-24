// File: src/components/MiniPlayer.jsx
// PCC v7.0 — YouTube-style MiniPlayer (H1 height, draggable on press+hold)

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

export default function MiniPlayer() {
  const { current, playing, togglePlay, playNext } = usePlayer();
  const navigate = useNavigate();

  const [position, setPosition] = useState({ x: 8, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  const pressTimerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, pointerX: 0, pointerY: 0 });
  const containerRef = useRef(null);

  // Initialize position near bottom
  useEffect(() => {
    const h = window.innerHeight || 800;
    setPosition({ x: 8, y: h - 72 });
  }, []);

  if (!current) return null;

  const handleNavigate = () => {
    if (isDragging) return;
    if (!current.id) return;
    navigate(`/watch/${current.id}`);
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsPressing(true);
    const pointerX = e.clientX;
    const pointerY = e.clientY;

    dragStartRef.current = {
      x: position.x,
      y: position.y,
      pointerX,
      pointerY,
    };

    // Long press (250ms) to enter drag mode
    pressTimerRef.current = setTimeout(() => {
      setIsDragging(true);
    }, 250);

    containerRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const { x, y, pointerX, pointerY } = dragStartRef.current;
    const dx = e.clientX - pointerX;
    const dy = e.clientY - pointerY;

    const newX = x + dx;
    const newY = y + dy;

    const viewportWidth = window.innerWidth || 375;
    const viewportHeight = window.innerHeight || 812;
    const cardWidth = Math.min(480, viewportWidth - 16);
    const cardHeight = 56;

    const clampedX = Math.max(8, Math.min(newX, viewportWidth - cardWidth - 8));
    const clampedY = Math.max(8, Math.min(newY, viewportHeight - cardHeight - 8));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e) => {
    clearPressTimer();
    setIsPressing(false);
    setIsDragging(false);
    containerRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const handleClick = (e) => {
    // If we were dragging or long-pressing, ignore click
    if (isDragging || pressTimerRef.current) {
      e.stopPropagation();
      clearPressTimer();
      return;
    }
    handleNavigate();
  };

  const title = current.title || "Unknown Title";
  const author = current.author || "Unknown Channel";
  const thumb = current.thumbnail;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: `min(480px, calc(100% - 16px))`,
        height: 56,
        borderRadius: 12,
        background: "#111",
        boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        zIndex: 50,
        cursor: isDragging ? "grabbing" : "pointer",
        userSelect: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 56,
          height: 40,
          borderRadius: 8,
          overflow: "hidden",
          background: "#000",
          flexShrink: 0,
        }}
      >
        {thumb && (
          <img
            src={thumb}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>

      {/* Title + channel */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          marginLeft: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {author}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginLeft: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => togglePlay()}
          style={iconButtonStyle}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => playNext()}
          style={iconButtonStyle}
        >
          ⏭
        </button>
      </div>
    </div>
  );
}

const iconButtonStyle = {
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: 22, // C2 weight feeling
  fontWeight: 500,
  cursor: "pointer",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
