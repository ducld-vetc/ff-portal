# Điều chỉnh tồn

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Tồn kho |
| Menu | Vận hành → Tồn kho → Điều chỉnh tồn |
| Route | `/operations/inventory-adjust` |
| Actor chính | Ops tồn kho, supervisor |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Tạo phiếu điều chỉnh tăng/giảm tồn theo đối tác.
- Xác nhận hoàn thành bằng mã PIN; hủy phiếu khi chưa xác nhận.

## 3. Phạm vi

### Trong phạm vi
- List phiếu
- Tạo tăng / tạo giảm (chọn SP từ tồn)
- Chi tiết + Hoàn thành (PIN) / Hủy

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo điều chỉnh giảm

1. Chọn Điều chỉnh giảm → chọn đối tác.
2. Thêm+ → modal chọn SP (tình trạng, lô, tồn, tồn vị trí, chênh lệch) → nhập SL giảm → Lưu.
3. Tạo phiếu status=new → sang màn xem.
4. Hoàn thành → nhập PIN → confirmed.

### 4.2. Tạo điều chỉnh tăng

1. Tương tự nhưng hướng increase; nhập SL tăng; có thể nhập số lô/ngày.

## 5. Màn hình & thao tác UI

### Danh sách

- **Đường dẫn:** `/operations/inventory-adjust`
- **Mô tả:** Filter inline: loại/trạng thái/đối tác/người tạo/chưa xác nhận.
- **Thao tác chính:**
  - Tăng
  - Giảm
  - Mở chi tiết

### Tạo tăng/giảm

- **Đường dẫn:** `/operations/inventory-adjust/increase|decrease`
- **Mô tả:** Bảng SP + sidebar đối tác/ghi chú.

### Chi tiết

- **Đường dẫn:** `/operations/inventory-adjust/:id`
- **Mô tả:** Xem SP, lịch sử; Hoàn thành/Hủy khi new.

## 6. Dữ liệu & trường thông tin

### InventoryAdjustment

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| direction | increase | decrease | Có |
| partnerName | Đối tác | Có |
| lines[] | SKU, lot, qty, goodsCondition | Có |
| status | new|confirmed|cancelled | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `new` | Mới | Chờ xác nhận |
| `confirmed` | Đã xác nhận | Đã hoàn thành |
| `cancelled` | Đã hủy | Hủy phiếu |

## 7. Quy tắc nghiệp vụ

1. Bắt buộc đối tác và ≥1 dòng SP trước khi tạo.
2. SL giảm không vượt tồn kho dòng chọn.
3. Hoàn thành yêu cầu PIN đúng (cấu hình hệ thống).
4. Chỉ Hủy/Hoàn thành khi status=new.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.inventory.adjust.view / create / confirm`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Tạo tăng/giảm ra phiếu new.
2. PIN sai không confirm.
3. Hủy đổi cancelled.
