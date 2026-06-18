(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) return;
    var current = 0;
    var timer = null;
    function show(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) window.clearInterval(timer);
        show(i);
        play();
      });
    });
    show(0);
    play();
  }

  function setupCardFilters() {
    var input = document.querySelector("[data-card-filter]");
    var select = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || (!input && !select)) return;
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-category") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        card.style.display = matchKeyword && matchYear ? "" : "none";
      });
    }
    if (input) input.addEventListener("input", apply);
    if (select) select.addEventListener("change", apply);
  }

  function setupSearchPage() {
    var container = document.querySelector("[data-search-results]");
    if (!container || !window.SITE_MOVIE_INDEX) return;
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var note = document.querySelector("[data-search-note]");
    if (note) {
      note.textContent = query ? "搜索关键词：" + query : "输入片名、年份、题材或标签，快速找到想看的影片。";
    }
    if (!query) {
      container.innerHTML = '<div class="empty-state">请输入关键词开始搜索</div>';
      return;
    }
    var q = query.toLowerCase();
    var results = window.SITE_MOVIE_INDEX.filter(function (item) {
      return [item.title, item.year, item.category, item.tags, item.oneLine].join(" ").toLowerCase().indexOf(q) !== -1;
    }).slice(0, 160);
    if (!results.length) {
      container.innerHTML = '<div class="empty-state">暂未找到相关影片</div>';
      return;
    }
    container.innerHTML = results.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-card__poster" href="' + item.link + '">',
        '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
        '    <span class="movie-card__year">' + escapeHtml(item.year) + '</span>',
        '  </a>',
        '  <div class="movie-card__body">',
        '    <a class="movie-card__title-link" href="' + item.link + '"><h3 class="movie-card__title">' + escapeHtml(item.title) + '</h3></a>',
        '    <p class="movie-card__text">' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="movie-card__meta"><a href="' + item.categoryLink + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.year) + '</span></div>',
        '    <div class="movie-card__tags">' + escapeHtml(item.tags) + '</div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player-video]");
    if (!video) return;
    var mask = document.querySelector("[data-player-mask]");
    var playerUrl = video.getAttribute("data-player-url") || "";
    var hls = null;
    var attached = false;
    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }
    function attachMedia() {
      if (attached || !playerUrl) return;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playerUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playerUrl;
      } else {
        video.src = playerUrl;
      }
      attached = true;
    }
    function start() {
      attachMedia();
      if (mask) mask.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      playVideo();
    }
    if (mask) {
      mask.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) start();
    });
    window.addEventListener("pagehide", function () {
      if (hls) hls.destroy();
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHeroSlider();
    setupCardFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
