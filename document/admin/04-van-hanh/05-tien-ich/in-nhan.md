# In nhãn

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Tiện ích |
| Menu | Vận hành → Tiện ích → In nhãn |
| Route | `/operations/print-labels` |
| Actor chính | Ops, packing, putaway |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý lệnh in nhãn: vận đơn, vị trí, barcode thiết bị.
- Theo dõi trạng thái đã in / chờ in và máy in.

## 3. Phạm vi

### Trong phạm vi
- Danh sách lệnh in
- Tạo lệnh in (UI)
- Trạng thái & thời điểm in

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo & theo dõi lệnh in

1. Chọn In nhãn → nhập loại, tham chiếu, số bản, máy in.
2. Hệ thống đưa vào hàng đợi / in ngay.
3. Cập nhật status Đã in + printedAt.

## 5. Màn hình & thao tác UI

### Danh sách in nhãn

- **Đường dẫn:** `/operations/print-labels`
- **Mô tả:** Bảng lệnh in + tạo mới.
- **Thao tác chính:**
  - In nhãn
  - Tìm kiếm
  - Xuất

## 6. Dữ liệu & trường thông tin

### PrintLabelJob

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| labelType | Nhãn vận đơn / vị trí / thiết bị… | Có |
| relatedCode | Mã tham chiếu | Có |
| copies | Số bản | Có |
| printer | Máy in | Có |
| printedAt | Thời điểm in | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `printed` | Đã in | Hoàn tất |
| `pending` | Chờ in | Trong hàng đợi |

## 7. Quy tắc nghiệp vụ

1. relatedCode phải tồn tại theo loại nhãn.
2. copies ≥ 1.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.utils.print_labels`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Tạo lệnh in ghi nhận đúng loại/máy in.
2. Đổi trạng thái sau khi in thành công.
