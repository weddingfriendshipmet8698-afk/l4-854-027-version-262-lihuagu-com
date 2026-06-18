(function () {
  var video = document.getElementById('moviePlayer');
  var playButton = document.querySelector('[data-play-button]');
  var frame = document.querySelector('[data-player-frame]');
  var source = typeof playerStream === 'string' ? playerStream : '';
  var initialized = false;
  var hlsInstance = null;

  function setup() {
    if (!video || !source || initialized) {
      return;
    }
    initialized = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    setup();
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
    var request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener('click', start);
  }
  if (frame) {
    frame.addEventListener('click', function (event) {
      if (event.target === video && !initialized) {
        start();
      }
    });
  }
  if (video) {
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });
  }
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
