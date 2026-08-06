# Quản lý cửa hàng

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Kênh bán hàng |
| Menu | Kênh bán hàng → Quản lý cửa hàng |
| Route | `/client/stores` |
| Actor chính | Partner, admin kênh |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Kết nối/ quản lý gian hàng trên kênh (Shopee, TikTok…).
- Theo dõi trạng thái kết nối, lỗi đơn, đồng bộ SP/đơn/tồn.
- Ngắt kết nối khi cần.

## 3. Phạm vi

### Trong phạm vi
- List theo tab sức khỏe kết nối
- Thêm cửa hàng
- Chi tiết sync
- Disconnect

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Thêm cửa hàng

1. Thêm → chọn kênh, nhập shopId/code/name → kết nối.
2. Bật sync products/orders/inventory.

### 4.2. Ngắt kết nối

1. Mở cửa hàng → Disconnect → xác nhận dừng OMS sync.

## 5. Màn hình & thao tác UI

### Danh sách cửa hàng

- **Đường dẫn:** `/client/stores`
- **Mô tả:** Tabs active/expired/error/disconnected.

### Chi tiết

- **Đường dẫn:** `/client/stores/:id`
- **Mô tả:** Cấu hình sync & liên kết kho.

## 6. Dữ liệu & trường thông tin

### SalesStore

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| channel / shopId / shopCode / shopName | Định danh gian | Có |
| syncProducts/Orders/Inventory | Cờ đồng bộ | Không |
| warehouseLinked / linkedWarehouseCode | Kho liên kết | Không |
| errorOrders / expiredAt | Sức khỏe kết nối | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `active` | Đã kết nối | OK |
| `expired_connection` | Hết hạn kết nối | Token hết hạn |
| `error_orders` | Đơn lỗi | Có lỗi đồng bộ đơn |
| `disconnected` | Đã ngắt kết nối | Ngắt tay |

## 7. Quy tắc nghiệp vụ

1. Portal customer chỉ thấy store của mình.
2. Disconnect dừng sync OMS.
3. Admin có màn tương đương /customers/stores (không gắn badge Mới).

## 8. Phân quyền

- **Permission key gợi ý:** `client.stores.*`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Thêm store vào đúng tab.
2. Disconnect đổi status disconnected.
3. Không thấy store customer khác.
