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
- Cấu trúc thư mục và cách tổ chức code theo mẫu trong [home/](home/):
  - Tách riêng `desktop/` và `mobile/`.

## 6. Fonts

- Nếu cần dùng font mới, **tải về và lưu cục bộ** trong [common/fonts/](common/fonts/) — không nhúng trực tiếp từ CDN.
- Tổ chức theo nguồn font (ví dụ: [common/fonts/google/](common/fonts/google/) cho Google Fonts).
- Khai báo `@font-face` trỏ tới file local đã lưu.
