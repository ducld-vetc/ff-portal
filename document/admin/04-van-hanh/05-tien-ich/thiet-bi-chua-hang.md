# Thiết bị chứa hàng

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Tiện ích |
| Menu | Vận hành → Tiện ích → Thiết bị chứa hàng |
| Route | `/operations/container-devices` |
| Actor chính | Supervisor sàn, điều phối packing/putaway |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Giám sát thiết bị chứa hàng (Tote/Pallet/Cart) theo trạng thái vận hành và mức độ trễ (N+0…N5+).
- Drill-down danh sách thiết bị; theo dõi kiện lưu kho hàng hủy.

## 3. Phạm vi

### Trong phạm vi
- Tab ma trận thiết bị chứa hàng
- Modal chi tiết theo ô ma trận
- Tab kiện hàng lưu kho hàng hủy (list)
- Xuất file chi tiết

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Theo dõi ma trận thiết bị

1. Chọn loại thiết bị (Tote…).
2. Xem số liệu theo status × age bucket; click ô → modal danh sách thiết bị.
3. Lọc vị trí / xuất file chi tiết.

### 4.2. Kiện hàng hủy

1. Sang tab Kiện hàng lưu kho hàng hủy.
2. Lọc trạng thái, tìm mã kiện/OR, xuất file.

## 5. Màn hình & thao tác UI

### Danh sách thiết bị (matrix)

- **Đường dẫn:** `/operations/container-devices`
- **Mô tả:** Tabs + matrix N+0…N5+ + max delay days.

### Modal chi tiết thiết bị

- **Mô tả:** Bảng mã thiết bị, SL SKU, SL SP, người thao tác.

### Tab kiện hủy

- **Mô tả:** List: mã xuất kho, mã kiện, trạng thái, số ngày hoàn, SKU, SL, người thao tác.

## 6. Dữ liệu & trường thông tin

### ContainerDeviceRow

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code / deviceType | Mã & loại Tote/Pallet/Cart | Có |
| status / ageBucket | Trạng thái & N+k | Có |
| skuCount / productQty / operator | Số liệu & người thao tác | Không |

### CancelledPackageRow

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| outboundCode / packageCode | Mã OR & kiện | Có |
| returnDaysLabel | N+0, N+1… | Có |
| skuCount / productQty | Số lượng | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `ready` | Sẵn sàng | Sẵn sàng dùng |
| `ready_putaway` | Sẵn sàng lưu kho | Chờ putaway |
| `ready_packing` | Sẵn sàng đóng gói | Chờ pack |
| `packing` | Đang đóng gói | Đang pack |
| `pick_shortage` | Lấy hàng bị thiếu | Shortage |
| `ready_cancelled_putaway` | Sẵn sàng lưu kho hàng hủy | Hàng hủy chờ lưu |

## 7. Quy tắc nghiệp vụ

1. Ô ma trận = (số thiết bị, tổng SL sản phẩm).
2. Age bucket phản ánh ngày giữ thiết bị/trạng thái.
3. Tab hủy là list kiện, không dùng matrix.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.utils.container_devices`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Click ô mở đúng tập thiết bị.
2. Tab hủy đúng cột theo UI.
3. Xuất file theo bộ lọc hiện tại.
