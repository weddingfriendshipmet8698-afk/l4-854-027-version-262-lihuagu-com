import { H as Hls } from './hls-dru42stk.js';

const players = document.querySelectorAll('.movie-player');

players.forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const status = player.querySelector('.player-status');
    const primarySource = player.dataset.src;
    const fallbackSource = player.dataset.fallbackSrc;
    let hls = null;
    let loadedSource = '';
    let triedFallback = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function destroyHls() {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    }

    function playVideo() {
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                setStatus('请再次点击播放');
            });
        }
    }

    function loadSource(source) {
        if (!source || loadedSource === source) {
            playVideo();
            return;
        }

        loadedSource = source;
        destroyHls();
        setStatus('正在加载播放源');

        const isHls = source.indexOf('.m3u8') !== -1 || source.indexOf('manifest') !== -1;

        if (isHls && Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('播放源加载完成');
                playVideo();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (!triedFallback && fallbackSource && fallbackSource !== source) {
                        triedFallback = true;
                        setStatus('正在切换备用播放源');
                        loadSource(fallbackSource);
                        return;
                    }
                    setStatus('播放源暂时无法加载');
                }
            });
            return;
        }

        if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function onLoaded() {
                video.removeEventListener('loadedmetadata', onLoaded);
                setStatus('播放源加载完成');
                playVideo();
            });
            video.addEventListener('error', function onError() {
                video.removeEventListener('error', onError);
                if (!triedFallback && fallbackSource && fallbackSource !== source) {
                    triedFallback = true;
                    loadSource(fallbackSource);
                } else {
                    setStatus('播放源暂时无法加载');
                }
            });
            return;
        }

        video.src = source;
        playVideo();
    }

    function startPlayback() {
        player.classList.add('is-playing');
        loadSource(primarySource || fallbackSource);
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            setStatus('已暂停');
        }
    });

    video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
        setStatus('播放结束');
    });
});
