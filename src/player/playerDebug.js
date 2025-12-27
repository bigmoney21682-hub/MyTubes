/**
 * File: playerDebug.js
 * Path: src/player/playerDebug.js
 * Description: Helper functions for logging player state transitions.
 */

import { logPlayer } from "../debug/debugBus";

export function logPlayerState(state, data) {
  logPlayer("Player state → " + state, data);
  window.bootDebug?.info("PLAYER → " + state);
}

export function logPlayerEvent(event, data) {
  logPlayer("Player event → " + event, data);
  window.bootDebug?.info("PLAYER EVENT → " + event);
}
