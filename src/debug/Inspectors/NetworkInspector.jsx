/**
 * File: NetworkInspector.jsx
 * Path: src/debug/inspectors/NetworkInspector.jsx
 * Description: Displays NETWORK logs from debugBus.
 */

import React, { useEffect, useState } from "react";
import { debugBus } from "../debugBus.js";

export default function NetworkInspector() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsub = debugBus.subscribe((evt) => {
      if (evt.level === "NETWORK") {
        setEvents((prev) => [...prev, evt]);
      }
    });

    return () => unsub();
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <h3>Network</h3>

      {events.length === 0 && (
        <p>No network events yet.</p>
      )}

      {events.map((e, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ opacity: 0.7, fontSize: 12 }}>
            {new Date(e.ts).toLocaleTimeString()}
          </div>
          <div>{e.msg}</div>
        </div>
      ))}
    </div>
  );
}
