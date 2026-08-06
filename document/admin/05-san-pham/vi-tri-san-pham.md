# Vị trí sản phẩm

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Sản phẩm |
| Menu | Sản phẩm → Vị trí sản phẩm |
| Route | `/products/locations` |
| Actor chính | Ops tồn kho, catalog |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Xem tồn theo vị trí (bin) và theo kiện/package.
- Lọc theo đối tác (Admin) để hỗ trợ tìm hàng.

## 3. Phạm vi

### Trong phạm vi
- 2 góc nhìn: theo vị trí / theo kiện
- Filter đối tác (admin)
- Số liệu qty, pendingOut, condition, HSD

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tra cứu tồn vị trí

1. Chọn đối tác (admin) → xem bảng theo vị trí hoặc package.
2. Xác định placeCode/SKU/qty để hỗ trợ pick/putaway.

## 5. Màn hình & thao tác UI

### Vị trí sản phẩm

- **Đường dẫn:** `/products/locations`
- **Mô tả:** Hai bảng/tabs location & package.

## 6. Dữ liệu & trường thông tin

### ProductLocation

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| placeCode | Mã vị trí/bin | Có |
| sku / qty / pendingOut | Tồn & chờ xuất | Có |
| condition | new|damaged|expired | Không |
| partnerName | Đối tác sở hữu | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `pickable` | Có thể lấy | Sẵn sàng pick |
| `ready_storage` | Sẵn sàng lưu | Chờ putaway |
| `ready_handover` | Sẵn sàng bàn giao | Chờ handover |

## 7. Quy tắc nghiệp vụ

1. Admin thấy mọi đối tác (có filter); dữ liệu customer-scope khi portal khách.
2. pendingOut không vượt qty.

## 8. Phân quyền

- **Permission key gợi ý:** `catalog.locations.view / filter`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Đổi tab location/package đúng dữ liệu.
2. Filter đối tác thu hẹp list.
