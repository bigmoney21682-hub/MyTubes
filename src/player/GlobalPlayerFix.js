// ===============================
// GlobalPlayer_v2.1 (iOS‑safe)
// 5‑second DOM‑mount retry loop
// ===============================

window.GlobalPlayer = {
  player: null,
  pendingVideoId: null,
  ready: false,

  init() {
    console.log("[GlobalPlayer] init()");

    // Wait for DOM node #player to appear
    this.waitForPlayerElement()
      .then(() => this.createPlayer())
      .catch((err) => {
        console.error("[GlobalPlayer] FATAL: #player never appeared", err);
      });
  },

  // ---------------------------------------
  // Wait for #player to exist (retry 5 sec)
  // ---------------------------------------
  waitForPlayerElement() {
    return new Promise((resolve, reject) => {
      const start = performance.now();

      const check = () => {
        const el = document.getElementById("yt-player");

        if (el) {
          console.log("[GlobalPlayer] #player found");
          resolve(el);
          return;
        }

        const elapsed = performance.now() - start;
        if (elapsed > 5000) {
          reject(new Error("#player did not appear within 5 seconds"));
          return;
        }

        // Retry every 50ms
        setTimeout(check, 50);
      };

      check();
    });
  },

  // ---------------------------------------
  // Create the YouTube iframe player
  // ---------------------------------------
  createPlayer() {
    console.log("[GlobalPlayer] Creating player…");

    this.player = new YT.Player("yt-player", {
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => {
          console.log("[GlobalPlayer] Player ready");
          this.ready = true;

          if (this.pendingVideoId) {
            console.log(
              "[GlobalPlayer] Running pending load:",
              this.pendingVideoId
            );
            this.loadVideo(this.pendingVideoId);
            this.pendingVideoId = null;
          }
        },
        onStateChange: (e) => {
          console.log("[GlobalPlayer] State:", e.data);
        },
        onError: (e) => {
          console.error("[GlobalPlayer] ERROR:", e.data);
        },
      },
    });
  },

  // ---------------------------------------
  // Load a video (queue if not ready)
  // ---------------------------------------
  loadVideo(videoId) {
    console.log("[GlobalPlayer] loadVideo()", videoId);

    if (!this.player || !this.ready) {
      console.log("[GlobalPlayer] Player not ready → queueing", videoId);
      this.pendingVideoId = videoId;
      return;
    }

    try {
      this.player.loadVideoById(videoId);
    } catch (err) {
      console.error("[GlobalPlayer] loadVideoById failed", err);
    }
  },
};

// Auto‑init when YT API is ready
window.onYouTubeIframeAPIReady = () => {
  console.log("[GlobalPlayer] YT API ready → init()");
  window.GlobalPlayer.init();
};
