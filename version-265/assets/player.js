(function () {
  function mount(root, source) {
    if (!root || !source) {
      return;
    }

    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var startButton = root.querySelector('.player-start');
    var state = root.querySelector('.player-state');
    var loaded = false;
    var hls = null;

    if (!video) {
      return;
    }

    function setState(text) {
      if (state) {
        state.textContent = text || '';
      }
    }

    function load() {
      if (loaded) {
        return;
      }

      loaded = true;
      setState('正在加载');

      if (source.indexOf('.m3u8') > -1 || source.indexOf('/manifest/') > -1) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            maxBufferLength: 30
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      } else {
        video.src = source;
      }
    }

    function reveal() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function showCover() {
      if (cover && video.currentTime === 0) {
        cover.classList.remove('is-hidden');
      }
    }

    function play() {
      load();
      reveal();
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          setState('点击画面继续播放');
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (cover) {
      cover.addEventListener('click', function () {
        play();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('playing', function () {
      setState('');
      reveal();
    });

    video.addEventListener('waiting', function () {
      setState('缓冲中');
    });

    video.addEventListener('pause', function () {
      showCover();
    });

    video.addEventListener('ended', function () {
      if (hls) {
        hls.stopLoad();
      }
      if (cover) {
        cover.classList.remove('is-hidden');
      }
      setState('');
    });

    video.addEventListener('error', function () {
      setState('播放暂时不可用');
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });
  }

  window.MoviePlayer = {
    mount: mount
  };
}());
