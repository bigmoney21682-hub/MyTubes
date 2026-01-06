/**
 * File: VideoActions.jsx
 * Path: src/components/VideoActions.jsx
 * Description:
 *   Action bar for video items.
 *   Provides:
 *     - Add to Playlist (popup isolated via useRef)
 *
 *   Popup isolation ensures this component never triggers a re-render
 *   of parent containers, preventing unnecessary UI updates.
 */

import React, { useRef, useState } from "react";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";
import PlaylistPickerModal from "./PlaylistPickerModal.jsx";

export default function VideoActions({ videoId, videoSnippet }) {
  const { playlists, addVideoToPlaylist } = usePlaylists();

  // Popup isolation
  const showPickerRef = useRef(false);
  const [uiTick, setUiTick] = useState(0);

  function openPicker() {
    if (!playlists || playlists.length === 0) {
      alert("You have no playlists yet. Create one first.");
      return;
    }
    showPickerRef.current = true;
    setUiTick((x) => x + 1);
  }

  function closePicker() {
    showPickerRef.current = false;
    setUiTick((x) => x + 1);
  }

  return (
    <>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        {/* Queue button removed — queue system no longer exists */}
        
        <button
          onClick={openPicker}
          style={{
            padding: "8px 12px",
            background: "#222",
            color: "#3ea6ff",
            border: "1px solid #444",
            borderRadius: "4px",
            fontSize: "13px"
          }}
        >
          + Playlist
        </button>
      </div>

      {showPickerRef.current && (
        <PlaylistPickerModal
          playlists={playlists}
          onSelect={(playlist) => {
            addVideoToPlaylist(playlist.id, {
              id: videoId,
              title: videoSnippet?.title ?? "Untitled",
              author: videoSnippet?.channelTitle ?? "Unknown Channel",
              thumbnail: videoSnippet?.thumbnails?.medium?.url ?? ""
            });

            closePicker();
            alert(`Added to playlist: ${playlist.name}`);
          }}
          onClose={closePicker}
        />
      )}
    </>
  );
}
