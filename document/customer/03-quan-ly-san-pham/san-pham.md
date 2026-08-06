# Sản phẩm (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Quản lý sản phẩm |
| Menu | Quản lý sản phẩm → Sản phẩm |
| Route | `/client/catalog` |
| Actor chính | Partner catalog |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Đối tác tự quản lý SKU thuộc về mình.
- Không cần/không được chọn customer khác.

## 3. Phạm vi

### Trong phạm vi
- List/create/edit SKU scoped
- Cùng model CatalogProduct

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo SKU của tôi

1. Thêm sản phẩm → form không chọn customer (auto gắn).
2. Lưu; chỉ hiện trong catalog của partner.

## 5. Màn hình & thao tác UI

### Catalog Customer

- **Đường dẫn:** `/client/catalog`
- **Mô tả:** CatalogPage isCustomer — ẩn cột/filter customer.

## 6. Dữ liệu & trường thông tin

### CatalogProduct

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| (như Admin Product & SKU) | customerId = session | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `active` | Active | … |
| `inactive` | Inactive | … |

## 7. Quy tắc nghiệp vụ

1. Auto-scope customerId.
2. Không xem/sửa SKU đối tác khác.

## 8. Phân quyền

- **Permission key gợi ý:** `catalog.* (customer scope)`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. SKU tạo ra chỉ thuộc customer đăng nhập.
2. Không có filter chọn customer.
