# Vật tư

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Thiết lập |
| Menu | Thiết lập → Vật tư |
| Route | `/warehouses/materials` |
| Actor chính | Admin kho, quản lý vật tư đóng gói |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý vật tư đóng gói (carton, túi, filler, nhãn…) theo kho hoặc đối tác.
- In mã barcode vật tư để dùng trên sàn thao tác.

## 3. Phạm vi

### Trong phạm vi
- CRUD vật tư
- Lọc theo owner/kho/đối tác/loại
- Tính thể tích từ kích thước
- In barcode số lượng tùy chọn

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (hiện tại UI demo/mock).
- Mobile app native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo vật tư

1. Mở danh sách Vật tư → Thêm.
2. Chọn owner (kho/đối tác); nếu đối tác thì bắt buộc chọn partner.
3. Nhập loại, tên, mã, kích thước, khối lượng.
4. Lưu; hệ thống tính volume.

### 4.2. In barcode

1. Chọn vật tư → In mã.
2. Nhập số lượng tem → In (popup/máy in).

## 5. Màn hình & thao tác UI

### Danh sách vật tư

- **Đường dẫn:** `/warehouses/materials`
- **Mô tả:** Bảng + bộ lọc nâng cao.
- **Thao tác chính:**
  - Thêm
  - Sửa
  - In barcode
  - Lọc

### Modal tạo/sửa

- **Mô tả:** Form thông tin vật tư.

## 6. Dữ liệu & trường thông tin

### Material

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| ownerType | warehouse | partner | Có |
| partnerName | Bắt buộc nếu owner=partner | Không |
| type | CARTON/BAG/FILLER/LABEL/OTHER | Có |
| code / name | Mã & tên | Có |
| L×W×H (cm), weight (g) | Kích thước & khối lượng | Không |
| volume | Tính từ kích thước | Không |

## 7. Quy tắc nghiệp vụ

1. Partner bắt buộc khi ownerType = partner.
2. Volume = L×W×H (đơn vị cm³/quy ước hệ thống).
3. Mã vật tư unique trong phạm vi kho/đối tác.

## 8. Phân quyền

- **Permission key gợi ý:** `warehouses.materials.view / create / update`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Không lưu được khi thiếu partner (owner=partner).
2. In barcode mở được template tem.
3. Lọc danh sách đúng theo điều kiện.
