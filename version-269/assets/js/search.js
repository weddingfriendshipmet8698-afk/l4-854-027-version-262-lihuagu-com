(function () {
    const movies = window.MOVIE_SEARCH_INDEX || [];
    const input = document.getElementById('global-search-input');
    const button = document.getElementById('global-search-button');
    const results = document.getElementById('global-search-results');
    const count = document.getElementById('global-search-count');
    const regionFilter = document.getElementById('global-region-filter');
    const yearFilter = document.getElementById('global-year-filter');
    const categoryFilter = document.getElementById('global-category-filter');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function uniqueValues(key) {
        return Array.from(new Set(movies.map(function (movie) {
            return movie[key];
        }).filter(Boolean))).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-Hans-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) return;
        values.forEach(function (value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function getQueryFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function createCard(movie) {
        const card = document.createElement('a');
        card.className = 'movie-card';
        card.href = movie.url;
        card.innerHTML = [
            '<div class="poster-wrap">',
            '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-badge">' + escapeHtml(movie.region) + '</span>',
            '<span class="poster-play">▶</span>',
            '</div>',
            '<div class="movie-card-body">',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '</div>'
        ].join('');
        return card;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function runSearch() {
        if (!results) return;

        const keyword = normalize(input && input.value);
        const region = normalize(regionFilter && regionFilter.value);
        const year = normalize(yearFilter && yearFilter.value);
        const category = normalize(categoryFilter && categoryFilter.value);

        const matched = movies.filter(function (movie) {
            const haystack = normalize([
                movie.title,
                movie.region,
                movie.year,
                movie.type,
                movie.genre,
                movie.tags,
                movie.category,
                movie.oneLine
            ].join(' '));

            return (!keyword || haystack.includes(keyword)) &&
                (!region || normalize(movie.region) === region) &&
                (!year || normalize(movie.year) === year) &&
                (!category || normalize(movie.category) === category);
        }).slice(0, 120);

        results.innerHTML = '';
        matched.forEach(function (movie) {
            results.appendChild(createCard(movie));
        });

        if (count) {
            count.textContent = '找到 ' + matched.length + ' 条结果' + (matched.length === 120 ? '（已显示前 120 条）' : '');
        }
    }

    fillSelect(regionFilter, uniqueValues('region'));
    fillSelect(yearFilter, uniqueValues('year'));
    fillSelect(categoryFilter, uniqueValues('category'));

    if (input) {
        input.value = getQueryFromUrl();
        input.addEventListener('input', runSearch);
    }

    [regionFilter, yearFilter, categoryFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('change', runSearch);
        }
    });

    if (button) {
        button.addEventListener('click', runSearch);
    }

    runSearch();
}());
