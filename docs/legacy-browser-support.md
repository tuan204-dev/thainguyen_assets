# Hỗ trợ trình duyệt cũ

## Vì sao có tài liệu này

Repo build asset bằng **Tailwind CSS v4**, mà Tailwind v4 đặt baseline chính thức là
**Chrome 111+ / Safari 16.4+ / Firefox 128+**. Trong khi đó **Chrome 109 là bản Chrome
cuối cùng cho Windows 7/8.1** (01/2023) — những máy đó không nâng cấp được nữa. Kết quả:
output của Tailwind dùng cú pháp Chrome 109 không parse được, và trang vỡ style.

Ba thứ Tailwind v4 sinh ra gây vỡ:

| Cú pháp | Có từ Chrome | Tailwind sinh ra khi nào |
|---|---|---|
| CSS nesting `&` | 112 | mọi variant (`t:hover:`, `t:after:`, `t:[&_.x]:…`) |
| `oklch()` / `oklab()` | 111 | plugin `@tailwindcss/typography` (biến `--tw-prose-*`) |
| `color-mix(in oklab, …)` | 111 | modifier độ mờ (`t:bg-black/50`) |

## Cách xử lý

### 1. `targets` cho Lightning CSS — `a_script/minify.ts`

Lightning CSS đã nằm sẵn trong pipeline minify nhưng trước đây gọi **không có `targets`**,
nên nó chỉ nén khoảng trắng chứ không hạ cấp gì. Khai báo `CSS_TARGETS` bật khả năng
transpile: nesting được làm phẳng, `oklch()`/`oklab()` được thay bằng fallback sRGB
(bản hiện đại chuyển vào `@supports`), media query range `(width>=48rem)` thành
`(min-width:48rem)`.

Vì mọi URL công khai của site đều trỏ vào `encode/`, đây là **điểm chặn duy nhất** cho
toàn bộ CSS phát hành. Chi phí đo được: **+4.0%** tổng dung lượng CSS.

### 2. Fallback độ mờ — `common/style/common.css`

`color-mix()` có `var()` bên trong thì không công cụ nào tính fallback được. Tailwind tự
bọc `@supports` nhưng fallback nó chọn là **màu đặc 100%**, nên lớp phủ che kín nội dung.
Khối `@supports not (color: color-mix(in lab, red, red))` ở cuối `common.css` viết lại
đúng các class đó bằng `rgba()`.

Khối này **chỉ tồn tại** ở trình duyệt thiếu `color-mix()`, nên không đổi gì trên trình
duyệt hiện đại — kể cả quan hệ đè nhau giữa các utility.
`color-mix(in oklab, C p%, transparent)` cho ra đúng C với alpha nhân p%, nên `rgba()`
là tương đương chính xác chứ không phải xấp xỉ.

Thêm class dùng modifier độ mờ mới thì **phải bổ sung vào khối này**. Cổng kiểm tra sẽ
báo lỗi nếu có `color-mix()` lọt ra ngoài `@supports`.

### 3. Cổng kiểm tra — `a_script/check-legacy.ts`

Chạy tự động trong `bun run sync` (trước khi commit) và trong CI (trước khi đẩy R2).
Quét `encode/` tìm cú pháp vượt sàn; exit ≠ 0 thì dừng.

```
bun a_script/check-legacy.ts              # kiểm tra encode/
bun a_script/check-legacy.ts --warn-only  # báo cáo, luôn exit 0
```

## Sàn thực tế — đọc kỹ trước khi hứa với ai

`CSS_TARGETS` khai báo Chrome 90, nhưng **sàn thật của site là Chrome 105**. Có ba thứ
nằm trong output của Tailwind mà **không công cụ nào hạ cấp được**:

| Sàn | Tình trạng |
|---|---|
| **Chrome 105+** | ✅ Đúng hoàn toàn — bao trọn Chrome 109/Windows 7 |
| Chrome 104 | rule `:has()` chết (viền bảng ảnh liên quan ở trang bài chi tiết) |
| Chrome 99–103 | thêm utility `translate:`/`rotate:` chết (nút Swiper lệch tâm) |
| **Chrome < 99** | ❌ `@layer` → mất **100%** CSS Tailwind |

Vì sao Chrome < 99 không cứu được bằng một bộ CSS duy nhất: polyfill `@layer`
(`@csstools/postcss-cascade-layers`) hoạt động bằng cách nâng specificity trong **phạm vi
một file**. CSS của site nằm rải ở 41 file, trong đó `common.css`/`icon.css` viết tay
không nằm trong layer nào và hiện đang **thắng mọi utility Tailwind**. Làm phẳng từng
file riêng sẽ đảo ngược quan hệ đó trên **cả trình duyệt hiện đại**. Muốn xử lý đúng thì
phải gộp toàn bộ CSS vào một bundle legacy riêng — đắt hơn nhiều.

Thực tế khoảng trống này gần như không có người: máy Windows 7/8.1 kẹt đúng ở **109**,
Windows XP/Vista kẹt ở **49** (dưới mọi ngưỡng). Chrome 90–98 là bản 2021–2022 vẫn tự
cập nhật được. Kiểm tra GA4 mục *Tech → Browser version* trước khi cân nhắc làm thêm.

Cổng kiểm tra báo ba thứ này ở mức **cảnh báo**, không chặn.

## JavaScript

`JS_TARGET = ["chrome109"]` trong `a_script/minify.ts` chặn **cú pháp** vượt sàn. esbuild
không kiểm **API** runtime, nên `check-legacy.ts` có thêm danh sách chặn riêng
(`.toSorted`, `Object.groupBy`, `Promise.withResolvers`, Popover API…).

Sàn thực tế của JS hiện tại là **Chrome 80** (`?.` / `??`) — thấp hơn nhiều so với yêu cầu.

## Khi nâng version Tailwind

Tailwind mỗi bản lớn lại dùng thêm cú pháp mới. Sau khi nâng:

1. `bun run tw <folder> --build` rồi `bun a_script/minify.ts --force`
2. `bun a_script/check-legacy.ts` — nếu có lỗi mới, kiểm tra xem Lightning CSS có hạ cấp
   được không; không thì phải tránh utility đó trong source.
3. Nhớ bump `?v=` trong layout trên CMS: R2 đặt `Cache-Control: max-age=2592000` (30 ngày).
