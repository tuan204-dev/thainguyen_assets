import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Kiểm `common/engage.js` bằng một DOM giả tối giản.
 *
 * ═══ VÌ SAO KHÔNG DÙNG jsdom ═══
 * Đây là repo ASSET, không phải repo ứng dụng. Thêm jsdom/happy-dom vào đây là thêm ~10 MB
 * dependency cho một tệp 4 KB. Stub dưới đây chỉ dựng đúng những gì script CHẠM tới, và chính vì
 * nó nhỏ nên nó cũng là tài liệu chính xác về bề mặt API mà script phụ thuộc.
 *
 * ═══ ĐIỀU ĐANG ĐƯỢC BẢO VỆ ═══
 * Mọi lỗi ở đây đều HỎNG IM LẶNG: script không ném lỗi, không log gì, chỉ đơn giản là không gửi
 * gì cả. Triệu chứng duy nhất là một bảng số liệu trống — thứ không phân biệt được với "chưa có
 * lưu lượng". Bốn cửa bail, hai dạng #page_info, và cả hai đường ra vì thế phải có test.
 */

const SOURCE = readFileSync(join(import.meta.dir, '../common/engage.js'), 'utf8');

interface Beacon {
    url: string;
    payload: Record<string, unknown>;
    headers?: Record<string, string>;
}

interface Run {
    /** POST /v1/page-engagement — đo hành vi (qua sendBeacon). */
    beacons: Beacon[];
    /** POST /v1/event-log — ĐẾM view chuyên mục (qua fetch). */
    events: Beacon[];
    /** Script được chèn vào <head> lúc chạy — để khẳng định rrweb có bị tải hay không. */
    injectedScripts: string[];
    /** Khoá đã ghi vào localStorage giả. */
    storage: Record<string, string>;
}

interface Options {
    /** 'attr' = kiểu thainguyen (data-* trên khối); 'child' = kiểu cms_dev (div con). */
    shape?: 'attr' | 'child' | 'none';
    articleId?: string;
    categoryId?: string;
    departmentId?: string;
    pathname?: string;
    search?: string;
    doNotTrack?: string | null;
    gpc?: boolean;
    dataApi?: string | null;
    publicApiUrl?: string;
    sample?: string;
    catView?: string | null;
    dataRec?: string | null;
    recSample?: string | null;
    rrwebSrc?: string | null;
    /** 'loading' + pageInfoLate:true mô phỏng script async chạy TRƯỚC khi <body> được phân tích. */
    readyState?: string;
    pageInfoLate?: boolean;
    hidden?: boolean;
    storageThrows?: boolean;
    seedUserId?: string;
    /** Một <div id="article_id"> LẠC ở thân trang, NGOÀI khối #page_info. */
    strayArticleId?: string;
}

function runFull(opts: Options = {}): Run {
    const {
        shape = 'attr',
        articleId = '1388957',
        categoryId = '2651',
        departmentId = '2',
        pathname = '/tin-tuc/bai-viet-abc',
        search = '',
        doNotTrack = null,
        gpc = false,
        dataApi = 'https://api-public.example.vn',
        publicApiUrl = '',
        sample = '1',
        catView = null,
        dataRec = null,
        recSample = null,
        rrwebSrc = null,
        readyState = 'complete',
        pageInfoLate = false,
        hidden = false,
        storageThrows = false,
        seedUserId = '',
        strayArticleId = '',
    } = opts;

    const beacons: Beacon[] = [];
    const events: Beacon[] = [];
    const injectedScripts: string[] = [];
    const listeners = new Map<string, Array<(ev: unknown) => void>>();
    const docListeners = new Map<string, Array<(ev: unknown) => void>>();
    const timeouts: Array<() => void> = [];
    const storage: Record<string, string> = seedUserId ? { user_id: seedUserId } : {};

    const el = (attrs: Record<string, string>, text = '') => ({
        getAttribute: (k: string) => (k in attrs ? attrs[k] : null),
        textContent: text,
        closest: () => null,
    });

    const children: Record<string, ReturnType<typeof el>> = {};
    let pageInfo: ReturnType<typeof el> | null = null;

    if (shape === 'attr') {
        pageInfo = el({
            'data-article-id': articleId,
            'data-category-id': categoryId,
            'data-department-id': departmentId,
            'data-public-api-url': publicApiUrl,
        });
    } else if (shape === 'child') {
        pageInfo = el({});
        if (articleId) children.article_id = el({}, articleId);
        if (categoryId) children.category_id = el({}, categoryId);
        if (departmentId) children.department_id = el({}, departmentId);
        if (publicApiUrl) children.public_api_url = el({}, publicApiUrl);
        (pageInfo as Record<string, unknown>).querySelector = (sel: string) =>
            children[sel.replace('#', '')] ?? null;
    }

    /** Khi pageInfoLate, #page_info CHƯA tồn tại lúc script chạy — chỉ hiện sau DOMContentLoaded. */
    let pageInfoVisible = !pageInfoLate;

    const scriptEl = el({
        ...(dataApi ? { 'data-api': dataApi } : {}),
        'data-sample': sample,
        ...(catView ? { 'data-cat-view': catView } : {}),
        ...(dataRec ? { 'data-rec': dataRec } : {}),
        ...(recSample ? { 'data-rec-sample': recSample } : {}),
        ...(rrwebSrc ? { 'data-rrweb': rrwebSrc } : {}),
    });

    const doc = {
        currentScript: scriptEl,
        readyState,
        addEventListener: (type: string, fn: (ev: unknown) => void) => {
            docListeners.set(type, [...(docListeners.get(type) ?? []), fn]);
        },
        getElementById: (id: string) => {
            if (id === 'page_info') return pageInfoVisible ? pageInfo : null;
            // Phần tử LẠC ở thân trang: chỉ thấy được qua document, KHÔNG qua #page_info.
            if (id === 'article_id' && strayArticleId) return el({}, strayArticleId);
            return children[id] ?? null;
        },
        querySelectorAll: () => [],
        createElement: () => ({ async: false, src: '', onload: null }) as Record<string, unknown>,
        head: {
            appendChild: (node: { src?: string }) => {
                injectedScripts.push(String(node.src ?? ''));
            },
        },
        querySelector: (sel: string) => children[sel.replace('#', '')] ?? null,
        visibilityState: hidden ? 'hidden' : 'visible',
        referrer: 'https://www.google.com/search?q=bi-mat',
        body: { scrollHeight: 4200 },
        documentElement: { scrollHeight: 4200, clientWidth: 1440 },
    };

    const globals = {
        document: doc,
        navigator: {
            doNotTrack,
            globalPrivacyControl: gpc,
            sendBeacon: (url: string, body: { __text: string }) => {
                beacons.push({ url, payload: JSON.parse(body.__text) });
                return true;
            },
        },
        localStorage: {
            getItem: (k: string) => {
                if (storageThrows) throw new Error('SecurityError');
                return k in storage ? storage[k] : null;
            },
            setItem: (k: string, v: string) => {
                if (storageThrows) throw new Error('SecurityError');
                storage[k] = v;
            },
        },
        location: { pathname, search, hostname: 'example.vn' },
        Blob: class {
            __text: string;
            constructor(parts: string[]) {
                this.__text = parts.join('');
            }
        },
        URL,
        addEventListener: (type: string, fn: (ev: unknown) => void) => {
            listeners.set(type, [...(listeners.get(type) ?? []), fn]);
        },
        setInterval: () => 0,
        clearInterval: () => undefined,
        setTimeout: (fn: () => void) => {
            timeouts.push(fn);
            return timeouts.length;
        },
        fetch: (url: string, init: { headers?: Record<string, string>; body?: unknown }) => {
            const raw = init && init.body;
            const text = typeof raw === 'string' ? raw : String((raw as { __text?: string })?.__text ?? '{}');
            events.push({ url, payload: JSON.parse(text), headers: init?.headers ?? {} });
            return { catch: () => undefined };
        },
        window: { innerWidth: 1440, innerHeight: 900, pageYOffset: 0 },
        innerWidth: 1440,
        innerHeight: 900,
        pageYOffset: 0,
        Math,
        Date,
        JSON,
        Object,
        parseInt,
        parseFloat,
        isNaN,
    };

    // eslint-disable-next-line no-new-func
    const fn = new Function(...Object.keys(globals), `${SOURCE}\n;return arguments;`);
    fn(...Object.values(globals));

    // Bộ phân tích cú pháp đi hết trang ⇒ #page_info xuất hiện ⇒ DOMContentLoaded.
    if (pageInfoLate) {
        pageInfoVisible = true;
        for (const cb of docListeners.get('DOMContentLoaded') ?? []) cb({});
    }

    // 3 giây trôi qua ⇒ bộ đếm chuyên mục bắn.
    for (const t of timeouts.splice(0)) t();

    // Rời trang ⇒ script phải gửi beacon đo hành vi.
    for (const cb of listeners.get('pagehide') ?? []) cb({});
    return { beacons, events, injectedScripts, storage };
}

function run(opts: Options = {}): Beacon[] {
    return runFull(opts).beacons;
}

describe('bốn cửa bail — mỗi cửa hỏng là HỎNG IM LẶNG', () => {
    it('gửi beacon khi mọi điều kiện hợp lệ (kiểu thainguyen: data-*)', () => {
        const b = run({ shape: 'attr' });
        expect(b).toHaveLength(1);
        expect(b[0].payload.target_type).toBe('ARTICLE');
        expect(b[0].payload.target_id).toBe(1388957);
    });

    it('gửi beacon với kiểu cms_dev: phần tử con mang giá trị', () => {
        const b = run({ shape: 'child' });
        expect(b).toHaveLength(1);
        expect(b[0].payload.target_id).toBe(1388957);
        expect(b[0].payload.sub_target_id).toBe(2651);
    });

    it('cửa 1 — không có cả article_id lẫn category_id ⇒ im lặng', () => {
        expect(run({ articleId: '', categoryId: '' })).toHaveLength(0);
        expect(run({ shape: 'child', articleId: '', categoryId: '' })).toHaveLength(0);
    });

    it('cửa 1 — chỉ có category_id ⇒ đo trang CHUYÊN MỤC', () => {
        const b = run({ articleId: '' });
        expect(b).toHaveLength(1);
        expect(b[0].payload.target_type).toBe('CATEGORY');
        expect(b[0].payload.target_id).toBe(2651);
    });

    it('cửa 2 — mọi đường xem trước đều im lặng', () => {
        for (const pathname of ['/preview', '/p', '/p/m/abc', '/preview/bai-viet']) {
            expect(run({ pathname }), `pathname ${pathname}`).toHaveLength(0);
        }
        expect(run({ search: '?token=abc123' })).toHaveLength(0);
    });

    it('cửa 3 — tôn trọng doNotTrack và globalPrivacyControl', () => {
        expect(run({ doNotTrack: '1' })).toHaveLength(0);
        expect(run({ gpc: true })).toHaveLength(0);
        expect(run({ doNotTrack: '0' })).toHaveLength(1);
    });

    it('không có nơi để gửi ⇒ im lặng, không nổ', () => {
        expect(run({ dataApi: null, publicApiUrl: '' })).toHaveLength(0);
        expect(run({ dataApi: null, publicApiUrl: 'https://api.example.vn' })).toHaveLength(1);
        expect(run({ shape: 'child', dataApi: null, publicApiUrl: 'https://api.example.vn' })).toHaveLength(1);
    });

    it('lấy mẫu 0 ⇒ không đo hành vi', () => {
        expect(run({ sample: '0' })).toHaveLength(0);
    });
});

/**
 * ⭐ NHÓM TEST QUAN TRỌNG NHẤT CHO ĐỢT TRIỂN KHAI NÀY.
 *
 * Đo trên layout thật của Thái Nguyên (09/09/2026): `</head>` kết thúc ở byte 3575 của layout 253
 * và `cate_page_info` bắt đầu ở 3636 — `#page_info` là thứ ĐẦU TIÊN trong <body>, ngay sau thẻ
 * script. Với `async`, một tệp 4 KB lấy từ cache đĩa gần như luôn chạy xong trước khi bộ phân
 * tích cú pháp đi hết trang.
 *
 * Không hoãn thì script đọc ra null, bail ở cửa 1, và KHÔNG ghi gì trên toàn bộ 90 layout.
 */
describe('⭐ script async chạy TRƯỚC khi #page_info tồn tại', () => {
    it('#page_info chưa có + readyState=loading ⇒ hoãn tới DOMContentLoaded rồi vẫn gửi', () => {
        const r = runFull({ readyState: 'loading', pageInfoLate: true });
        expect(r.beacons).toHaveLength(1);
        expect(r.beacons[0].payload.target_id).toBe(1388957);
    });

    it('hoãn rồi vẫn đếm được view chuyên mục', () => {
        const r = runFull({ readyState: 'loading', pageInfoLate: true, articleId: '', catView: '1' });
        expect(r.events).toHaveLength(1);
        expect(r.events[0].payload.target_type).toBe('CATEGORY');
    });

    it('#page_info đã có sẵn ⇒ chạy NGAY, không đợi DOMContentLoaded', () => {
        // readyState vẫn 'loading' nhưng khối đã tồn tại — không có lý do gì để hoãn.
        const r = runFull({ readyState: 'loading', pageInfoLate: false });
        expect(r.beacons).toHaveLength(1);
    });

    it('trang không bao giờ có #page_info (404) ⇒ im lặng, không treo', () => {
        const r = runFull({ shape: 'none', readyState: 'complete' });
        expect(r.beacons).toHaveLength(0);
        expect(r.events).toHaveLength(0);
    });
});

/**
 * ⭐ ĐẾM VIEW CHUYÊN MỤC — đường /v1/event-log.
 * Đây là con số TOÀ SOẠN NHÌN THẤY (event_stats). Đếm đôi hoặc đếm hụt đều là lỗi nghiệp vụ,
 * không phải lỗi đo lường.
 */
describe('⭐ đếm view chuyên mục (POST /v1/event-log)', () => {
    it('trang chuyên mục + data-cat-view=1 ⇒ gửi ĐÚNG MỘT sự kiện CATEGORY/VIEW', () => {
        const r = runFull({ articleId: '', catView: '1' });
        expect(r.events).toHaveLength(1);
        expect(r.events[0].url).toBe('https://api-public.example.vn/v1/event-log');
        expect(r.events[0].payload).toMatchObject({
            target_id: 2651,
            target_type: 'CATEGORY',
            event_type: 'VIEW',
        });
    });

    it('⛔ trang BÀI KHÔNG BAO GIỜ đếm — portlet event_count đã đếm rồi', () => {
        // Bỏ chốt này là đếm đôi MỌI lượt xem bài của toà soạn.
        const r = runFull({ articleId: '1388957', catView: '1' });
        expect(r.events).toHaveLength(0);
    });

    it('không bật data-cat-view ⇒ không đếm gì', () => {
        expect(runFull({ articleId: '' }).events).toHaveLength(0);
        expect(runFull({ articleId: '', catView: '0' }).events).toHaveLength(0);
    });

    it('chỉ trang 1 — ?page=2 trở đi không đếm', () => {
        expect(runFull({ articleId: '', catView: '1', search: '?page=2' }).events).toHaveLength(0);
        expect(runFull({ articleId: '', catView: '1', search: '?page=17' }).events).toHaveLength(0);
        expect(runFull({ articleId: '', catView: '1', search: '?page=1' }).events).toHaveLength(1);
        expect(runFull({ articleId: '', catView: '1', search: '?q=abc' }).events).toHaveLength(1);
    });

    it('tab ẩn ⇒ không đếm (mở-trong-tab-mới không phải một lượt đọc)', () => {
        expect(runFull({ articleId: '', catView: '1', hidden: true }).events).toHaveLength(0);
    });

    it('⛔ KHÔNG gửi sub_target_id — trên hàng ARTICLE nó chở category_id', () => {
        const r = runFull({ articleId: '', catView: '1' });
        expect(Object.keys(r.events[0].payload)).not.toContain('sub_target_id');
    });

    it('gửi x-department-id để api tách được đơn vị', () => {
        const r = runFull({ articleId: '', catView: '1', departmentId: '4' });
        expect(r.events[0].headers?.['x-department-id']).toBe('4');
    });

    it('dùng CHUNG khoá localStorage user_id với portlet event_count', () => {
        const r = runFull({ articleId: '', catView: '1', seedUserId: 'user_abc123xyz' });
        expect(r.events[0].payload.anon_id).toBe('user_abc123xyz');
        // Không được ghi đè danh tính đã có.
        expect(r.storage.user_id).toBe('user_abc123xyz');
    });

    it('chưa có user_id ⇒ sinh mới ĐÚNG khuôn của portlet event_count và lưu lại', () => {
        const r = runFull({ articleId: '', catView: '1' });
        expect(String(r.events[0].payload.anon_id)).toMatch(/^user_[a-z0-9]{1,9}$/);
        expect(r.storage.user_id).toBe(r.events[0].payload.anon_id);
    });

    it('localStorage bị chặn (chế độ riêng tư) ⇒ VẪN đếm', () => {
        // Bỏ qua họ là ngầm giảm số của chuyên mục theo cấu hình trình duyệt của bạn đọc.
        const r = runFull({ articleId: '', catView: '1', storageThrows: true });
        expect(r.events).toHaveLength(1);
        expect(String(r.events[0].payload.anon_id)).toMatch(/^user_/);
    });

    /**
     * ⭐ `data-sample` làm THƯA phép đo hành vi. Nếu nó cũng làm thưa bộ đếm thì hạ nó xuống 0,1
     * là lượt xem chuyên mục tụt còn một phần mười — và không có gì trên màn hình nói rằng con số
     * đã bị chia.
     */
    it('⭐ data-sample=0 vẫn đếm view đầy đủ (hai khoá, hai ý nghĩa)', () => {
        const r = runFull({ articleId: '', catView: '1', sample: '0' });
        expect(r.beacons).toHaveLength(0); // đo hành vi: tắt
        expect(r.events).toHaveLength(1);  // bộ đếm: nguyên vẹn
    });

    it('bốn cửa bail áp cho CẢ bộ đếm', () => {
        expect(runFull({ articleId: '', catView: '1', doNotTrack: '1' }).events).toHaveLength(0);
        expect(runFull({ articleId: '', catView: '1', gpc: true }).events).toHaveLength(0);
        expect(runFull({ articleId: '', catView: '1', pathname: '/preview' }).events).toHaveLength(0);
        expect(runFull({ articleId: '', catView: '1', search: '?token=x' }).events).toHaveLength(0);
        expect(runFull({ articleId: '', categoryId: '', catView: '1' }).events).toHaveLength(0);
    });
});

describe('⛔ payload đo hành vi KHÔNG được chứa gì', () => {
    it('không có URL, referrer đầy đủ, query string hay bất kỳ định danh nào', () => {
        const [b] = run();
        const flat = JSON.stringify(b.payload);
        for (const forbidden of ['bai-viet-abc', 'google.com', 'bi-mat', 'token', 'example.vn']) {
            expect(flat, `payload lộ ${forbidden}`).not.toContain(forbidden);
        }
        for (const key of ['url', 'href', 'referrer', 'anon_id', 'user_id', 'ip', 'session_id']) {
            expect(Object.keys(b.payload), `payload có khoá ${key}`).not.toContain(key);
        }
    });

    it('nguồn vào gói trong ĐÚNG MỘT ký tự', () => {
        const [b] = run();
        expect(b.payload.referrer_kind).toBe('s');
        expect(String(b.payload.referrer_kind)).toHaveLength(1);
    });

    it('mảng chú ý LUÔN đúng 10 phần tử', () => {
        const [b] = run();
        expect(b.payload.attention).toHaveLength(10);
    });

    it('gửi tới đúng đường dẫn, không nhân đôi dấu gạch', () => {
        const r = runFull({ dataApi: 'https://api.example.vn/', articleId: '', catView: '1' });
        expect(r.beacons[0].url).toBe('https://api.example.vn/v1/page-engagement');
        expect(r.events[0].url).toBe('https://api.example.vn/v1/event-log');
    });
});

/**
 * ⛔ GHI PHIÊN KHÔNG CÓ TRONG BẢN NÀY — và test này tồn tại để giữ nguyên điều đó.
 *
 * Đây là một quyết định PHÁP LÝ, không phải kỹ thuật: DPIA chưa ký, thông báo riêng tư chưa đăng,
 * mà rrweb chép lại cây DOM nên ảnh chụp đầu tiên mang theo tên và bình luận của độc giả KHÁC.
 * Một lần chép-dán từ `tcanm-assets` là đủ để nó quay lại mà không ai nhận ra — vì triệu chứng
 * duy nhất là thêm 140 KB tải về cho một phần bạn đọc.
 */
describe('⛔ bản Thái Nguyên KHÔNG có móc ghi phiên', () => {
    it('bật đủ mọi cờ vẫn KHÔNG tải rrweb', () => {
        const r = runFull({ dataRec: '1', recSample: '1', rrwebSrc: 'https://cdn/rrweb.js' });
        expect(r.injectedScripts).toHaveLength(0);
    });

    it('mã nguồn không còn tham chiếu thực thi nào tới rrweb', () => {
        // Chỉ được phép còn trong CHÚ THÍCH giải thích vì sao nó vắng mặt.
        const code = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(code).not.toContain('rrweb');
        expect(code).not.toContain('sendRecording');
        expect(code).not.toContain('page-recording');
    });

    it('vẫn đo hành vi bình thường khi có mặt các cờ thừa', () => {
        const r = runFull({ dataRec: '1', recSample: '1', rrwebSrc: '/rrweb.js' });
        expect(r.beacons).toHaveLength(1);
        expect(r.beacons[0].url).toContain('/v1/page-engagement');
    });
});

/**
 * ⭐ PHẠM VI TRA CỨU. Từ khi thân script hoãn tới DOMContentLoaded, toàn bộ <body> đã dựng xong,
 * nên một lần rơi ra `document` là chạm được vào mọi phần tử của trang.
 */
describe('⭐ readInfo không được tra ra NGOÀI #page_info', () => {
    it('⛔ #article_id LẠC ở thân trang KHÔNG được biến trang chuyên mục thành trang bài', () => {
        // Trên TN, trang chuyên mục luôn có data-article-id RỖNG ⇒ nhánh dự phòng chạy MỌI lượt.
        // Nếu nó với ra document, một portlet danh sách bài là đủ giết bộ đếm của cả layout.
        const r = runFull({ articleId: '', catView: '1', strayArticleId: '987654' });
        expect(r.beacons).toHaveLength(1);
        expect(r.beacons[0].payload.target_type).toBe('CATEGORY');
        expect(r.beacons[0].payload.target_id).toBe(2651);
        expect(r.events).toHaveLength(1);              // bộ đếm vẫn sống
        expect(r.events[0].payload.target_id).toBe(2651);
    });

    it('không có #page_info ⇒ VẪN được tra toàn tài liệu (giữ đường cms_dev)', () => {
        const r = runFull({ shape: 'none', strayArticleId: '987654' });
        expect(r.beacons).toHaveLength(1);
        expect(r.beacons[0].payload.target_id).toBe(987654);
    });
});

describe('⭐ cửa xem trước phải khớp site-go proxy.go', () => {
    it('/pv và /pv/* im lặng (site-go coi là đường xem trước)', () => {
        for (const pathname of ['/pv', '/pv/abc', '/pv/m/xyz']) {
            expect(runFull({ pathname }).beacons, `pathname ${pathname}`).toHaveLength(0);
            expect(runFull({ pathname, articleId: '', catView: '1' }).events).toHaveLength(0);
        }
    });
});

describe('⭐ chốt trang-1 chặn theo hướng dương', () => {
    it('mọi tên tham số phân trang đều chặn', () => {
        for (const search of ['?page=2', '?page_index=2', '?trang=3', '?p=4', '?PAGE=2']) {
            expect(runFull({ articleId: '', catView: '1', search }).events, search).toHaveLength(0);
        }
    });

    it('phân trang theo ĐƯỜNG DẪN cũng chặn', () => {
        for (const pathname of ['/xa-hoi/trang-2', '/xa-hoi/page-3', '/xa-hoi/page/4']) {
            expect(runFull({ articleId: '', catView: '1', pathname }).events, pathname).toHaveLength(0);
        }
    });

    it('trang gốc và ?page=1 vẫn đếm', () => {
        expect(runFull({ articleId: '', catView: '1', pathname: '/xa-hoi' }).events).toHaveLength(1);
        expect(runFull({ articleId: '', catView: '1', search: '?page=1' }).events).toHaveLength(1);
        expect(runFull({ articleId: '', catView: '1', search: '?q=abc' }).events).toHaveLength(1);
    });
});

describe('⭐ sub_target_id chỉ có nghĩa trên hàng ARTICLE', () => {
    it('hàng CATEGORY: sub_target_id = null, không lặp lại target_id', () => {
        const [b] = runFull({ articleId: '' }).beacons;
        expect(b.payload.target_type).toBe('CATEGORY');
        expect(b.payload.target_id).toBe(2651);
        expect(b.payload.sub_target_id).toBeNull();
    });

    it('hàng ARTICLE: sub_target_id vẫn chở category_id', () => {
        const [b] = runFull().beacons;
        expect(b.payload.target_type).toBe('ARTICLE');
        expect(b.payload.sub_target_id).toBe(2651);
    });
});
