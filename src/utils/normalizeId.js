/**
 * File: normalizeId.js
 * Path: src/utils/normalizeId.js
 * Description:
 *   Safely extracts a YouTube video ID from any known API shape.
 *   Now fully crash-proof and bootDebug-instrumented.
 */

export default function normalizeId(input) {
  // 1. Log raw input for debugging, but never let JSON.stringify crash
  try {
    window.bootDebug?.router(
      "normalizeId.js → input = " + JSON.stringify(input)
    );
  } catch (err) {
    window.bootDebug?.router(
      "normalizeId.js → input JSON.stringify FAILED: " + String(err)
    );
  }

  let id = null;

  try {
    // 2. Handle simple string IDs
    if (typeof input === "string") {
      id = input.trim();
    }

    // 3. Handle objects with common YouTube API shapes
    else if (input && typeof input === "object") {
      if (input.id && typeof input.id === "string") {
        id = input.id.trim();
      } else if (input.videoId && typeof input.videoId === "string") {
        id = input.videoId.trim();
      } else if (
        input.id &&
        typeof input.id === "object" &&
        typeof input.id.videoId === "string"
      ) {
        id = input.id.videoId.trim();
      } else if (typeof input.url === "string") {
        const match = input.url.match(/v=([^&]+)/);
        if (match) id = match[1];
      }
    }

    // 4. Final cleanup
    if (typeof id === "string") {
      id = id.replace(/[^a-zA-Z0-9_-]/g, "");
    }
  } catch (err) {
    window.bootDebug?.router(
      "normalizeId.js → INTERNAL ERROR: " + String(err)
    );
    id = null;
  }

  // 5. Log output safely
  try {
    window.bootDebug?.router(
      "normalizeId.js → output = " + JSON.stringify(id)
    );
  } catch (_) {}

  // 6. Never throw — always return null on failure
  return id || null;
}
