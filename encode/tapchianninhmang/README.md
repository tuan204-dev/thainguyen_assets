```text
Bạn là một trợ lý lập trình. Hãy giúp tôi thay đổi đường dẫn (paths) trong phần code HTML/CSS bên dưới.

**Yêu cầu:**
Thay thế tất cả các đường dẫn tương đối (relative path) trong đoạn code tôi cung cấp thành đường dẫn tuyệt đối (absolute path).

**Quy tắc:**
- Base URL: `https://assets.tapchianninhmang.vn`
- Công thức: Base URL + Relative path (tính từ root)

**Lưu ý:**
- Bỏ qua các đường dẫn đã là tuyệt đối (bắt đầu bằng `http://`, `https://`, `//`).
- Bỏ qua các định dạng đặc biệt (ví dụ: `mailto:`, `tel:`, `data:`).
- Xử lý chính xác cả khi relative path bắt đầu bằng gạch chéo `/` (ví dụ: `/css/style.css`) hoặc không có gạch chéo (ví dụ: `css/style.css`). Kết quả nối phải mượt mà, không bị dư gạch chéo (như `assets//css`).
- Áp dụng trên toàn bộ các thuộc tính như `src`, `href` trong HTML và cấu trúc hàm `url()` trong CSS.
- Giữ nguyên cấu trúc HTML/CSS và không làm thay đổi những code không liên quan.
```
