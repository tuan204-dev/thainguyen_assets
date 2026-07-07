# CMS backup — layout & portlet thêm/cập nhật 05/07/2026 → 07/07/2026

Site (target MCP): **thainguyen** — api.baothainguyen.vn (dept 2). Chụp lúc: 2026-07-07.

## Nội dung
| File | Loại | id | code / tên | Trạng thái trong khoảng |
|---|---|---|---|---|
| `portlet-208-video_detail_cate_sections.json` | portlet | 208 | `video_detail_cate_sections` | **TẠO MỚI** 06/07 |
| `layout-265-Video_Detail_New.json` | layout | 265 | Video_Detail_New (desktop) | cập nhật nội dung 06/07 (đã tồn tại từ trước) |
| `layout-248-Video_Detail_Mobile.json` | layout | 248 | Video_Detail_Mobile (mobile) | cập nhật nội dung 06/07 (đã tồn tại từ trước) |

> Lưu ý: chỉ portlet 208 là *được tạo mới* trong khoảng thời gian này. Layout 265/248 đã có sẵn (rỗng) và được đổ nội dung trong khoảng này — đưa vào backup để khôi phục trọn bộ.

Mỗi file JSON là một `definition` sẵn sàng import lại (giữ nguyên `id` → chạy đường update).

## Khôi phục (qua MCP dynamic-ui, target `thainguyen`)
Đọc file JSON rồi truyền vào tool tương ứng, dry-preview trước rồi `confirm:true`:

- Portlet:  `save_portlet({ definition: <nội dung portlet-208-*.json>, confirm:true, target:"thainguyen" })`
- Layout:   `save_layout({ definition: <nội dung layout-265-*.json>, confirm:true, target:"thainguyen" })`
- Layout:   `save_layout({ definition: <nội dung layout-248-*.json>, confirm:true, target:"thainguyen" })`

Datasource `SIBLINGS_OF_CATE` (id 101) và portlet phụ thuộc `util_portlet` là tài nguyên có sẵn — không nằm trong backup này, cần tồn tại sẵn khi khôi phục.
