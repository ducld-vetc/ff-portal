# Đóng gói

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Xuất kho |
| Menu | Vận hành → Xuất kho → Đóng gói |
| Route | `/operations/packing` |
| Actor chính | Nhân viên packing |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Xác nhận đóng gói bằng cách quét mã thiết bị chứa hàng (tote/device).
- Ghi nhận đơn đã đóng gói; in chứng từ; lấy mã vận đơn nếu thiếu.

## 3. Phạm vi

### Trong phạm vi
- Scan station UI
- Bảng đơn đã xử lý
- In hóa đơn/nhãn/bảng kê/phiếu xuất (demo)
- Nút Lấy mã vận đơn khi thiếu tracking

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Đóng gói theo thiết bị

1. Quét/nhập mã thiết bị chứa hàng → Xác nhận.
2. Hệ thống map sang OR/partner/tracking (nếu có).
3. Thêm dòng vào danh sách đã xử lý; không cho quét trùng thiết bị đã đóng gói.
4. In chứng từ; nếu thiếu mã vận đơn → Lấy mã vận đơn.

## 5. Màn hình & thao tác UI

### Packing station

- **Đường dẫn:** `/operations/packing`
- **Mô tả:** Hero scan + bảng đơn đã đóng gói.
- **Thao tác chính:**
  - Quét xác nhận
  - In chứng từ
  - Lấy mã vận đơn

## 6. Dữ liệu & trường thông tin

### PackedOrderRow

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| deviceCode | Mã thiết bị quét | Có |
| outboundCode / partnerOrCode | Mã OR | Có |
| trackingCode | Mã vận đơn (optional) | Không |
| packedAt / partnerName | Thời điểm & đối tác | Có |

## 7. Quy tắc nghiệp vụ

1. Không đóng gói trùng cùng deviceCode trong phiên.
2. Thiếu trackingCode → hiện nút Lấy mã vận đơn.
3. Scan rỗng → cảnh báo.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.packing.view`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Quét thiết bị hợp lệ tạo dòng mới.
2. Quét trùng báo lỗi.
3. Lấy mã vận đơn cập nhật trackingCode.
