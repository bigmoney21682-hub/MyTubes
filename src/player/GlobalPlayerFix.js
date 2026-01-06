/**
 * File: GlobalPlayerFix.js
 * Path: src/player/GlobalPlayerFix.js
 * Description:
 *   Safe wrapper around the YouTube Iframe API.
 *   - Retries for up to 5 seconds until #yt-player exists
 *   - Waits for Iframe API ready
 *   - Only calls loadVideoById after onReady
 *   - Survives early API load + late React render
 *   - FIX: Removed ALL resizing (setSize) to restore iOS playback stability
 */

console.log("[PLAYER] GlobalPlayerFix loaded");

function dbg(label, data = {}) {
  console.group(`[PLAYER] ${label}`);
  for (const k in data) console.log(k + ":", data[k]);
  console.groupEnd();
}

const GlobalPlayer = {
  player: null,
  apiReady: false,
  pendingId: null,
  ready: false,

  /**
   * Wait up to 5 seconds for #yt-player to appear.
   * iOS Safari sometimes delays DOM insertion.
   */
  waitForContainer() {
    return new Promise((resolve, reject) => {
      const start = performance.now();

      const check = () => {
        const el = document.getElementById("yt-player");

        if (el) {
          dbg("waitForContainer → #yt-player found");
          resolve(el);
          return;
        }

        const elapsed = performance.now() - start;
        if (elapsed > 5000) {
          dbg("waitForContainer → TIMEOUT (5s) #yt-player never appeared");
          reject(new Error("#yt-player did not appear within 5 seconds"));
          return;
        }

        setTimeout(check, 50);
      };

      check();
    });
  },

  /**
   * Initialize the YouTube player once:
   * - API is ready
   * - Container exists
   */
  async init() {
    dbg("init() called");

    if (this.player) {
      dbg("init() → player already exists");
      return;
    }

    if (!this.apiReady) {
      dbg("init() → API not ready yet");
      return;
    }

    try {
      await this.waitForContainer();
      dbg("init() → container ready, creating player");

      this.player = new YT.Player("yt-player", {
        height: "100%",
        width: "100%",
        playerVars: {
          playsinline: 1,
          autoplay: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: (e) => {
            dbg("onReady");
            this.ready = true;

            if (this.pendingId) {
              const id = this.pendingId;
              this.pendingId = null;
              dbg("onReady → loading pendingId", { id });

              try {
                e.target.loadVideoById(id);
              } catch (err) {
                dbg("onReady → loadVideoById exception", { err });
              }
            }
          },

          onStateChange: (e) => {
            dbg("onStateChange", { state: e.data });
          },

          onError: (e) => {
            dbg("onError", { error: e.data });
          }
        }
      });
    } catch (err) {
      dbg("init() → FAILED to create player", { err });
    }
  },

  /**
   * Load a video by ID.
   * If player isn't ready, queue it.
   */
  loadVideo(id) {
    dbg("loadVideo()", { id });

    this.pendingId = id;

    if (this.player && this.ready) {
      try {
        this.player.loadVideoById(id);
      } catch (err) {
        dbg("loadVideo() immediate load exception", { err });
      }
      return;
    }

    dbg("Player missing or not ready → calling init()");
    this.init();
  }
};

window.GlobalPlayer = GlobalPlayer;

/**
 * YouTube Iframe API callback.
 * May fire BEFORE React renders PlayerShell.
 * So we always retry until the container exists.
 */
window.onYouTubeIframeAPIReady = () => {
  dbg("Iframe API Ready");
  GlobalPlayer.apiReady = true;
  GlobalPlayer.init();
};
