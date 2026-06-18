(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  var filterEmpty = document.querySelector('[data-filter-empty]');

  if (filterInput && filterList) {
    var filterCards = Array.prototype.slice.call(filterList.querySelectorAll('[data-title]'));
    filterInput.addEventListener('input', function() {
      var keyword = filterInput.value.trim().toLowerCase();
      var visible = 0;
      filterCards.forEach(function(card) {
        var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (filterEmpty) {
        filterEmpty.classList.toggle('is-visible', visible === 0);
      }
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchTags = Array.prototype.slice.call(document.querySelectorAll('[data-search-tag]'));

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearch(query) {
    if (!searchResults || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var keyword = String(query || '').trim().toLowerCase();
    var pool = window.MOVIE_SEARCH_INDEX;
    var results = keyword
      ? pool.filter(function(item) {
          return item.searchText.indexOf(keyword) !== -1;
        }).slice(0, 80)
      : pool.slice(0, 40);

    searchResults.innerHTML = results.map(function(item) {
      return '<a class="search-result-card" href="' + escapeHtml(item.url) + '">' +
        '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span>' + escapeHtml(item.category) + ' · ' + escapeHtml(item.year) + '</span>' +
        '<h2>' + escapeHtml(item.title) + '</h2>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '</a>';
    }).join('');
  }

  if (searchForm && searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    renderSearch(initialQuery);

    searchForm.addEventListener('submit', function(event) {
      event.preventDefault();
      renderSearch(searchInput.value);
    });

    searchTags.forEach(function(button) {
      button.addEventListener('click', function() {
        searchInput.value = button.getAttribute('data-search-tag') || '';
        renderSearch(searchInput.value);
      });
    });
  }
})();
