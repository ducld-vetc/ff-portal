# Lịch sử vị trí sản phẩm

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Sản phẩm |
| Menu | Sản phẩm → Lịch sử vị trí sản phẩm |
| Route | `/products/location-history` |
| Actor chính | Ops, auditor |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Truy vết di chuyển hàng theo phiên làm việc (nhập/xuất/điều chuyển/kiểm kê…).
- Xuất CSV đối soát.

## 3. Phạm vi

### Trong phạm vi
- List lịch sử
- Filter đối tác / phiên / khoảng ngày
- Export CSV

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Đối soát lịch sử

1. Chọn filter → xem nguồn/đích vị trí, lô, SL, người cập nhật.
2. Xuất CSV khi cần.

## 5. Màn hình & thao tác UI

### Lịch sử vị trí

- **Đường dẫn:** `/products/location-history`
- **Mô tả:** Bảng movement + export.

## 6. Dữ liệu & trường thông tin

### LocationHistory

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| ioType / ioCode / session | Loại chứng từ & phiên | Có |
| sourceLocation / destLocation | Từ → Đến | Có |
| sku / qty / lot / serial | Hàng di chuyển | Có |
| updatedBy / updatedAt | Ai/Khi | Có |

## 7. Quy tắc nghiệp vụ

1. Lịch sử append-only.
2. Export tên file có timestamp.

## 8. Phân quyền

- **Permission key gợi ý:** `catalog.location_history.view / export`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET /api/product-location-history
- GET export CSV

## 10. Tiêu chí nghiệm thu

1. Filter theo session/ngày đúng.
2. Export tải được CSV.
