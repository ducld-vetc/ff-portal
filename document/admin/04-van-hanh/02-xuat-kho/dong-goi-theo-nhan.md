# Đóng gói theo nhãn

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Xuất kho |
| Menu | Vận hành → Xuất kho → Đóng gói theo nhãn |
| Route | `/operations/packing-by-label` |
| Actor chính | Nhân viên packing |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Đóng gói bằng cách quét nhãn vận đơn (label/tracking) thay vì thiết bị chứa hàng.
- Cùng trải nghiệm station như Đóng gói.

## 3. Phạm vi

### Trong phạm vi
- UI giống Đóng gói (mode=label)
- Quét mã nhãn / vận đơn
- Bảng đơn đã xử lý + chứng từ + lấy mã vận đơn

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Đóng gói theo nhãn

1. Quét nhãn vận đơn → xác nhận.
2. Hệ thống map OR; chặn nhãn đã đóng gói.
3. Ghi nhận vào danh sách đã xử lý.

## 5. Màn hình & thao tác UI

### Packing by label

- **Đường dẫn:** `/operations/packing-by-label`
- **Mô tả:** AdminPackingPage mode=label.
- **Thao tác chính:**
  - Quét nhãn
  - In chứng từ
  - Lấy mã vận đơn

## 6. Dữ liệu & trường thông tin

### PackedOrderRow

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| deviceCode | Lưu mã nhãn đã quét | Có |
| trackingCode | Thường = mã nhãn hoặc mã VC | Không |

## 7. Quy tắc nghiệp vụ

1. Không trùng mã nhãn đã đóng gói.
2. Copy UI/CTA khác Đóng gói (theo nhãn).

## 8. Phân quyền

- **Permission key gợi ý:** `operations.packing.label`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Quét nhãn tạo dòng mới.
2. Quét trùng báo lỗi.
