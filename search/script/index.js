(function () {
    var radioSite = document.querySelector('input[name="source"][value="site"]');
    var radioGoogle = document.querySelector('input[name="source"][value="google"]');
    var btnFilters = document.getElementById('btn-search-filters');
    var resultCount = document.getElementById('search-result-count');
    var articleList = document.getElementById('search-article-list');
    var pagination = document.getElementById('search-pagination');
    var googleContainer = document.getElementById('google-search-container');
    var googleInputWrap = document.getElementById('google-input-wrap');
    var btnKeyword = document.getElementById('keyword');
    var googleKeyword = document.getElementById('google-keyword');
    var googleClear = document.getElementById('google-clear');

    if (!radioSite || !radioGoogle) return;

    function toggleClear() {
        if (googleClear) {
            googleClear.style.display = googleKeyword && googleKeyword.value ? 'flex' : 'none';
        }
    }

    function focusBorder(active) {
        if (googleInputWrap) {
            googleInputWrap.style.borderColor = active ? '#C0392B' : '#DCDFE4';
        }
    }

    function tryExecute(q) {
        try {
            if (window.google && window.google.search && window.google.search.cse && window.google.search.cse.element) {
                var elements = window.google.search.cse.element.getAllElements();
                var keys = Object.keys(elements);
                if (keys.length > 0) {
                    elements[keys[0]].execute(q);
                    return true;
                }
            }
        } catch (e) {}
        return false;
    }

    function doGoogleSearch() {
        var q = googleKeyword ? googleKeyword.value.trim() : '';
        if (!q) return;

        if (tryExecute(q)) return;

        // CSE chưa load xong, thử lại sau 800ms
        setTimeout(function () {
            if (!tryExecute(q)) {
                // Fallback: mở Google trong tab mới
                window.open(
                    'https://www.google.com/search?q=' + encodeURIComponent('site:baothainguyen.vn ' + q),
                    '_blank'
                );
            }
        }, 800);
    }

    if (googleKeyword) {
        googleKeyword.addEventListener('input', toggleClear);
        googleKeyword.addEventListener('focus', function () { focusBorder(true); });
        googleKeyword.addEventListener('blur', function () { focusBorder(false); });
        googleKeyword.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') doGoogleSearch();
        });
    }

    if (googleClear) {
        googleClear.addEventListener('click', function () {
            if (googleKeyword) {
                googleKeyword.value = '';
                googleKeyword.focus();
            }
            toggleClear();
        });
    }

    function applyMode() {
        var isGoogle = radioGoogle.checked;

        [btnFilters, resultCount, articleList, pagination].forEach(function (el) {
            if (el) el.style.display = isGoogle ? 'none' : '';
        });

        if (googleContainer) {
            googleContainer.style.display = isGoogle ? 'block' : 'none';
            if (isGoogle && googleKeyword) {
                if (btnKeyword) googleKeyword.value = btnKeyword.value;
                toggleClear();
                setTimeout(function () { googleKeyword.focus(); }, 50);
            }
        }
    }

    radioSite.addEventListener('change', applyMode);
    radioGoogle.addEventListener('change', applyMode);

    applyMode();
})();
