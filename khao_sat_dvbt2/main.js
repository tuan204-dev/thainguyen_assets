// Form khảo sát DVB-T2: kiểm tra phía client, lấy token Turnstile, gửi JSON tới data-endpoint (Cloudflare Worker).
(function () {
    var form = document.getElementById('ks-form');
    if (!form) return;
    var btn = document.getElementById('ks-submit');
    var alertBox = document.getElementById('ks-alert');
    var done = document.getElementById('ks-done');
    var MSG_NET = 'Chưa gửi được phiếu. Vui lòng kiểm tra kết nối mạng và thử lại.';

    var rules = {
        ho_ten: function (v) { return v.trim().length >= 2; },
        to_dan_pho: function (v) { return v.trim().length > 0; },
        xa_phuong_id: function (v) { return /^\d+$/.test(v); },
        so_tivi: function (v) { return /^([1-9]|10|11\+)$/.test(v); }
    };

    function check(name) {
        var input = form.elements[name];
        var ok = rules[name](input.value);
        input.closest('.ks-field').classList.toggle('is-invalid', !ok);
        input.setAttribute('aria-invalid', String(!ok));
        return ok;
    }

    Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        input.addEventListener('blur', function () { if (input.value) check(name); });
        input.addEventListener('change', function () { check(name); });
        input.addEventListener('input', function () {
            if (input.closest('.ks-field').classList.contains('is-invalid')) check(name);
        });
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
            if (!check(name) && !firstBad) firstBad = form.elements[name];
        });
        if (firstBad) { firstBad.focus(); return; }
        if (form.elements.website.value) return; // bot

        var tokenInput = form.elements['cf-turnstile-response'];
        var token = tokenInput ? tokenInput.value : '';
        if (!token) {
            showAlert('Đang xác minh chống spam, vui lòng đợi vài giây rồi bấm Gửi lại.');
            return;
        }

        var payload = {
            ho_ten: form.elements.ho_ten.value.trim(),
            to_dan_pho: form.elements.to_dan_pho.value.trim(),
            xa_phuong_id: Number(form.elements.xa_phuong_id.value),
            so_tivi: form.elements.so_tivi.value, // "1".."10" hoặc "11+"
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
            done.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }).catch(function (err) {
            showAlert(err instanceof TypeError ? MSG_NET : err.message);
        }).finally(function () {
            resetCaptcha();
            btn.disabled = false;
            btn.textContent = 'Gửi phiếu khảo sát';
        });
    });

    document.getElementById('ks-again').addEventListener('click', function () {
        form.reset();
        form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
        showAlert('');
        done.classList.remove('is-show');
        form.style.display = '';
        form.elements.ho_ten.focus();
    });
})();
