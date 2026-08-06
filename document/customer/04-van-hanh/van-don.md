# Vận đơn (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm — portal **Khách hàng / Partner**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Vận hành |
| Menu | Vận hành → Vận đơn |
| Route | `/client/operations/waybills` |
| Actor chính | Partner logistics / CS |
| Mức độ ưu tiên | Cao |

## 2. Mục tiêu nghiệp vụ

- Quản lý vận đơn giao nhận: tạo, theo dõi, đổi trạng thái hàng loạt, in.
- Lưu thông tin lấy hàng / giao hàng, COD, gói VC, dòng SP.

## 3. Phạm vi

### Trong phạm vi
- Danh sách vận đơn + tìm theo mã/SĐT/người nhận
- Tạo vận đơn (lấy hàng + nhận hàng + SP)
- Chi tiết vận đơn
- Đổi trạng thái hàng loạt
- In / Import / Export (theo UI)

### Ngoài phạm vi
- Thao tác kho nội bộ (check-in vật lý, picking sàn) — thuộc portal Admin.
- Tích hợp ERP đối tác (có thể bổ sung API sau).

## 4. Luồng nghiệp vụ

### 4.1. Tạo vận đơn

1. Vận đơn → Thêm.
2. Nhập mã vận đơn đối tác, địa chỉ lấy, người liên hệ lấy hàng.
3. Nhập người nhận, SĐT, địa chỉ nhận, COD, giá trị đơn, gói VC, khối lượng.
4. Thêm dòng SP → Lưu status=Mới/Sẵn sàng lấy.

### 4.2. Cập nhật trạng thái hàng loạt

1. Chọn nhiều vận đơn → Đổi trạng thái → chọn trạng thái đích → Xác nhận.

## 5. Màn hình & thao tác UI

### Danh sách vận đơn

- **Đường dẫn:** `/client/operations/waybills`
- **Mô tả:** Bảng: mã VD, mã ĐT, người nhận, COD, trạng thái…
- **Thao tác chính:**
  - Thêm
  - Lọc
  - Đổi trạng thái
  - In
  - Import/Export
  - Xem

### Tạo vận đơn

- **Đường dẫn:** `/client/operations/waybills/create`
- **Mô tả:** Form lấy hàng / nhận hàng / sản phẩm.

### Chi tiết

- **Đường dẫn:** `/client/operations/waybills/:id`
- **Mô tả:** Xem đầy đủ thông tin & SP.

## 6. Dữ liệu & trường thông tin

### Waybill

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code / partnerWaybillCode | Mã VD hệ thống / đối tác | Có |
| pickupAddressCode / contactName / contactPhone | Điểm lấy & liên hệ | Có |
| recipientName / recipientPhone / recipientAddress | Người nhận | Có |
| cod / orderValue / declaredValue / weightKg | Giá trị & khối lượng | Không |
| shippingPackage | Gói VC | Không |
| lines[] | SP, qty, unitPrice, condition | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `new` | Mới | Mới tạo |
| `ready` | Sẵn sàng lấy | Chờ lấy hàng |
| `handed_over` | Đã bàn giao | Đã giao ĐVVC |
| `in_transit` | Đang giao | Đang vận chuyển |
| `delivered` | Đã giao | Giao thành công |
| `cancelled` | Đã hủy | Hủy |

## 7. Quy tắc nghiệp vụ

1. Scoped theo partner/customer.
2. Đổi trạng thái hàng loạt chỉ áp dụng tập đã chọn.
3. Cancelled là trạng thái kết thúc (không chuyển tiếp).
4. Có thể liên kết với OR kho hoặc độc lập (tùy mô hình triển khai).

## 8. Phân quyền & phạm vi dữ liệu

- **Permission key gợi ý:** `client.operations.waybills.*`
- Chỉ xem/tạo/sửa dữ liệu thuộc customer đang đăng nhập.
- Không truy cập được yêu cầu của đối tác khác.

## 9. Tích hợp & API (đề xuất)

- GET danh sách (filter, phân trang, scoped)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / đổi trạng thái (theo quyền)

## 10. Tiêu chí nghiệm thu

1. Tạo VD hiện trên list.
2. Bulk đổi trạng thái cập nhật đúng các dòng chọn.
3. Tìm theo SĐT/tên người nhận hoạt động.

## 11. Liên quan

- Customer: [Xuất kho](./xuat-kho.md)
