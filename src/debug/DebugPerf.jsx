/**
 * File: DebugPerf.jsx
 * Path: src/debug/DebugPerf.jsx
 * Description: Performance inspector for DebugOverlay v3.
 * Shows FPS, memory usage, event loop lag, and render rate.
 */

import { useEffect, useState } from "react";
import { measureFPS, measureEventLoopLag } from "./debugUtils";

export default function DebugPerf({ logs, colors, formatTime }) {
  const [fps, setFps] = useState(0);
  const [lag, setLag] = useState(0);
  const [memory, setMemory] = useState(null);
  const [renders, setRenders] = useState(0);

  // Count React renders
  useEffect(() => {
    setRenders((r) => r + 1);
  });

  // FPS monitor
  useEffect(() => {
    measureFPS((value) => setFps(value));
  }, []);

  // Event loop lag
  useEffect(() => {
    measureEventLoopLag((value) => setLag(value));
  }, []);

  // Memory usage (Chrome / Safari only)
  useEffect(() => {
    if (performance && performance.memory) {
      const interval = setInterval(() => {
        const mem = performance.memory;
        setMemory({
          used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
          total: Math.round(mem.totalJSHeapSize / 1024 / 1024)
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflowX: "hidden",
        overflowY: "auto",
        width: "100%",
        boxSizing: "border-box",
        whiteSpace: "normal",
        wordBreak: "break-word",
        minWidth: 0
      }}
    >
      {/* FPS */}
      <div style={{ color: colors.PERF, fontSize: 12 }}>
        <strong>FPS:</strong> {fps}
      </div>

      {/* Event loop lag */}
      <div style={{ color: colors.PERF, fontSize: 12 }}>
        <strong>Event Loop Lag:</strong> {lag.toFixed(2)} ms
      </div>

      {/* Memory */}
      {memory && (
        <div style={{ color: colors.PERF, fontSize: 12 }}>
          <strong>Memory:</strong> {memory.used} MB / {memory.total} MB
        </div>
      )}

      {/* React render count */}
      <div style={{ color: colors.PERF, fontSize: 12 }}>
        <strong>React Renders:</strong> {renders}
      </div>

      {/* PERF logs */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px solid #333"
        }}
      >
        {logs.length === 0 && (
          <div style={{ color: "#888", fontSize: 12 }}>
            No performance logs yet.
          </div>
        )}

        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              padding: "4px 0",
              borderBottom: "1px solid #333",
              color: colors.PERF,
              fontSize: 12,
              lineHeight: "16px"
            }}
          >
            <div style={{ opacity: 0.6 }}>
              {formatTime(log.ts)}
            </div>
            <div>{log.msg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
