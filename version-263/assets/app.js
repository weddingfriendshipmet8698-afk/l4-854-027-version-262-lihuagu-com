(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('.search-form'));
  var movies = window.movieIndex || [];
  forms.forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var panel = form.querySelector('[data-search-panel]');
    if (!input || !panel) {
      return;
    }
    var render = function () {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return;
      }
      var results = movies.filter(function (movie) {
        return movie.text.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 12);
      if (!results.length) {
        panel.innerHTML = '<div class="search-result"><div><strong>未找到相关作品</strong><p>换一个关键词试试</p></div></div>';
        panel.classList.add('is-open');
        return;
      }
      panel.innerHTML = results.map(function (movie) {
        return '<a class="search-result" href="' + movie.link + '"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '"><div><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span><p>' + escapeHtml(movie.oneLine) + '</p></div></a>';
      }).join('');
      panel.classList.add('is-open');
    };
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var first = panel.querySelector('a');
      if (first) {
        window.location.href = first.href;
      }
    });
    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  });

  var filterGroups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));
  filterGroups.forEach(function (group) {
    var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]'));
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var items = Array.prototype.slice.call(grid.querySelectorAll('[data-filter-item]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value');
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        items.forEach(function (item) {
          var pool = item.getAttribute('data-filter-values') || '';
          var visible = value === '全部' || pool.indexOf(value) !== -1;
          item.classList.toggle('is-hidden', !visible);
        });
      });
    });
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
