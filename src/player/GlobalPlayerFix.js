/**
 * File: GlobalPlayerFix.js
 * Path: src/player/GlobalPlayerFix.js
 * Description:
 *   Safe wrapper around the YouTube Iframe API.
 *   - Retries until #yt-player exists
 *   - Waits for Iframe API ready
 *   - Only calls loadVideoById after onReady
 *   - Survives early API load + late React render
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
  retryTimer: null,

  ensureContainer() {
    const el = document.getElementById("yt-player");
    if (!el) {
      dbg("ensureContainer() → #yt-player not in DOM");
      return false;
    }
    return true;
  },

  /**
   * Retry init until the container exists.
   * This solves the boot race where the API loads
   * before React renders PlayerShell.
   */
  waitForContainerAndInit() {
    if (this.ensureContainer()) {
      dbg("waitForContainerAndInit → container found, initializing");
      this.init();
      return;
    }

    dbg("waitForContainerAndInit → retrying in 50ms");
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.waitForContainerAndInit(), 50);
  },

  init() {
    dbg("init() called");

    if (this.player) {
      dbg("init() → player already exists");
      return;
    }

    if (!this.apiReady) {
      dbg("init() → API not ready yet");
      return;
    }

    if (!this.ensureContainer()) {
      dbg("init() → container missing, retrying");
      this.waitForContainerAndInit();
      return;
    }

    try {
      dbg("Creating YT.Player");
      this.player = new YT.Player("yt-player", {
        height: "100%",
        width: "100%",
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: (e) => {
            dbg("onReady");

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
      dbg("init() exception", { err });
    }
  },

  loadVideo(id) {
    dbg("loadVideo()", { id });

    this.pendingId = id;

    if (this.player && typeof this.player.loadVideoById === "function") {
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
  GlobalPlayer.waitForContainerAndInit();
};
