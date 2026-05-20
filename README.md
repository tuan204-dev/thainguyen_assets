# UI Rules

Các quy tắc UI cần tuân thủ khi phát triển giao diện trong dự án này.

## 1. Title (Tiêu đề)

- **Phải hiển thị đầy đủ**, không được cắt chữ (không dùng `line-clamp`, `text-ellipsis` cắt ngang nội dung tiêu đề).
- Nếu tiêu đề quá dài, cần điều chỉnh layout để chứa đủ nội dung thay vì cắt chữ.

## 2. Description (Mô tả)

- Hiển thị **tối đa 3 dòng**.
- Khi nội dung bị cắt, dấu `…` **không được cắt vào giữa chữ** — phải cắt theo ranh giới từ (word boundary).
- Sử dụng hàm `clampByWordsFromTailwind` trong [common/common.js:9-59](common/common.js#L9-L59) để xử lý.
- Áp dụng bằng cách thêm class `desc` hoặc `line-clamp-{n}` (ví dụ `line-clamp-3`) vào phần tử cần clamp; hàm sẽ tự động chạy.

## 3. Thumbnail (Ảnh đại diện)

- Luôn giữ **tỉ lệ 16 / 9**.
- Ảnh được **crop từ trung tâm** (`object-cover object-center`).
- Chỉ phá vỡ quy tắc này trong các trường hợp đặc biệt đã được thống nhất trước.

## 4. Thư viện UI

- Toàn bộ thư viện dùng chung được đặt trong [common/](common/).
- Hướng dẫn sử dụng từng thư viện nằm trong [ui-instructions/](ui-instructions/):
  - [Swiper.md](ui-instructions/Swiper.md)
  - [Dropdown.md](ui-instructions/Dropdown.md)
  - [Overlay.md](ui-instructions/Overlay.md)
  - [OverlayScrollbars.md](ui-instructions/OverlayScrollbars.md)
- Trước khi thêm thư viện mới, kiểm tra trong [common/](common/) xem đã có sẵn chưa để tránh trùng lặp.
- Khi thêm thư viện mới, **bắt buộc** viết hướng dẫn sử dụng tương ứng trong [ui-instructions/](ui-instructions/).

## 5. TailwindCSS

- Sử dụng **TailwindCSS** cho toàn bộ styling.
- **Bắt buộc dùng prefix `t:`** cho tất cả class Tailwind (ví dụ: `t:flex t:items-center t:gap-4`).
- **Chỉ dùng CSS thường khi thực sự bắt buộc** (ví dụ: hiệu ứng phức tạp Tailwind không hỗ trợ, override thư viện third-party). Mặc định luôn ưu tiên TailwindCSS.
- Cấu trúc thư mục và cách tổ chức code theo mẫu trong [reference/](reference/):
  - Tách riêng `desktop/` và `mobile/`.

## 6. Responsive

- **Responsive luôn được xử lý trong phiên bản desktop** ([reference/desktop/](reference/desktop/)).
- Bản `mobile/` chỉ dành cho trường hợp layout mobile khác biệt hoàn toàn so với desktop, không thể đạt được bằng responsive utilities.
- Dùng các breakpoint của Tailwind kèm prefix `t:` (ví dụ: `t:md:flex t:lg:grid-cols-3`) để điều chỉnh giao diện theo kích thước màn hình.

## 7. Reference — Các loại block bài viết

Tham khảo trong [reference/desktop/index.html](reference/desktop/index.html):

### 7.1. Block bài ngang — ảnh bên trái
- Mẫu: [reference/desktop/index.html:2160-2177](reference/desktop/index.html#L2160-L2177)
- Cấu trúc: `figure.img-block.t:md:float-left` đứng trước `h3.title`, dùng `t:flow-root` ở container để bao float.

### 7.2. Block bài ngang — ảnh bên phải
- Mẫu: [reference/desktop/index.html:1388-1404](reference/desktop/index.html#L1388-L1404)
- Cấu trúc: tương tự block ngang nhưng `figure.img-block` dùng `t:pc:float-right` (responsive: float-left ở mobile, float-right ở desktop).

### 7.3. Block bài dọc
- Mẫu: [reference/desktop/index.html:1224-1242](reference/desktop/index.html#L1224-L1242)
- Cấu trúc: `figure.img-block` đứng trên, `h3.title` và `time.article-date` xếp xuống dưới theo chiều dọc.

## 8. List bài viết dạng hàng ngang

Khi render danh sách bài viết theo dạng grid hàng ngang (ví dụ: [reference/desktop/index.html:1495-1551](reference/desktop/index.html#L1495-L1551)):

- **Tất cả các item bên trong phải có CSS giống hệt nhau** — không hard-code khác biệt cho item đầu / cuối / giữa.
- **Padding mép ngoài**: nếu item đầu cần bỏ `padding-left` và item cuối cần bỏ `padding-right`, **xử lý ở thẻ cha** bằng selector con thay vì sửa class riêng cho từng item:
  ```html
  t:[&>*:first-child]:pl-0 t:[&>*:last-child]:pr-0
  ```
- **Divider giữa các item**: cũng đặt **ở thẻ cha** thay vì border riêng từng item:
  ```html
  t:md:divide-x t:divide-[#D9D9D9]
  ```
- Lý do: giữ markup của item lặp lại sạch và đồng nhất, dễ render bằng vòng lặp (template), dễ thay đổi số cột mà không phải sửa từng item.

Ví dụ thẻ cha đầy đủ:
```html
<div class="t:grid t:md:grid-cols-3 t:[&>*:first-child]:pl-0 t:[&>*:last-child]:pr-0 t:md:divide-x t:divide-[#D9D9D9]">
  <div class="t:md:px-4">...</div>
  <div class="t:md:px-4">...</div>
  <div class="t:md:px-4">...</div>
</div>
```

## 9. Không fix cứng width / height

- **Trong mọi trường hợp, không được fix cứng `width` / `height` bằng giá trị tuyệt đối** (ví dụ: `w-[320px]`, `h-[200px]`, `width: 400px`, `height: 250px`).
- Thay vào đó, dùng:
  - Tỉ lệ (`aspect-ratio`, ví dụ `aspect-[16/9]`).
  - Đơn vị tương đối (`%`, `rem`, `em`, `vw`, `vh`, `max-width`, `min-width`).
  - Để nội dung / grid / flex tự quyết định kích thước.
- Lý do: đảm bảo responsive trên mọi kích thước màn hình và không bị vỡ layout khi nội dung thay đổi.
- Ngoại lệ duy nhất: các phần tử bắt buộc phải có kích thước cố định theo thiết kế (icon nhỏ, logo có size chuẩn) — và phải có lý do rõ ràng.

## 10. Size ảnh & Size title

### 10.1. Size ảnh — `.img-block` ([common/style/common.css:57-92](common/style/common.css#L57-L92))

| Class | Width | Ghi chú |
|---|---|---|
| `.img-block.lg` | 260px | Ảnh lớn |
| `.img-block.md` | 192px | Ảnh vừa |
| `.img-block.sm` | 178px | Ảnh nhỏ |
| `.img-block.ssm` | 145px | Ảnh rất nhỏ |

Tất cả đều có `max-width: 50%` và giữ tỉ lệ `16 / 9`, ảnh `object-fit: cover` crop từ tâm.

### 10.2. Size title — `.title` ([common/style/common.css:95-126](common/style/common.css#L95-L126))

| Class | Desktop | Mobile (≤1000px) |
|---|---|---|
| `.title.l1` | 1.5rem | 1.25rem |
| `.title.l2` | 1.125rem | 1.125rem |
| `.title.l3` | 1rem | 1rem |
| `.title.l4` | 0.875rem | 0.875rem |

## 11. Fonts

- Nếu cần dùng font mới, **tải về và lưu cục bộ** trong [common/fonts/](common/fonts/) — không nhúng trực tiếp từ CDN.
- Tổ chức theo nguồn font (ví dụ: [common/fonts/google/](common/fonts/google/) cho Google Fonts).
- Khai báo `@font-face` trỏ tới file local đã lưu.
