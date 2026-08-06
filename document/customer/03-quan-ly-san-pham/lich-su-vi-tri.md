# Lịch sử vị trí (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Quản lý sản phẩm |
| Menu | Quản lý sản phẩm → Lịch sử vị trí |
| Route | `/client/products/location-history` |
| Actor chính | Partner, auditor phía khách |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Đối tác theo dõi lịch sử di chuyển hàng của mình và xuất CSV.

## 3. Phạm vi

### Trong phạm vi
- List + filter phiên/ngày
- Export CSV
- Scope customer

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Đối soát

1. Lọc khoảng ngày/phiên → xem lịch sử → Xuất CSV.

## 5. Màn hình & thao tác UI

### Lịch sử vị trí

- **Đường dẫn:** `/client/products/location-history`
- **Mô tả:** Shared page; title vẫn 'Lịch sử vị trí sản phẩm'.

## 6. Dữ liệu & trường thông tin

### LocationHistory

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| (như Admin) | Scoped | Có |

## 7. Quy tắc nghiệp vụ

1. Chỉ lịch sử thuộc hàng của partner.
2. Export không gồm dữ liệu ngoài scope.

## 8. Phân quyền

- **Permission key gợi ý:** `catalog.location_history.view / export`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Filter/export trong đúng scope customer.
