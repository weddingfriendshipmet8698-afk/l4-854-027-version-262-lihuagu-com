(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var next = root.querySelector("[data-hero-next]");
    var prev = root.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    restart();
  }

  function setupSearchAndSort() {
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var sorters = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-grid]"));
    var emptyMessages = Array.prototype.slice.call(document.querySelectorAll("[data-empty]"));

    if (!cards.length) {
      return;
    }

    function activeQuery() {
      for (var i = 0; i < searchInputs.length; i += 1) {
        var value = searchInputs[i].value.trim().toLowerCase();
        if (value) {
          return value;
        }
      }
      return "";
    }

    function filterCards() {
      var query = activeQuery();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-text") || "";
        var match = !query || haystack.indexOf(query) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      emptyMessages.forEach(function (item) {
        item.classList.toggle("is-visible", visible === 0);
      });
    }

    function sortCards(mode) {
      grids.forEach(function (grid) {
        var children = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        if (!children.length) {
          return;
        }
        children.sort(function (a, b) {
          var ay = Number(a.getAttribute("data-year")) || 0;
          var by = Number(b.getAttribute("data-year")) || 0;
          var at = a.getAttribute("data-title") || "";
          var bt = b.getAttribute("data-title") || "";
          if (mode === "year-desc") {
            return by - ay;
          }
          if (mode === "year-asc") {
            return ay - by;
          }
          if (mode === "title-asc") {
            return at.localeCompare(bt, "zh-CN");
          }
          return 0;
        });
        children.forEach(function (card) {
          grid.appendChild(card);
        });
      });
      filterCards();
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var value = input.value;
        searchInputs.forEach(function (other) {
          if (other !== input) {
            other.value = value;
          }
        });
        filterCards();
      });
    });

    sorters.forEach(function (select) {
      select.addEventListener("change", function () {
        sortCards(select.value);
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchAndSort();
  });
})();
