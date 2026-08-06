# Bảng điều khiển (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Partner |
| Menu | Bảng điều khiển |
| Route | `/client/dashboard` |
| Actor chính | Chủ shop / partner ops |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Cho đối tác xem KPI fulfillment của riêng mình.
- Không cho xem/ lọc dữ liệu đối tác khác.

## 3. Phạm vi

### Trong phạm vi
- Cùng widget Admin dashboard
- Ẩn filter Đối tác
- Scope theo customer đăng nhập

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Xem KPI

1. Đăng nhập portal Customer → Bảng điều khiển.
2. Lọc kho/kênh/ngày trong phạm vi của mình.
3. Xem KPI & bảng kênh.

## 5. Màn hình & thao tác UI

### Dashboard Customer

- **Đường dẫn:** `/client/dashboard`
- **Mô tả:** DashboardPage shared, isCustomer=true.

## 6. Dữ liệu & trường thông tin

### Filters

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| Kho / Kênh / Khoảng ngày | Trong scope customer | Không |

## 7. Quy tắc nghiệp vụ

1. Không hiển thị filter Đối tác.
2. Toàn bộ số liệu scoped theo customerId phiên đăng nhập.

## 8. Phân quyền

- **Permission key gợi ý:** `dashboard.view (customer scope)`
- Dùng chung page với Admin Tổng quan nhưng khác scope.

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Ẩn filter đối tác.
2. Không lộ dữ liệu customer khác.
