# Cập nhật đơn xuất

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Vận chuyển |
| Menu | Vận hành → Vận chuyển → Cập nhật đơn xuất |
| Route | `/operations/outbound-update` |
| Actor chính | Ops, hệ thống (webhook) |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Tra cứu lịch sử đổi trạng thái OR (manual hoặc webhook ĐVVC).
- Phục vụ đối soát và hỗ trợ sự cố giao hàng.

## 3. Phạm vi

### Trong phạm vi
- Danh sách lịch sử cập nhật
- Tìm kiếm
- Xuất Excel (demo)

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tra cứu lịch sử

1. Mở màn → tìm theo mã OR/người cập nhật.
2. Xem fromStatus → toStatus, nguồn, thời điểm.

## 5. Màn hình & thao tác UI

### Danh sách lịch sử

- **Đường dẫn:** `/operations/outbound-update`
- **Mô tả:** Bảng audit cập nhật OR.
- **Thao tác chính:**
  - Tìm
  - Xuất Excel

## 6. Dữ liệu & trường thông tin

### OutboundStatusUpdate

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| outboundCode | Mã OR | Có |
| fromStatus / toStatus | Trạng thái trước/sau | Có |
| source | Manual | Webhook ĐVVC | … | Có |
| updatedBy / updatedAt | Ai/Khi nào | Có |

## 7. Quy tắc nghiệp vụ

1. Bản ghi lịch sử chỉ-đọc (append-only).
2. Webhook ĐVVC ghi source tương ứng.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.shipping.outbound_update`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET /api/outbound-updates
- POST internal từ webhook carrier

## 10. Tiêu chí nghiệm thu

1. Hiển thị đúng lịch sử seed/API.
2. Tìm kiếm theo mã OR.
