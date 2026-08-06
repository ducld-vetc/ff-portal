# Product & SKU

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Sản phẩm |
| Menu | Sản phẩm → Product & SKU |
| Route | `/catalog` |
| Actor chính | Catalog admin, ops master data |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý master sản phẩm/SKU theo khách hàng: lưu trữ, UOM, hạn dùng, quy tắc xuất (FEFO/LEFO).
- Import và kích hoạt/ngưng SKU.

## 3. Phạm vi

### Trong phạm vi
- List + filter khách hàng
- Form tạo/sửa (ProductFormModal)
- Import (UI)

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo SKU

1. Thêm sản phẩm → chọn customer, SKU, thuộc tính lưu trữ/bundle/hạn dùng.
2. Lưu active; dùng cho inbound/outbound/locations.

## 5. Màn hình & thao tác UI

### Catalog

- **Đường dẫn:** `/catalog`
- **Mô tả:** Danh sách SKU + modal form.
- **Thao tác chính:**
  - Thêm
  - Sửa
  - Import

## 6. Dữ liệu & trường thông tin

### CatalogProduct

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| customerId / sku / name | Định danh | Có |
| storageType | serial | non_serial | Có |
| productKind / bundleKind | single/bundle | Có |
| units[] / categories[] | ĐVT & danh mục | Có |
| outboundRule | fefo|lefo|none | Không |
| trackExpiry / shelfLife… | Cấu hình hạn dùng | Không |
| status | active|inactive | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `active` | Active | Đang dùng |
| `inactive` | Inactive | Ngưng |

## 7. Quy tắc nghiệp vụ

1. SKU unique theo customer.
2. Bundle cần bundleKind.
3. Serial storage yêu cầu quản lý serial khi xuất/nhập (nếu bật).

## 8. Phân quyền

- **Permission key gợi ý:** `catalog.view / create / update / import`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Tạo SKU hiện trên list.
2. Filter theo customer.
3. Inactive không dùng cho tạo đơn mới (rule đích).
