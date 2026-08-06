# Tổng quan (Dashboard Admin)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin |
| Menu | Tổng quan |
| Route | `/dashboard` |
| Actor chính | Quản trị kho, điều phối vận hành, quản lý |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Theo dõi KPI fulfillment theo đối tác / kho / kênh / khoảng thời gian.
- Phát hiện sớm đơn chậm (trễ), tỷ lệ hủy, tốc độ xử lý.
- Làm điểm vào nhanh cho điều phối vận hành hàng ngày.

## 3. Phạm vi

### Trong phạm vi
- Bộ lọc đối tác, kho, kênh bán hàng, khoảng ngày.
- KPI: tổng đơn, đang xử lý, đã xuất kho, giao thành công, trả hàng, hủy.
- Biểu đồ tốc độ xử lý / tỷ lệ xuất kho / hoàn thành.
- Bảng thống kê theo kênh bán hàng.

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (hiện tại UI demo/mock).
- Mobile app native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Xem dashboard

1. Người dùng mở menu Tổng quan.
2. Chọn bộ lọc (đối tác/kho/kênh/ngày) và áp dụng.
3. Hệ thống tải KPI, biểu đồ, bảng kênh theo filter.
4. Người dùng drill-down (nếu có liên kết) sang danh sách đơn liên quan.

## 5. Màn hình & thao tác UI

### Dashboard

- **Đường dẫn:** `/dashboard`
- **Mô tả:** Một trang tổng hợp KPI + chart + bảng kênh.
- **Thao tác chính:**
  - Lọc
  - Làm mới dữ liệu

## 6. Dữ liệu & trường thông tin

### Bộ lọc Dashboard

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| Đối tác | Select — chỉ Admin | Không |
| Kho | Select | Không |
| Kênh bán hàng | Select | Không |
| Khoảng ngày | Date range | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `processing` | Đang xử lý | Đơn còn trong pipeline |
| `fast` | Xử lý nhanh | Trong ngưỡng nhanh |
| `on_time` | Đúng hạn | Trong SLA |
| `late` | Trễ | Vượt SLA |
| `cancelled` | Hủy | Đơn hủy |

## 7. Quy tắc nghiệp vụ

1. Filter đối tác chỉ hiển thị trên portal Admin.
2. Khoảng ngày mặc định hợp lý (ví dụ 7–30 ngày gần nhất).
3. Số liệu phải nhất quán giữa KPI card và bảng kênh khi cùng filter.

## 8. Phân quyền

- **Permission key gợi ý:** `dashboard.view`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET /api/dashboard/kpis
- GET /api/dashboard/charts
- GET /api/dashboard/channels

## 10. Tiêu chí nghiệm thu

1. Áp dụng filter cập nhật toàn bộ widget.
2. Ẩn filter đối tác khi mở từ portal Customer.
3. Hiển thị empty state khi không có dữ liệu.
