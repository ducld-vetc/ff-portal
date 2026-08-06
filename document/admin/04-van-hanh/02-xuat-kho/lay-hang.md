# Lấy hàng (Picking)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Xuất kho |
| Menu | Vận hành → Xuất kho → Lấy hàng |
| Route | `/operations/picking` |
| Actor chính | Điều phối pick, picker |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Tạo và quản lý danh sách lấy hàng (pick list).
- Phân công picker, theo dõi SLA, trạng thái pick.
- Hỗ trợ gộp/hủy/ xác định vị trí (theo thiết kế UI).

## 3. Phạm vi

### Trong phạm vi
- List pick list + filter nâng cao inline
- Tạo pick list từ OR thỏa điều kiện
- Chi tiết pick list + dòng vị trí/SKU
- Bulk assign / merge / cancel (demo/đầy đủ)

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo & phân công

1. Tạo pick list: chọn loại (PTO/PTS/PTD/…), điều kiện lọc OR, chọn đơn.
2. Hệ thống sinh pick list + dòng allocate bin.
3. Trên list: gán nhân viên → status ready/picking.
4. Picker thực hiện; cập nhật pickedQty đến picked.

## 5. Màn hình & thao tác UI

### Danh sách

- **Đường dẫn:** `/operations/picking`
- **Mô tả:** Toolbar tìm + filter trạng thái/ưu tiên/đối tác/người tạo/assignee + chưa phân công.
- **Thao tác chính:**
  - Tạo
  - Gán
  - Gộp
  - Hủy
  - Mở chi tiết

### Tạo pick list

- **Đường dẫn:** `/operations/picking/create`
- **Mô tả:** Wizard điều kiện + chọn OR.

### Chi tiết

- **Đường dẫn:** `/operations/picking/:id`
- **Mô tả:** Header + bảng dòng pick (vị trí, SKU, lot, HSD…).

## 6. Dữ liệu & trường thông tin

### PickList

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code | Mã DS lấy hàng | Có |
| type | PTO/PTS/PTD/Cluster/SIO/SSO/MSMQ… | Có |
| priority / slaState | Ưu tiên & on_time/late | Có |
| assignee | Picker được gán | Không |
| lines[] | location, sku, qty, pickedQty, lot, outboundCode | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `ready` | Sẵn sàng | Chưa/đang chờ pick |
| `picking` | Đang lấy | Đang thực hiện |
| `picked` | Đã lấy xong | Hoàn tất pick |
| `cancelled` | Đã hủy | Hủy DS |

## 7. Quy tắc nghiệp vụ

1. Chỉ gán khi chưa cancelled.
2. pickedQty không vượt qty.
3. SLA late khi quá hạn mốc pick.
4. Filter “Chưa phân công” = assignee trống.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.picking.view / create / assign`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Tạo DS từ OR hợp lệ.
2. Gán picker cập nhật assignee.
3. Chi tiết hiển thị đúng dòng allocate.
