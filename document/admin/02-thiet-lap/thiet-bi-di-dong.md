# Thiết bị di động

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Thiết lập |
| Menu | Thiết lập → Thiết bị di động |
| Route | `/warehouses/storage-devices` |
| Actor chính | Admin kho, supervisor |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Đăng ký thiết bị di động / chứa hàng luân chuyển (rack unit, pallet rack, bin…) gắn kho.
- Import hàng loạt và in barcode thiết bị phục vụ scan trên sàn.

## 3. Phạm vi

### Trong phạm vi
- CRUD thiết bị
- Import CSV
- In barcode Code39
- Gắn loại vị trí & chế độ manual/auto

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (hiện tại UI demo/mock).
- Mobile app native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo thiết bị

1. Thêm thiết bị → nhập mã, tên, loại, kích thước, locationType, mode, kho.
2. Lưu vào danh sách kho tương ứng.

### 4.2. Import CSV

1. Chọn file CSV đúng schema → validate → import.
2. Báo lỗi dòng không hợp lệ.

## 5. Màn hình & thao tác UI

### Danh sách / Form / Import / Print

- **Đường dẫn:** `/warehouses/storage-devices`
- **Mô tả:** Quản lý master thiết bị theo kho.
- **Thao tác chính:**
  - Thêm
  - Sửa
  - Import
  - In barcode

## 6. Dữ liệu & trường thông tin

### StorageDevice

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code | Mã thiết bị (scan được) | Có |
| deviceType | RACK, SHELF_UNIT, PALLET_RACK, BIN_CABINET, CAGE… | Có |
| locationType | SHELF/PALLET/BIN/FLOOR/CAGE | Có |
| mode | manual | auto | Có |
| warehouseCode | Kho sở hữu | Có |

## 7. Quy tắc nghiệp vụ

1. Mã thiết bị unique theo kho.
2. In barcode dùng mã `code`.
3. Thiết bị dùng cho packing/picking (scan thiết bị chứa hàng).

## 8. Phân quyền

- **Permission key gợi ý:** `warehouses.storage_devices.*`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Import CSV tạo được nhiều bản ghi.
2. In barcode hiển thị đúng mã.
3. Lọc theo kho hoạt động đúng.
