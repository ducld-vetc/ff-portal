# Vị trí sản phẩm (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Quản lý sản phẩm |
| Menu | Quản lý sản phẩm → Vị trí sản phẩm |
| Route | `/client/products/locations` |
| Actor chính | Partner |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Cho đối tác xem tồn hàng của mình theo vị trí/kiện trong kho 3PL.

## 3. Phạm vi

### Trong phạm vi
- Shared ProductLocationsPage
- Ẩn filter đối tác
- Scope dữ liệu theo partner

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Xem tồn

1. Mở Vị trí sản phẩm → xem theo vị trí/kiện trong phạm vi của mình.

## 5. Màn hình & thao tác UI

### Vị trí SP (Customer)

- **Đường dẫn:** `/client/products/locations`
- **Mô tả:** Giống admin nhưng scoped.

## 6. Dữ liệu & trường thông tin

### ProductLocation

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| (như Admin) | Chỉ dữ liệu partner | Có |

## 7. Quy tắc nghiệp vụ

1. Không hiện filter Đối tác.
2. Chỉ dữ liệu thuộc customer.

## 8. Phân quyền

- **Permission key gợi ý:** `catalog.locations.view`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Không lộ tồn partner khác.
