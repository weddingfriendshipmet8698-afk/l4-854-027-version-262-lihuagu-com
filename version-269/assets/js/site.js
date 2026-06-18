(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    const panel = document.querySelector('[data-filter-panel]');
    const grid = document.querySelector('[data-filter-grid]');

    if (panel && grid) {
        const keywordInput = panel.querySelector('[data-filter-keyword]');
        const yearSelect = panel.querySelector('[data-filter-year]');
        const regionSelect = panel.querySelector('[data-filter-region]');
        const resetButton = panel.querySelector('[data-filter-reset]');
        const countLabel = document.querySelector('[data-filter-count]');
        const cards = Array.from(grid.querySelectorAll('[data-title]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            const keyword = normalize(keywordInput && keywordInput.value);
            const year = normalize(yearSelect && yearSelect.value);
            const region = normalize(regionSelect && regionSelect.value);
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));

                const matchedKeyword = !keyword || haystack.includes(keyword);
                const matchedYear = !year || normalize(card.dataset.year) === year;
                const matchedRegion = !region || normalize(card.dataset.region) === region;
                const matched = matchedKeyword && matchedYear && matchedRegion;

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (countLabel) {
                countLabel.textContent = '筛选结果：' + visible + ' 部影片';
            }
        }

        [keywordInput, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (keywordInput) keywordInput.value = '';
                if (yearSelect) yearSelect.value = '';
                if (regionSelect) regionSelect.value = '';
                applyFilter();
            });
        }
    }
}());
