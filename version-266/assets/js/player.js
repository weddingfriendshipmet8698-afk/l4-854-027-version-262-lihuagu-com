(function () {
  function setupPlayer(root) {
    var video = root.querySelector("video[data-stream]");
    var trigger = root.querySelector("[data-play]");
    if (!video || !trigger) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var isReady = false;
    var hlsInstance = null;

    function attachStream() {
      if (isReady || !stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      isReady = true;
    }

    function start() {
      attachStream();
      root.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function init() {
    var players = document.querySelectorAll("[data-player]");
    Array.prototype.forEach.call(players, setupPlayer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
