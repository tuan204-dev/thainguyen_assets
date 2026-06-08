(function () {
    function initMenu() {
        var menu = document.getElementById("main-menu");
        if (!menu) return;

        menu.querySelectorAll("ul").forEach(function (ul) {
            if (ul.querySelectorAll("li").length === 0) ul.remove();
        });

        // Wrap submenu children in .submenu-inner for CSS grid collapse animation
        menu.querySelectorAll("li > ul").forEach(function (ul) {
            if (ul.querySelector(":scope > .submenu-inner")) return;
            var inner = document.createElement("div");
            inner.className = "submenu-inner";
            while (ul.firstChild) inner.appendChild(ul.firstChild);
            ul.appendChild(inner);
        });

        // Thêm class has-submenu và span.sub-arrow cho các link có submenu
        menu.querySelectorAll("li").forEach(function (li) {
            var sub = li.querySelector(":scope > ul");
            if (!sub) return;
            var a = li.querySelector(":scope > a");
            if (!a || a.classList.contains("has-submenu")) return;
            a.classList.add("has-submenu");
            var arrow = document.createElement("span");
            arrow.className = "sub-arrow";
            a.appendChild(arrow);
        });

        var isMobile = function () {
            return window.innerWidth < 1024;
        };

        function closeSiblings(li) {
            if (!li.parentElement) return;
            li.parentElement.querySelectorAll(":scope > li").forEach(function (sibling) {
                if (sibling === li) return;
                var sub = sibling.querySelector(":scope > ul");
                if (sub) {
                    sub.classList.remove("open");
                    if (!isMobile()) sub.style.display = "";
                }
                var a = sibling.querySelector(":scope > a");
                if (a) a.classList.remove("highlighted");
            });
        }

        var hideTimers = new WeakMap();

        menu.querySelectorAll("li").forEach(function (li) {
            var sub = li.querySelector(":scope > ul");
            if (!sub) return;
            var a = li.querySelector(":scope > a");

            // Desktop: hover
            li.addEventListener("mouseenter", function () {
                if (isMobile()) return;
                clearTimeout(hideTimers.get(li));
                closeSiblings(li);
                sub.style.display = "block";
                if (a) a.classList.add("highlighted");
            });

            li.addEventListener("mouseleave", function () {
                if (isMobile()) return;
                var t = setTimeout(function () {
                    sub.style.display = "";
                    if (a) a.classList.remove("highlighted");
                }, 120);
                hideTimers.set(li, t);
            });

            if (a) {
                a.addEventListener("click", function (e) {
                    if (!isMobile()) return;
                    e.preventDefault();
                    var isOpen = sub.classList.contains("open");
                    sub.classList.toggle("open", !isOpen);
                    a.classList.toggle("highlighted", !isOpen);
                });
            }
        });

        document.addEventListener("click", function (e) {
            if (!isMobile() && !menu.contains(e.target)) {
                menu.querySelectorAll("ul").forEach(function (ul) {
                    ul.style.display = "";
                });
                menu.querySelectorAll("a.highlighted").forEach(function (a) {
                    a.classList.remove("highlighted");
                });
            }
        });
    }

    function initMobileMenuToggle() {
        var menuState = document.getElementById("main-menu-state");
        var sectionNav = document.querySelector(".section_nav_v2");
        var navbar = document.querySelector(".menutop .navbar");
        if (!menuState) return;

        menuState.addEventListener("change", function () {
            var open = this.checked;
            if (sectionNav) sectionNav.classList.toggle("menu-open", open);
            if (navbar) navbar.classList.toggle("menu-open", open);
            // Prevent page scroll while menu is open (no layout shift)
            document.documentElement.classList.toggle("menu-is-open", open);
        });
    }

    // Sticky header
    function initSticky() {
        var header = document.querySelector(".header");
        var menutop = document.querySelector(".menutop");
        if (!header || !menutop) return;
        window.addEventListener(
            "scroll",
            function () {
                menutop.classList.toggle("fixed", window.scrollY > header.offsetHeight);
            },
            { passive: true },
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            initMenu();
            initMobileMenuToggle();
            initSticky();
        });
    } else {
        initMenu();
        initMobileMenuToggle();
        initSticky();
    }
})();
