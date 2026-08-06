# Lấy hàng B2B

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Xuất kho |
| Menu | Vận hành → Xuất kho → Lấy hàng B2B |
| Route | `/operations/picking-b2b` |
| Actor chính | Điều phối B2B, picker B2B |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý pick list dành riêng đơn B2B (lô lớn, quy trình khác Order lẻ).
- Tái sử dụng UI/luồng Lấy hàng với filter isB2b.

## 3. Phạm vi

### Trong phạm vi
- List pick list B2B only
- Cùng thao tác gán/tạo/chi tiết như Lấy hàng

### Ngoài phạm vi
- Quy trình billing B2B riêng
- Hợp đồng khách B2B

## 4. Luồng nghiệp vụ

### 4.1. Xử lý pick B2B

1. Mở Lấy hàng B2B → chỉ thấy pick list isB2b=true.
2. Tạo/gán/theo dõi tương tự Lấy hàng (route create dùng chung /operations/picking/create).

## 5. Màn hình & thao tác UI

### Danh sách B2B

- **Đường dẫn:** `/operations/picking-b2b`
- **Mô tả:** AdminPickingListPage b2bOnly.
- **Thao tác chính:**
  - Giống Lấy hàng

## 6. Dữ liệu & trường thông tin

### PickList (B2B)

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| isB2b | true | Có |
| (các trường khác) | Giống Lấy hàng | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `ready` | Sẵn sàng | … |
| `picking` | Đang lấy | … |
| `picked` | Đã lấy xong | … |
| `cancelled` | Đã hủy | … |

## 7. Quy tắc nghiệp vụ

1. Chỉ hiển thị/ thao tác pick list B2B.
2. Không lẫn Order lẻ vào list này.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.picking.b2b`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. List không chứa pick list non-B2B.
2. Tạo từ OR B2B gắn isB2b.
