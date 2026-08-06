# Xuất kho lỗi (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm — portal **Khách hàng / Partner**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Vận hành |
| Menu | Vận hành → Xuất kho lỗi |
| Route | `/client/operations/error-outbound` |
| Actor chính | Partner CS / ops |
| Mức độ ưu tiên | Cao |

## 2. Mục tiêu nghiệp vụ

- Tập trung các yêu cầu xuất kho bị lỗi hoặc cần xử lý đặc biệt (sai địa chỉ, thiếu serial, hủy…).
- Giúp partner theo dõi nguyên nhân và trạng thái xử lý để sửa/tạo lại đơn.

## 3. Phạm vi

### Trong phạm vi
- Danh sách OR lỗi: mã, nguyên nhân, trạng thái, ngày tạo
- Tìm kiếm / làm mới / xuất Excel
- (Đích) Liên kết sang OR gốc, thao tác hủy/sửa/tạo lại

### Ngoài phạm vi
- Thao tác kho nội bộ (check-in vật lý, picking sàn) — thuộc portal Admin.
- Tích hợp ERP đối tác (có thể bổ sung API sau).

## 4. Luồng nghiệp vụ

### 4.1. Xử lý đơn lỗi

1. Hệ thống/kho đánh dấu OR lỗi với reason code.
2. Partner mở Xuất kho lỗi → lọc đơn Chờ xử lý.
3. Xem nguyên nhân → sửa địa chỉ/serial hoặc hủy → tạo lại OR nếu cần.
4. Cập nhật trạng thái Đã xử lý / Đã hủy.

## 5. Màn hình & thao tác UI

### Danh sách xuất kho lỗi

- **Đường dẫn:** `/client/operations/error-outbound`
- **Mô tả:** Bảng mã lỗi, nguyên nhân, trạng thái.
- **Thao tác chính:**
  - Tìm
  - Làm mới
  - Xuất Excel
  - (Đích) Xử lý/Hủy

## 6. Dữ liệu & trường thông tin

### ErrorOutbound

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code | Mã OR lỗi / mã case | Có |
| reason | Nguyên nhân (sai địa chỉ, thiếu serial…) | Có |
| status | Chờ xử lý | Đã xử lý | Đã hủy | Có |
| outboundId | Tham chiếu OR gốc | Không |
| createdAt | Thời điểm phát sinh | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `pending` | Chờ xử lý | Cần partner/kho xử lý |
| `resolved` | Đã xử lý | Đã sửa/xử lý xong |
| `cancelled` | Đã hủy | Hủy case/đơn |

## 7. Quy tắc nghiệp vụ

1. Mọi bản ghi scoped theo customer.
2. Reason bắt buộc khi đánh dấu lỗi.
3. Sau khi hủy OR gốc, case có thể chuyển Đã hủy.
4. Không xóa cứng lịch sử lỗi (phục vụ audit).

## 8. Phân quyền & phạm vi dữ liệu

- **Permission key gợi ý:** `client.operations.error_outbound.*`
- Chỉ xem/tạo/sửa dữ liệu thuộc customer đang đăng nhập.
- Không truy cập được yêu cầu của đối tác khác.

## 9. Tích hợp & API (đề xuất)

- GET danh sách (filter, phân trang, scoped)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / đổi trạng thái (theo quyền)

## 10. Tiêu chí nghiệm thu

1. List hiển thị đúng reason/status.
2. Không thấy case của customer khác.
3. Làm mới/tìm kiếm hoạt động.

## 11. Liên quan

- Customer: [Xuất kho](./xuat-kho.md)
