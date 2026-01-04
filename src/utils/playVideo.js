/**
 * ------------------------------------------------------------
 * File: playVideo.js
 * Path: src/utils/playVideo.js
 * Description:
 *   Universal play handler used by ALL components.
 *
 *   Responsibilities:
 *     - Load video into GlobalPlayer_v2
 *     - Update PlayerContext metadata
 *     - Expand PlayerShell
 *     - Optional: set playlist context
 *     - Optional: set autonext mode
 *
 *   Notes:
 *     - No navigation
 *     - No route params
 *     - No assumptions about caller
 * ------------------------------------------------------------
 */

import { GlobalPlayer } from "../player/GlobalPlayer_v2.js";

/**
 * playVideo()
 *
 * @param {Object} params
 * @param {string} params.id - Video ID
 * @param {string} params.title
 * @param {string} params.thumbnail
 * @param {string} params.channel
 * @param {Object} params.player - PlayerContext instance
 * @param {string|null} [params.playlistId] - Optional playlist context
 * @param {"related"|"playlist"|null} [params.autonext] - Optional autonext mode
 */
export function playVideo({
  id,
  title,
  thumbnail,
  channel,
  player,
  playlistId = null,
  autonext = null
}) {
  if (!id || !player) {
    console.warn("playVideo() called without id or player context");
    return;
  }

  // Debug
  window.bootDebug?.player(`playVideo() → ${id}`);

  // 1. Load into global player
  GlobalPlayer.load(id);

  // 2. Update metadata for MiniPlayer + FullPlayer
  player.setPlayerMeta({
    title: title ?? "",
    thumbnail: thumbnail ?? "",
    channel: channel ?? ""
  });

  // 3. Optional: set playlist context
  if (playlistId) {
    player.setActivePlaylistId(playlistId);
  }

  // 4. Optional: set autonext mode
  if (autonext === "playlist") {
    player.setAutonextMode("playlist");
  } else if (autonext === "related") {
    player.setAutonextMode("related");
  }

  // 5. Expand the player
  player.expandPlayer();
}
