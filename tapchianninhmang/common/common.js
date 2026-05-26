function getTextTarget(el) {
    let target = el;
    while (target.children.length === 1 && target.firstElementChild) {
        target = target.firstElementChild;
    }
    return target;
}

function clampByWordsFromTailwind(el) {
    const clampClass = [...el.classList].find(c => c.includes('line-clamp-'));

    const maxLines = clampClass
        ? parseInt(clampClass.split('line-clamp-')[1], 10)
        : 3;

    if (!maxLines) return;

    if (el.classList.contains('desc')) {
        el.style.overflow = 'unset';
        el.style.display = 'block';
    }

    const target = getTextTarget(el);

    if (!target.dataset.originalText) {
        target.dataset.originalText = target.innerText.trim();
    }
    const originalText = target.dataset.originalText;
    const words = originalText.split(/\s+/);

    target.innerText = originalText;

    const style = getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight);
    const computedLineHeight = isNaN(lineHeight)
        ? parseFloat(style.fontSize) * 1.6
        : lineHeight;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const maxHeight = Math.ceil(computedLineHeight * maxLines) + paddingTop + paddingBottom;

    if (el.scrollHeight <= maxHeight) return;

    let lo = 0, hi = words.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        target.innerText = words.slice(0, mid + 1).join(' ') + '…';
        if (el.scrollHeight <= maxHeight) {
            lo = mid;
        } else {
            hi = mid - 1;
        }
    }

    target.innerText = lo >= 0
        ? words.slice(0, lo + 1).join(' ') + '…'
        : '…';

}

function handleClampText() {
    document.querySelectorAll('.desc, [class*="line-clamp-"]').forEach(el => {
        clampByWordsFromTailwind(el);
    });
}

function handleLazyImages() {
    if (typeof IntersectionObserver === 'undefined') {
        document.querySelectorAll('img.loading[data-width-image]').forEach(function (img) {
            swapSrc(img);
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                swapSrc(entries[i].target);
                observer.unobserve(entries[i].target);
            }
        }
    }, { rootMargin: '300px 0px' });

    document.querySelectorAll('img.loading[data-width-image]').forEach(function (img) {
        observer.observe(img);
    });

    function swapSrc(img) {
        var width = img.getAttribute('data-width-image');
        if (!width || !img.src) return;

        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        var cappedWidth = Math.ceil(viewportWidth / 50) * 50;

        var requested = width === 'original' ? Infinity : parseInt(width, 10);
        var finalWidth = requested > viewportWidth ? cappedWidth : requested;

        var replacement = '/w' + finalWidth + '/';
        img.src = img.src.replace(/\/w50\//, replacement);
        img.classList.remove('loading');
    }
}

const prefetchedHrefs = new Set();
const observedLinks = new WeakSet();
let linkObserver = null;
const supportsLinkPrefetch = (() => {
    try {
        const l = document.createElement('link');
        return !!(l.relList && l.relList.supports && l.relList.supports('prefetch'));
    } catch (e) {
        return false;
    }
})();

function shouldPrefetchHref(href) {
    if (!href) return false;
    if (prefetchedHrefs.has(href)) return false;
    let url;
    try {
        url = new URL(href, location.href);
    } catch (e) {
        return false;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.search === location.search) return false;
    return true;
}

function schedulePrefetch(href) {
    if (prefetchedHrefs.has(href)) return;
    prefetchedHrefs.add(href);
    const run = () => {
        if (supportsLinkPrefetch) {
            const l = document.createElement('link');
            l.rel = 'prefetch';
            l.as = 'document';
            l.href = href;
            document.head.appendChild(l);
        } else {
            fetch(href, { credentials: 'same-origin', priority: 'low' }).catch(() => {});
        }
    };
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(run, { timeout: 2000 });
    } else {
        setTimeout(run, 0);
    }
}

function handleLinkPrefetch() {
    if (typeof IntersectionObserver === 'undefined') return;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;

    if (!linkObserver) {
        linkObserver = new IntersectionObserver((entries) => {
            for (let i = 0; i < entries.length; i++) {
                if (!entries[i].isIntersecting) continue;
                const a = entries[i].target;
                linkObserver.unobserve(a);
                const abs = a.href;
                if (shouldPrefetchHref(abs)) schedulePrefetch(abs);
            }
        }, { rootMargin: '200px 0px' });
    }

    document.querySelectorAll('a[href]:not([data-no-prefetch])').forEach(a => {
        if (observedLinks.has(a)) return;
        if (!shouldPrefetchHref(a.href)) return;
        observedLinks.add(a);
        linkObserver.observe(a);
    });
}

let resizeTimer;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleLazyImages);
    document.addEventListener('DOMContentLoaded', handleLinkPrefetch);
} else {
    handleLazyImages();
    handleLinkPrefetch();
}
if (document.readyState === 'complete') {
    handleClampText();
} else {
    window.addEventListener('load', handleClampText);
}

handleClampText()
handleLazyImages()
handleLinkPrefetch()

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        handleClampText();
        handleLazyImages();
        handleLinkPrefetch();
    }, 150);
});

function isLazyImagesDone() {
    return document.querySelectorAll('img.loading[data-width-image]').length === 0;
}

function isClampTextDone() {
    const els = document.querySelectorAll('.desc, [class*="line-clamp-"]');
    return Array.from(els).every(el => {
        const target = getTextTarget(el);
        return target.dataset && target.dataset.originalText !== undefined;
    });
}

function ensureHandlersRun() {
    const STORAGE_KEY = 'common-handlers-ran';
    const MAX_ATTEMPTS = 40;
    let attempts = 0;

    const intervalId = setInterval(() => {
        attempts++;
        handleClampText();
        handleLazyImages();
        handleLinkPrefetch();

        if (isLazyImagesDone() && isClampTextDone()) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    path: location.pathname,
                    ranAt: Date.now(),
                    attempts: attempts
                }));
            } catch (e) {}
            clearInterval(intervalId);
        } else if (attempts >= MAX_ATTEMPTS) {
            clearInterval(intervalId);
        }
    }, 300);
}

ensureHandlersRun();