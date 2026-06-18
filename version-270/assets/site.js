(function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-arrow.prev");
    var next = document.querySelector(".hero-arrow.next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            resetHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-index") || 0));
            resetHero();
        });
    });

    startHero();

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters(scope) {
        var input = scope.querySelector(".filter-input");
        var select = scope.querySelector(".year-select");
        var chips = Array.prototype.slice.call(scope.querySelectorAll(".filter-chip"));
        var list = scope.nextElementSibling;

        while (list && !list.classList.contains("searchable-list")) {
            list = list.nextElementSibling;
        }

        if (!list) {
            list = document.querySelector(".searchable-list");
        }

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var activeValue = "all";

        function apply() {
            var query = normalize(input ? input.value : "");
            var year = select ? select.value : "all";

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-tags")
                ].join(" "));

                var matchesText = !query || haystack.indexOf(query) !== -1;
                var matchesChip = activeValue === "all" || haystack.indexOf(normalize(activeValue)) !== -1;
                var matchesYear = year === "all" || card.getAttribute("data-year") === year;
                card.classList.toggle("is-hidden", !(matchesText && matchesChip && matchesYear));
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        if (select) {
            select.addEventListener("change", apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                activeValue = chip.getAttribute("data-filter-value") || "all";
                apply();
            });
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".filter-panel")).forEach(setupFilters);
})();
