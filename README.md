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

### 6.1. Cách làm chung
- **Responsive luôn được xử lý trong phiên bản desktop** ([reference/desktop/](reference/desktop/)).
- Bản `mobile/` chỉ dành cho trường hợp layout mobile khác biệt hoàn toàn so với desktop, không thể đạt được bằng responsive utilities.
- Dùng các breakpoint của Tailwind kèm prefix `t:` (ví dụ: `t:md:flex t:pc:grid-cols-3`).

### 6.2. Breakpoints
Khai báo trong [home/desktop/source.css](home/desktop/source.css) (và file `source.css` tương ứng cho các page khác):

| Prefix | Min-width | Mô tả |
|---|---|---|
| (mặc định) | 0 | Mobile-first base |
| `md:` | 768px | Tablet |
| `pc:` | 1000px | Desktop chính của dự án |
| `bt-xl:` | 1200px | Desktop lớn |

Có thể combine với `max-{breakpoint}:` để giới hạn class **chỉ áp dụng dưới** một breakpoint — ví dụ `t:max-pc:gap-y-5` chỉ chạy khi viewport `< 1000px`.

### 6.3. Progressive responsive (mobile-first)
Khi layout đổi số cột, luôn đi **từ ít cột → nhiều cột** theo viewport tăng dần:

| Viewport | Số cột mẫu |
|---|---|
| `< 768px` (mobile) | 1 col stack |
| `768-999px` (md / tablet) | 2 cols |
| `≥ 1000px` (pc) | 3-4 cols full layout |

**Anti-pattern**: tránh dùng `t:max-md:grid-cols-2` đơn lẻ → mobile 2 cols nhưng tablet rớt về 1 col mặc định (đi lùi). Số cột phải đơn điệu tăng theo viewport.

### 6.4. Scope responsive utilities — không "rò rỉ" sang PC
Layout PC là target ổn định. Khi thêm class cho mobile/tablet (gap, padding, grid-cols phụ…), **scope với `max-pc:`** để dừng ở 1000px, giữ PC y nguyên:

```html
<!-- Sai: gap-y-5 áp dụng cả ở PC dù single-row không cần -->
<div class="t:grid t:gap-y-5 t:pc:grid-cols-4">...</div>

<!-- Đúng: gap-y-5 chỉ chạy < pc -->
<div class="t:grid t:max-pc:gap-y-5 t:pc:grid-cols-4">...</div>
```

Tương tự cho intermediate breakpoint — `t:md:max-pc:grid-cols-2` nghĩa là "2 cols ở khoảng `768-999px`, không động đến PC".

### 6.5. Ví dụ — Grid responsive 3 cấp với divider
Mẫu: [home/desktop/index.html:3692-3694](home/desktop/index.html#L3692-L3694)

```html
<div class="t:grid
            t:max-pc:gap-y-5
            t:md:max-pc:grid-cols-2 t:md:max-pc:gap-x-4
            t:pc:grid-cols-4 t:pc:divide-x t:pc:divide-dashed t:pc:divide-[#DCDFE4]
            t:pc:[&>*:first-child]:pl-0 t:pc:[&>*:last-child]:pr-0">
    <div class="t:pc:px-4">...</div>
    <!-- 4 items identical, theo Rule 8 -->
</div>
```

- **Mobile (`< 768`)**: 1 col stack, `gap-y-5` giữa các hàng.
- **Tablet (`768-999`)**: 2 cols × 2 rows, dùng `gap-x-4 + gap-y-5` (KHÔNG dùng `divide-x` vì wrap row sẽ vẽ border sai sang item đầu row 2).
- **PC (`≥ 1000`)**: 4 cols single row, dashed divider giữa cột, items `px-4`, first/last bỏ padding mép.

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

## 12. Category Title (Tiêu đề danh mục)

Mỗi section danh mục có **title chính** (tên danh mục) và **sub-titles** (danh sách danh mục con). Sub-titles dùng Swiper để scroll ngang khi quá dài. Mẫu đầy đủ: [home/desktop/index.html:3602-3697](home/desktop/index.html#L3602-L3697).

### 12.1. Title chính

- Thẻ `<h2>`, dùng font `merriweather`, `uppercase`, `font-semibold`.
- Size: **`28px` ở desktop**, **`22px` ở mobile** (`t:max-pc:text-[22px]`).
- Màu theo brand của section (ví dụ `#30A14A` cho khối "Thông tin - Quảng cáo").
- Có thể có **chevron icon** đứng cạnh để link tới trang danh mục (dùng `material-symbols--arrow-forward-ios-rounded`, xem [common/style/icon.css](common/style/icon.css)).
- Container tiêu đề thường có `border-t t:border-[#DCDFE4] t:pt-4` để ngăn cách với section trên.

```html
<div class="t:border-t t:border-[#DCDFE4] t:pt-4">
    <div class="t:flex t:items-center t:gap-x-3 t:flex-wrap">
        <h2 class="merriweather t:text-[28px] t:max-pc:text-[22px] t:font-semibold t:uppercase t:text-[#30A14A] t:leading-tight">
            <a href="">Thông tin - Quảng cáo</a>
        </h2>
        <a href="" class="t:size-9 t:rounded-full t:bg-[#F7F7F7] t:inline-flex t:items-center t:justify-center t:shrink-0 t:hover:bg-[#E9E9E9]">
            <i class="material-symbols--arrow-forward-ios-rounded t:text-[#212636]"></i>
        </a>
    </div>
    <!-- sub-titles ở đây -->
</div>
```

### 12.2. Sub-titles (Swiper)

Sub-titles **luôn dùng Swiper** với `slidesPerView: "auto"` + `freeMode` — để khi có nhiều sub-category sẽ scroll ngang được, không xuống dòng.

**Cấu hình bắt buộc**:
- `data-swiper-slides-per-view="auto"` — mỗi pill rộng theo content.
- `data-swiper-space-between="0"` — divider tự tạo bằng `border-l` thay vì gap.
- `data-swiper-free-mode="true"` — kéo mượt theo chiều ngang.
- `t:[&_.swiper-slide]:w-auto!` — override `width: 100%` default của Swiper (cần `!` vì cùng specificity).
- `t:whitespace-nowrap` trên `<a>` — text trong từng pill không xuống dòng (Rule 1).

**Styling theo Rule 8** — divider/padding chỉ áp ở thẻ cha qua arbitrary selectors:
- `t:[&_.swiper-slide]:px-3 t:[&_.swiper-slide]:border-l t:[&_.swiper-slide]:border-[#DCDFE4]` cho tất cả slide.
- `t:[&_.swiper-slide:first-child]:pl-0 t:[&_.swiper-slide:first-child]:border-l-0` tinh chỉnh slide đầu.

**Prev/Next buttons** — dạng arrow đơn giản gom về mép phải, nền gradient trắng:
- Cả hai `size-6!`, `mt-0!` (nullify margin-top mặc định của Swiper bundle CSS), `text-[#8A94A6]`, `after:text-[14px]!`, `top-1/2 -translate-y-1/2`.
- `next`: `right-0!`, `bg-white`.
- `prev`: `left-auto! right-6!` (dán sát cạnh next), `bg-linear-to-r from-white/0 to-white` (fade-in từ trong suốt sang trắng).
- **Tự ẩn khi đến đầu/cuối**:
  - `t:[&_.swiper-button-prev.swiper-button-disabled]:hidden!` — ẩn prev khi đang ở slide đầu.
  - Swiper auto-thêm class `.swiper-button-lock` cho cả hai button khi không overflow → bundle CSS ẩn sẵn.
- **Reserve padding-right có điều kiện**: `t:[&:has(.swiper-button-next:not(.swiper-button-lock))]:pr-14` — chỉ chừa 56px chỗ cho 2 button khi swiper thực sự scroll được.

```html
<div class="swiper t:relative t:mt-2 t:text-sm t:font-medium t:text-[#8A94A6]
            t:[&:has(.swiper-button-next:not(.swiper-button-lock))]:pr-14
            t:[&_.swiper-wrapper]:items-center
            t:[&_.swiper-slide]:w-auto! t:[&_.swiper-slide]:px-3
            t:[&_.swiper-slide]:border-l t:[&_.swiper-slide]:border-[#DCDFE4]
            t:[&_.swiper-slide:first-child]:pl-0 t:[&_.swiper-slide:first-child]:border-l-0
            t:[&_.swiper-button-next]:size-6! t:[&_.swiper-button-next]:mt-0!
            t:[&_.swiper-button-next]:text-[#8A94A6] t:[&_.swiper-button-next]:bg-white
            t:[&_.swiper-button-next]:right-0! t:[&_.swiper-button-next]:top-1/2 t:[&_.swiper-button-next]:-translate-y-1/2
            t:[&_.swiper-button-next]:after:text-[14px]! t:[&_.swiper-button-next]:hover:text-[#212636]
            t:[&_.swiper-button-prev]:size-6! t:[&_.swiper-button-prev]:mt-0!
            t:[&_.swiper-button-prev]:text-[#8A94A6] t:[&_.swiper-button-prev]:bg-linear-to-r
            t:[&_.swiper-button-prev]:from-white/0 t:[&_.swiper-button-prev]:to-white
            t:[&_.swiper-button-prev]:left-auto! t:[&_.swiper-button-prev]:right-6!
            t:[&_.swiper-button-prev]:top-1/2 t:[&_.swiper-button-prev]:-translate-y-1/2
            t:[&_.swiper-button-prev]:after:text-[14px]! t:[&_.swiper-button-prev]:hover:text-[#212636]
            t:[&_.swiper-button-prev.swiper-button-disabled]:hidden!"
    data-swiper
    data-swiper-slides-per-view="auto"
    data-swiper-space-between="0"
    data-swiper-free-mode="true">
    <div class="swiper-wrapper">
        <div class="swiper-slide">
            <a href="" class="t:hover:text-[#30A14A] t:whitespace-nowrap">Sub-category 1</a>
        </div>
        <!-- … các slide khác, markup giống hệt nhau (Rule 8) -->
    </div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
</div>
```

### 12.3. Lưu ý

- Sub-title swiper **không dùng pagination** — không cần dot, chỉ cần arrow + drag.
- `mt-0!` trên 2 button là bắt buộc — bundle CSS có `margin-top: calc(0px - var(--swiper-navigation-size) / 2)` (~-22px) để center button cao 44px mặc định; khi override `size-6` (24px) thì margin-top âm vẫn còn → button bị đẩy lên trên vùng hiển thị.
- Không hardcode width vào pill — `t:whitespace-nowrap` để pill tự co theo content, đúng Rule 9 (không fix cứng width/height).
- Khi thêm danh mục mới chỉ cần copy 1 `.swiper-slide` thêm vào — không sửa class container, đúng Rule 8.
