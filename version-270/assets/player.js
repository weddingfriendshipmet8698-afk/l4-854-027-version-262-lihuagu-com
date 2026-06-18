(function () {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".player-overlay");
    var configNode = document.getElementById("player-config");

    if (!video || !overlay || !configNode) {
        return;
    }

    var config = {};

    try {
        config = JSON.parse(configNode.textContent || "{}");
    } catch (error) {
        config = {};
    }

    var mediaUrl = config.url || "";
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
        if (prepared || !mediaUrl) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(mediaUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = mediaUrl;
        }

        prepared = true;
    }

    function start() {
        prepare();
        overlay.classList.add("is-hidden");
        var result = video.play();

        if (result && typeof result.catch === "function") {
            result.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    overlay.addEventListener("click", start);

    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            overlay.classList.remove("is-hidden");
        }
    });

    video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
