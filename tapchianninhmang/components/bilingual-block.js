(function () {
    if (window.__bilingualBlockReady) return;
    window.__bilingualBlockReady = true;

    function activate(block, lang) {
        var children = block.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!child.classList) continue;

            if (child.classList.contains('lang-tabs')) {
                var tabs = child.children;
                for (var j = 0; j < tabs.length; j++) {
                    tabs[j].classList.toggle('active', tabs[j].getAttribute('data-lang') === lang);
                }
            } else if (child.classList.contains('lang-section')) {
                child.classList.toggle('active', child.getAttribute('data-lang') === lang);
            }
        }
    }

    document.addEventListener('click', function (e) {
        var tab = e.target.closest && e.target.closest('.lang-tab');
        if (!tab) return;

        var block = tab.closest('.bilingual-block');
        if (!block || block.classList.contains('for-editor')) return;

        var lang = tab.getAttribute('data-lang');
        if (!lang) return;

        activate(block, lang);
    });
})();
