# Đơn vị vận chuyển

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Đơn vị vận chuyển |
| Menu | Đơn vị vận chuyển → Đơn vị vận chuyển |
| Route | `/carriers` |
| Actor chính | Admin cấu hình VC |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý master danh sách hãng vận chuyển (GHN, GHTK, J&T…).

## 3. Phạm vi

### Trong phạm vi
- CRUD carrier
- Active/inactive
- Cờ hỗ trợ COD

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Thêm ĐVVC

1. Thêm → mã, tên, dịch vụ, COD → Lưu active.

## 5. Màn hình & thao tác UI

### Carriers

- **Đường dẫn:** `/carriers`
- **Mô tả:** CarriersManager CRUD.

## 6. Dữ liệu & trường thông tin

### Carrier

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code / name | Mã & tên | Có |
| service | Loại dịch vụ | Không |
| supportCod | boolean | Không |
| status | active|inactive | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `active` | Active | Đang dùng |
| `inactive` | Inactive | Ngưng |

## 7. Quy tắc nghiệp vụ

1. Code unique.
2. Inactive không cho tạo tài khoản/gói mới (rule đích).

## 8. Phân quyền

- **Permission key gợi ý:** `carriers.units.*`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. CRUD carrier thành công.
2. Inactive ẩn khỏi dropdown tạo account.
