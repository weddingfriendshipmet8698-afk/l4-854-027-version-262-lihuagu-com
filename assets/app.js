(function () {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const activate = function (nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5600);
    }
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const input = filterPanel.querySelector('[data-filter-input]');
    const region = filterPanel.querySelector('[data-filter-region]');
    const year = filterPanel.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));

    const filterCards = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const regionValue = region ? region.value : '';
      const yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        const text = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.tags || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        const matchesKeyword = !keyword || text.includes(keyword);
        const matchesRegion = !regionValue || card.dataset.region === regionValue;
        const matchesYear = !yearValue || card.dataset.year === yearValue;
        card.classList.toggle('is-filtered-out', !(matchesKeyword && matchesRegion && matchesYear));
      });
    };

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  const searchForm = document.querySelector('[data-search-form]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchInput = document.querySelector('[data-search-input]');

  if (searchForm && searchResults && searchInput && typeof MOVIES_INDEX !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get('q') || '';
    searchInput.value = initialKeyword;

    const cardTemplate = function (movie) {
      return [
        '<article class="movie-card">',
        '  <a href="' + movie.url + '" class="poster-wrap">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-overlay"></span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="card-meta">',
        '      <a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a>',
        '      <span>' + escapeHtml(movie.year) + '年</span>',
        '    </div>',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    };

    const render = function () {
      const keyword = searchInput.value.trim().toLowerCase();
      const items = MOVIES_INDEX.filter(function (movie) {
        return !keyword || movie.text.includes(keyword);
      }).slice(0, 240);

      if (!items.length) {
        searchResults.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
        return;
      }

      searchResults.innerHTML = items.map(cardTemplate).join('');
    };

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const keyword = searchInput.value.trim();
      const url = keyword ? './search.html?q=' + encodeURIComponent(keyword) : './search.html';
      window.history.replaceState(null, '', url);
      render();
    });

    searchInput.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();

const MoviePlayer = {
  init: function (source) {
    const video = document.querySelector('[data-player-video]');
    const cover = document.querySelector('[data-player-cover]');
    let hls = null;
    let prepared = false;

    if (!video || !source) {
      return;
    }

    const prepare = function () {
      if (prepared) {
        return;
      }
      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    const start = function () {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
};
