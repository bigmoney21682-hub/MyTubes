/**
 * File: QueueStore.js
 * Path: src/player/QueueStore.js
 * Description: Simple global queue manager for playlist autonext mode.
 *              Guarantees:
 *              - No duplicate IDs
 *              - Safe next() even when empty
 *              - Pure, predictable behavior
 *              - No React dependencies
 *              - No stale closures
 */

import { debugBus } from "../debug/debugBus.js";

class QueueStoreClass {
  constructor() {
    this.queue = [];
    this.index = -1; // -1 means nothing selected yet
  }

  /**
   * Add a video to the queue.
   */
  add(id) {
    if (!id) return;

    // Prevent duplicates
    if (this.queue.includes(id)) {
      debugBus.player("QueueStore → ID already in queue: " + id);
      return;
    }

    this.queue.push(id);
    debugBus.player("QueueStore → Added: " + id);

    // If this is the first item, set index to 0
    if (this.index === -1) {
      this.index = 0;
      debugBus.player("QueueStore → First item, index=0");
    }
  }

  /**
   * Get the next video in the queue.
   * Returns null if no next item.
   */
  next() {
    if (this.queue.length === 0) {
      debugBus.player("QueueStore → next() but queue empty");
      return null;
    }

    if (this.index + 1 >= this.queue.length) {
      debugBus.player("QueueStore → next() reached end of queue");
      return null;
    }

    this.index += 1;
    const id = this.queue[this.index];

    debugBus.player("QueueStore → next() → " + id);
    return id;
  }

  /**
   * Get the current video ID.
   */
  current() {
    if (this.index < 0 || this.index >= this.queue.length) return null;
    return this.queue[this.index];
  }

  /**
   * Reset the queue entirely.
   */
  clear() {
    this.queue = [];
    this.index = -1;
    debugBus.player("QueueStore → cleared");
  }
}

export const QueueStore = new QueueStoreClass();
