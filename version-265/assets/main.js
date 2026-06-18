(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var canvas = document.getElementById('ambient-canvas');

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8', '#f7dc6f', '#bb8fce'];
    var bubbles = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function buildBubbles() {
      bubbles = [];
      var total = Math.min(54, Math.max(22, Math.floor(window.innerWidth / 28)));
      for (var i = 0; i < total; i += 1) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 14 + 7,
          speed: Math.random() * 0.75 + 0.28,
          drift: (Math.random() - 0.5) * 0.45,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.28 + 0.12
        });
      }
    }

    function drawBubble(item) {
      ctx.save();
      ctx.globalAlpha = item.opacity;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach(function (item) {
        item.y += item.speed;
        item.x += item.drift;
        if (item.y > canvas.height + item.size) {
          item.y = -item.size;
          item.x = Math.random() * canvas.width;
        }
        if (item.x < -item.size) {
          item.x = canvas.width + item.size;
        }
        if (item.x > canvas.width + item.size) {
          item.x = -item.size;
        }
        drawBubble(item);
      });
      window.requestAnimationFrame(tick);
    }

    resizeCanvas();
    buildBubbles();
    tick();

    window.addEventListener('resize', function () {
      resizeCanvas();
      buildBubbles();
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dotsWrap = slider.querySelector('.hero-dots');
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }
    }

    function start() {
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, dotIndex) {
        var dot = document.createElement('button');
        dot.className = 'hero-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换推荐影片');
        dot.addEventListener('click', function () {
          window.clearInterval(timer);
          activate(dotIndex);
          start();
        });
        dotsWrap.appendChild(dot);
      });
    }

    activate(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
    var scope = panel.closest('main') || document;
    var search = panel.querySelector('[data-filter-search]');
    var category = panel.querySelector('[data-filter-category]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    var empty = scope.querySelector('[data-empty-state]');

    function applyFilter() {
      var q = normalize(search && search.value);
      var cat = normalize(category && category.value);
      var reg = normalize(region && region.value);
      var yr = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));
        var match = true;

        if (q && haystack.indexOf(q) === -1) {
          match = false;
        }
        if (cat && normalize(card.getAttribute('data-category')) !== cat) {
          match = false;
        }
        if (reg && normalize(card.getAttribute('data-region')) !== reg) {
          match = false;
        }
        if (yr && normalize(card.getAttribute('data-year')) !== yr) {
          match = false;
        }

        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, category, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
}());
