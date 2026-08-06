# Vấn đề phát sinh

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Tiện ích |
| Menu | Vận hành → Tiện ích → Vấn đề phát sinh |
| Route | `/operations/issues` |
| Actor chính | Picker, putaway, supervisor kho |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Ghi nhận và theo dõi sự cố tồn kho tại vị trí: mất hàng, hư hỏng, thừa, sai nhãn, thiếu khi lấy.
- Hỗ trợ đối soát SL hệ thống vs SL tìm thấy, kèm hình ảnh sản phẩm.

## 3. Phạm vi

### Trong phạm vi
- Danh sách vấn đề + lọc ngày/trạng thái/loại
- Hiển thị ảnh SP, vị trí, SKU, lô, serial, HSD

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tra cứu & xử lý

1. Lọc theo trạng thái (mặc định Mới) và khoảng ngày.
2. Tìm theo mã/tên SP hoặc vị trí.
3. Xem chi tiết dòng: SL, SL tìm thấy, tình trạng → chuyển xử lý/đã xử lý (backend).

## 5. Màn hình & thao tác UI

### Danh sách vấn đề

- **Đường dẫn:** `/operations/issues`
- **Mô tả:** Bảng nhiều cột gồm Hình ảnh sản phẩm.
- **Thao tác chính:**
  - Tìm
  - Lọc
  - (Tương lai) Đổi trạng thái

## 6. Dữ liệu & trường thông tin

### OpsIssue

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| locationCode | Vị trí phát sinh | Có |
| sku / partnerSku / productName / imageUrl | Thông tin SP | Có |
| type | lost|damaged|surplus|wrong_label|shortage | Có |
| qty / foundQty | SL báo cáo / tìm thấy | Có |
| goodsCondition / lotCode / serialOrLabel / expiryDate | Chi tiết hàng | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `new` | Mới | Mới ghi nhận |
| `processing` | Đang xử lý | Đang xử lý |
| `resolved` | Đã xử lý | Đóng case |
| `cancelled` | Đã hủy | Hủy |

## 7. Quy tắc nghiệp vụ

1. Mỗi issue gắn 1 vị trí + 1 SKU (hoặc serial).
2. foundQty ≤ qty trừ case surplus (tùy rule).
3. Ảnh SP lấy từ master catalog.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.utils.issues`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Cột hình ảnh hiển thị thumbnail.
2. Lọc trạng thái/loại/ngày đúng.
3. Tìm theo vị trí/SKU/tên SP.
