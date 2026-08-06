# Yêu cầu xuất kho

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Xuất kho |
| Menu | Vận hành → Xuất kho → Yêu cầu xuất kho |
| Route | `/operations/outbound` |
| Actor chính | Ops xuất kho, điều phối picking, CS |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Theo dõi toàn bộ đơn xuất (OR) từ sẵn sàng lấy hàng đến bàn giao vận chuyển.
- Hỗ trợ lấy hàng nhanh, gán pick list, theo dõi SLA đóng gói/bàn giao.

## 3. Phạm vi

### Trong phạm vi
- List OR + advanced filters
- Detail tabs: thông tin đơn, SP, SLA, VC
- Gán/ tạo pick list từ detail

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Xử lý đơn xuất

1. Lọc OR theo trạng thái/độ ưu tiên/đối tác/kênh…
2. Mở chi tiết → kiểm tra dòng hàng & tồn khả dụng.
3. Tạo/gán pick list cho picker.
4. Theo dõi SLA picking/packing/handover.

## 5. Màn hình & thao tác UI

### Danh sách OR

- **Đường dẫn:** `/operations/outbound`
- **Mô tả:** Bảng OR nhiều cột + lọc nâng cao + quick actions.
- **Thao tác chính:**
  - Tìm
  - Lọc
  - Lấy hàng nhanh (demo)
  - Mở chi tiết

### Chi tiết OR

- **Đường dẫn:** `/operations/outbound/:id`
- **Mô tả:** Tabs thông tin / sản phẩm / packing note / carrier / assign pick.
- **Thao tác chính:**
  - Tạo pick list
  - Cập nhật thông tin VC

## 6. Dữ liệu & trường thông tin

### OutboundRequest

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code / partnerOrCode | Mã OR & mã đối tác | Có |
| priority | normal | high | urgent | Có |
| deliveryMethod | pickup | delivery | Có |
| buyer*, address*, COD/paid/declared | Thông tin giao hàng & giá trị | Không |
| carrierCode / trackingCode | ĐVVC & vận đơn | Không |
| lines[] | qty, availableQty, assignedQty, condition, unitPrice | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `new` | Sẵn sàng lấy hàng | Chờ pick |
| `picking` | Đang lấy hàng | Đã có phiên pick |
| `packed` | Đã đóng gói | Đóng gói xong |
| `shipped` | Đã bàn giao | Đã handover ĐVVC |
| `cancelled` | Đã hủy | Hủy đơn |

## 7. Quy tắc nghiệp vụ

1. Không gán pick vượt availableQty.
2. SLA hiển thị trễ nếu quá hạn mốc picking/packing.
3. Đơn B2B có thể có quy trình pick riêng (xem Lấy hàng B2B).

## 8. Phân quyền

- **Permission key gợi ý:** `operations.outbound.view / quick_pick`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Filter phức hợp hoạt động đúng.
2. Từ detail tạo được pick list.
3. Trạng thái OR phản ánh tiến trình pick/pack/ship.
