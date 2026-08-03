/**
 * 404 — nạp "Có thể bạn quan tâm" + nút Quay lại.
 *
 * ⚠️ Trang 404 được site-go render với SQLParams = nil (page.go renderNotFound), nên
 * KHÔNG portlet nào trên layout này được dùng datasource. Danh sách bài vì thế phải
 * lấy qua REST public_api ở client, kèm header x-department-id đọc từ #page_info.
 */
(function () {
    var pageInfo = document.getElementById("page_info");

    function cfg(name, fallback) {
        var v = pageInfo ? pageInfo.getAttribute("data-" + name) || "" : "";
        v = v.trim().replace(/\/+$/, "");
        return v || fallback || "";
    }

    var PUBLIC_API_URL = cfg("public-api-url", "https://api-public.baothainguyen.vn");
    var CDN_URL = cfg("cdn-url", "https://cdn.baothainguyen.vn");
    var DEPARTMENT_ID = cfg("department-id", "");
    var BASE_IMAGE_URL = CDN_URL + "/w500/";
    var LIMIT = 6;

    function withDepartmentHeaders(baseHeaders) {
        var headers = Object.assign({}, baseHeaders || {});
        if (DEPARTMENT_ID) headers["x-department-id"] = DEPARTMENT_ID;
        return headers;
    }

    function escapeHtml(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function normalizeHref(slug) {
        var s = String(slug || "").trim();
        if (!s) return "#";
        if (/^https?:\/\//i.test(s)) return s;
        return "/" + s.replace(/^\/+/, "");
    }

    function imageUrl(path) {
        var p = String(path || "").trim();
        if (!p) return "";
        if (/^https?:\/\//i.test(p)) return p;
        return BASE_IMAGE_URL + p.replace(/^\/+/, "");
    }

    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function formatDate(iso) {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return "";
        return (
            pad(d.getHours()) +
            ":" +
            pad(d.getMinutes()) +
            " | " +
            pad(d.getDate()) +
            "/" +
            pad(d.getMonth() + 1) +
            "/" +
            d.getFullYear()
        );
    }

    function card(a) {
        var href = normalizeHref(a.slug);
        var title = escapeHtml(a.title || "Đang cập nhật");
        var img = imageUrl(a.avatar1_url || a.avatar2_url);
        var date = formatDate(a.publish_date);
        return (
            '<article class="t:flow-root">' +
            (img
                ? '<figure class="img-block t:mb-2.5 t:w-full! t:max-w-full!"><a href="' +
                  href +
                  '"><img src="' +
                  escapeHtml(img) +
                  '" alt="' +
                  title +
                  '" loading="lazy" width="500" height="281"></a></figure>'
                : "") +
            '<h3 class="title l3"><a href="' +
            href +
            '">' +
            title +
            "</a></h3>" +
            (date
                ? '<time class="article-date t:mt-2 t:block t:text-xs t:text-[#667085]">' +
                  date +
                  "</time>"
                : "") +
            "</article>"
        );
    }

    function renderMessage(listEl, text) {
        listEl.innerHTML =
            '<div class="t:col-span-full t:py-8 t:text-center t:text-sm t:text-[#667085]">' +
            text +
            "</div>";
    }

    var listEl = document.getElementById("notfound-latest-list");
    if (listEl) {
        fetch(
            PUBLIC_API_URL + "/v1/article?limit=" + LIMIT + "&sortBy=publish_date&sortOrder=DESC",
            { headers: withDepartmentHeaders({ Accept: "application/json" }) },
        )
            .then(function (r) {
                return r.json();
            })
            .then(function (json) {
                var items = json && Array.isArray(json.data) ? json.data : [];
                items = items.filter(function (a) {
                    return a && a.slug && a.publish_date;
                });
                if (!items.length) {
                    renderMessage(listEl, "Chưa có bài viết.");
                    return;
                }
                listEl.innerHTML = items.slice(0, LIMIT).map(card).join("");
                if (typeof window.clampByWordsFromTailwind === "function") {
                    window.clampByWordsFromTailwind(listEl);
                }
            })
            .catch(function () {
                renderMessage(listEl, "Không tải được bài viết.");
            });
    }

    var backBtn = document.getElementById("nf-back");
    if (backBtn) {
        backBtn.addEventListener("click", function () {
            if (window.history.length > 1) window.history.back();
            else window.location.href = "/";
        });
    }
})();
