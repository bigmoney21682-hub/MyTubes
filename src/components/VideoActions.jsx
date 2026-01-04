/**
 * File: VideoActions.jsx
 * Path: src/components/VideoActions.jsx
 * Description:
 *   Action bar for video items.
 *   Provides:
 *     - Add to Queue
 *     - Add to Playlist (popup isolated via useRef)
 *
 *   Popup isolation ensures this component never triggers a re-render
 *   of parent containers, preventing unnecessary UI updates.
 */

import React, { useRef, useState } from "react";
import { usePlaylists } from "../contexts/PlaylistContext.jsx";
import { usePlayer } from "../player/PlayerContext.jsx";
import PlaylistPickerModal from "./PlaylistPickerModal.jsx";

export default function VideoActions({ videoId, videoSnippet }) {
  const { playlists, addVideoToPlaylist } = usePlaylists();
  const player = usePlayer();
  const queueAdd = player?.queueAdd ?? (() => {});

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
        <button
          onClick={() => queueAdd(videoId)}
          style={{
            padding: "8px 12px",
            background: "#222",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: "4px",
            fontSize: "13px"
          }}
        >
          + Add to Queue
        </button>

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
