// Form khảo sát DVB-T2: kiểm tra phía client, lấy token Turnstile, gửi JSON tới data-endpoint (Cloudflare Worker).
(function () {
    var form = document.getElementById('ks-form');
    if (!form) return;
    var btn = document.getElementById('ks-submit');
    var alertBox = document.getElementById('ks-alert');
    var done = document.getElementById('ks-done');
    var khacChk = document.getElementById('uu_diem_khac_chk');
    var khacInput = form.elements.uu_diem_khac;
    var MSG_NET = 'Chưa gửi được phiếu. Vui lòng kiểm tra kết nối mạng và thử lại.';

    var rules = {
        ho_ten: function (v) { return v.trim().length >= 2; },
        to_dan_pho: function (v) { return v.trim().length > 0; },
        xa_phuong_id: function (v) { return /^\d+$/.test(v); },
        so_tivi: function (v) { return /^([1-9]|10|11\+)$/.test(v); },
        xem_dvbt2: function (v) { return /^[123]$/.test(v); },
        // Câu 2 không bắt buộc, nhưng đã tích "Khác" thì phải ghi rõ.
        uu_diem_khac: function (v) { return !khacChk.checked || v.trim().length >= 2; }
    };

    // Nhóm radio trả về RadioNodeList (không có tagName) — lấy danh sách ô nhập cụ thể.
    function inputsOf(name) {
        var el = form.elements[name];
        return el.tagName ? [el] : Array.prototype.slice.call(el);
    }

    function check(name) {
        var first = inputsOf(name)[0];
        var ok = rules[name](form.elements[name].value);
        first.closest('.ks-field').classList.toggle('is-invalid', !ok);
        inputsOf(name).forEach(function (i) { i.setAttribute('aria-invalid', String(!ok)); });
        return ok;
    }

    Object.keys(rules).forEach(function (name) {
        inputsOf(name).forEach(function (input) {
            input.addEventListener('blur', function () { if (input.value && input.type !== 'radio') check(name); });
            input.addEventListener('change', function () { check(name); });
            input.addEventListener('input', function () {
                if (input.closest('.ks-field').classList.contains('is-invalid')) check(name);
            });
        });
    });

    // Gõ ý kiến khác thì tự tích "Khác"; bỏ tích thì xoá chữ.
    khacInput.addEventListener('input', function () { khacChk.checked = !!khacInput.value.trim(); });
    khacChk.addEventListener('change', function () {
        if (khacChk.checked) khacInput.focus();
        else { khacInput.value = ''; check('uu_diem_khac'); }
    });

    function showAlert(msg) {
        alertBox.textContent = msg;
        alertBox.classList.toggle('is-show', !!msg);
    }

    // Token Turnstile chỉ dùng được 1 lần: xin token mới sau mỗi lượt gửi (kể cả khi lỗi).
    function resetCaptcha() {
        if (window.turnstile) { try { window.turnstile.reset(); } catch (e) { } }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        showAlert('');

        var firstBad = null;
        Object.keys(rules).forEach(function (name) {
            if (!check(name) && !firstBad) firstBad = name === 'uu_diem_khac' ? khacInput : inputsOf(name)[0];
        });
        if (firstBad) { firstBad.focus(); return; }
        if (form.elements.website.value) return; // bot

        var tokenInput = form.elements['cf-turnstile-response'];
        var token = tokenInput ? tokenInput.value : '';
        if (!token) {
            showAlert('Vui lòng tích vào ô "Xác minh bạn là con người" phía trên nút Gửi (nếu ô chưa hiện, đợi vài giây) rồi bấm Gửi lại.');
            return;
        }

        var payload = {
            ho_ten: form.elements.ho_ten.value.trim(),
            to_dan_pho: form.elements.to_dan_pho.value.trim(),
            xa_phuong_id: Number(form.elements.xa_phuong_id.value),
            so_tivi: form.elements.so_tivi.value, // "1".."10" hoặc "11+"
            xem_dvbt2: form.elements.xem_dvbt2.value, // "1" | "2" | "3"
            uu_diem: inputsOf('uu_diem').filter(function (i) { return i.checked; }).map(function (i) { return i.value; }),
            uu_diem_khac: khacChk.checked ? khacInput.value.trim() : '',
            turnstile_token: token
        };

        btn.disabled = true;
        btn.textContent = 'Đang gửi...';

        fetch(form.getAttribute('data-endpoint'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function (r) {
            if (r.ok) return;
            // Lỗi do server trả về (dữ liệu sai, gửi quá nhanh...) thì hiện đúng câu của server.
            return r.json().catch(function () { return {}; }).then(function (d) {
                throw new Error(d.error || MSG_NET);
            });
        }).then(function () {
            form.style.display = 'none';
            done.classList.add('is-show');
            reloadList();
            done.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }).catch(function (err) {
            showAlert(err instanceof TypeError ? MSG_NET : err.message);
        }).finally(function () {
            resetCaptcha();
            btn.disabled = false;
            btn.textContent = 'Gửi phiếu khảo sát';
        });
    });

    // Danh sách hộ đã tham gia: GET data-endpoint của #ks-list (20 dòng/trang, mới nhất trước).
    var reloadList = function () { };
    var list = document.getElementById('ks-list');
    if (list) {
        var lf = list.querySelector('.ks-list__filter');
        var wrapEl = list.querySelector('.ks-list__wrap');
        var tbody = list.querySelector('tbody');
        var countEl = list.querySelector('.ks-list__count');
        var emptyEl = list.querySelector('.ks-list__empty');
        var pager = list.querySelector('.ks-pager');
        var state = { page: 1, pages: 1, q: '', xa: '' };

        // Ô lọc chép đúng các nhóm xã, phường của phiếu ⇒ danh sách 45 đơn vị chỉ nằm một chỗ.
        Array.prototype.forEach.call(form.elements.xa_phuong_id.querySelectorAll('optgroup'), function (g) {
            lf.elements.xa.appendChild(g.cloneNode(true));
        });

        var cell = function (text, cls) {
            var td = document.createElement('td');
            td.textContent = text;
            if (cls) td.className = cls;
            return td;
        };

        var load = function () {
            var p = new URLSearchParams({ page: String(state.page) });
            if (state.q) p.set('q', state.q);
            if (state.xa) p.set('xa', state.xa);
            list.classList.add('is-loading');
            fetch(list.getAttribute('data-endpoint') + '?' + p).then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            }).then(function (d) {
                var filtered = !!(state.q || state.xa);
                state.pages = Math.max(1, Math.ceil(d.total / d.page_size));
                tbody.textContent = '';
                // OverlayScrollbars cuộn trên viewport con của nó; chưa khởi tạo thì cuộn chính wrap.
                (wrapEl.querySelector('[data-overlayscrollbars-viewport]') || wrapEl).scrollTop = 0;
                d.items.forEach(function (it) {
                    var tr = document.createElement('tr');
                    tr.appendChild(cell(it.stt, 'ks-table__stt'));
                    tr.appendChild(cell(it.ho_ten));
                    tr.appendChild(cell(it.to_dan_pho));
                    tr.appendChild(cell(it.xa_phuong));
                    tbody.appendChild(tr);
                });
                countEl.textContent = (filtered ? 'Tìm thấy ' : 'Đã có ') + d.total.toLocaleString('vi-VN') + ' hộ' + (filtered ? '' : ' tham gia');
                emptyEl.hidden = d.items.length > 0;
                emptyEl.textContent = filtered ? 'Không tìm thấy hộ nào phù hợp.' : 'Chưa có hộ nào tham gia khảo sát.';
                pager.hidden = state.pages < 2;
                pager.querySelector('.ks-pager__info').textContent = 'Trang ' + state.page + '/' + state.pages;
                pager.querySelector('[data-go="-1"]').disabled = state.page <= 1;
                pager.querySelector('[data-go="1"]').disabled = state.page >= state.pages;
            }).catch(function () {
                tbody.textContent = '';
                emptyEl.hidden = false;
                emptyEl.textContent = 'Chưa tải được danh sách. Vui lòng thử lại sau.';
                pager.hidden = true;
            }).finally(function () {
                list.classList.remove('is-loading');
            });
        };

        lf.addEventListener('submit', function (e) {
            e.preventDefault();
            state.q = lf.elements.q.value.trim();
            state.xa = lf.elements.xa.value;
            state.page = 1;
            load();
        });
        lf.elements.xa.addEventListener('change', function () { lf.requestSubmit(); });
        pager.addEventListener('click', function (e) {
            var go = Number(e.target.getAttribute('data-go'));
            if (!go) return;
            state.page = Math.min(state.pages, Math.max(1, state.page + go));
            load();
            list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        reloadList = function () { state.page = 1; load(); };
        load();
    }

    document.getElementById('ks-again').addEventListener('click', function () {
        form.reset();
        form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
        showAlert('');
        done.classList.remove('is-show');
        form.style.display = '';
        form.elements.ho_ten.focus();
    });
})();
