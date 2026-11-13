# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bạn đọc của baothainguyen.vn (Báo và Phát thanh, Truyền hình Thái Nguyên): người dân và cán bộ trong tỉnh, đọc tin từ trang chủ, Facebook, Zalo. _(Suy ra từ repo, chưa phỏng vấn riêng.)_ Một phần đọc trên máy tính cơ quan chạy Windows 7 / Chrome 109, phần lớn còn lại đọc trên điện thoại. _(Suy ra từ `docs/legacy-browser-support.md` và các bản mobile.)_

## Product Purpose

Repo này giữ bản HTML tĩnh (mockup `index.html`) và CSS/JS của từng kiểu trang trên site báo điện tử Thái Nguyên. Mockup được dựng trước, sau đó chuyển thành layout + portlet trên CMS Mediasoft (site-go). Asset được phục vụ qua R2/MinIO dưới tiền tố `/encode/`.

## Capabilities and Constraints

- TailwindCSS v4, **bắt buộc prefix `t:`**; breakpoint `md` 768 · `pc` 1000 · `bt-xl` 1200. Responsive làm luôn trong thư mục `desktop/`; `mobile/` chỉ khi layout khác hẳn (README).
- CSS phải chạy được trên Chrome 105+ (sàn thực tế của pipeline hạ cấp Chrome 109).
- Tiêu đề không bao giờ bị cắt chữ; mô tả tối đa 3 dòng, cắt theo ranh giới từ (`common/common.js`).
- Ảnh đại diện bài giữ tỉ lệ 16:9, `object-cover` ở tâm (trừ trường hợp đã thống nhất).
- Thư viện dùng chung nằm trong `common/` (Swiper, overlay, dropdown, OverlayScrollbars, `video-player.js`). Kiểm tra ở đó trước khi thêm thư viện.
- `bun run sync` chạy `git add -A` rồi CI đẩy file trong thư mục con lên R2 công khai: file nào nằm trong repo mà không bị `.gitignore` đều có thể bị công khai.

## Brand Commitments

- Header/footer chung của baothainguyen.vn; màu chủ đạo xanh `#30A14A`; tiêu đề và thân bài Noto Serif, chữ giao diện Roboto. Khu truyền hình dùng nền xám đen `#0d0d0d`.
- Tọa đàm (13/11/2026, người dùng xác nhận): giữ nguyên hệ nhận diện TN như các trang chi tiết hiện có; chỉ hero và khối Hỏi–Đáp là mới.

## Evidence on Hand

- Kiểm tra CMS ngày 13/11/2026: TN chưa có bài tọa đàm dạng Hỏi–Đáp; các bài "tọa đàm" hiện có đều là tin tường thuật. Chương trình truyền hình "Pháp luật và đời sống" có dạng tọa đàm trường quay (MC + 2 khách mời, khoảng 20 phút), kịch bản đánh số "Câu hỏi 1 – <khách mời>".
- Không có ảnh chân dung, video hay bản ghi tọa đàm thật để dựng mockup. Nội dung mẫu phải ghi rõ là minh hoạ; không bịa lời nói gắn với người thật hay chức danh có thật.

## Product Principles

1. Bài báo đặt trước: đọc dễ, tìm nhanh, không để trang trí chen vào cột chữ.
2. Thành phần mới phải trông như của TN, dùng lại đồ dùng chung trước khi viết mới.
3. Chạy được trên máy cũ và điện thoại như nhau.
