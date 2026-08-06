# Quản lý nhân sự

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Nhân sự & truy cập |
| Menu | Nhân sự & truy cập → Quản lý nhân sự |
| Route | `/staff/users` |
| Actor chính | Admin hệ thống, HR nội bộ kho |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý tài khoản nhân sự kho: gán nhóm quyền, phạm vi khách hàng/kho.
- Kích hoạt / vô hiệu hóa tài khoản.

## 3. Phạm vi

### Trong phạm vi
- CRUD user (trừ hard delete nếu dùng deactivate)
- Gán nhiều role group
- Phạm vi customer/warehouse

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (hiện tại UI demo/mock).
- Mobile app native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo nhân sự

1. Thêm user → name, username, role groups, scope.
2. Mặc định scope Toàn cục nếu không chọn.
3. Lưu; trạng thái active.

## 5. Màn hình & thao tác UI

### Danh sách + Modal

- **Đường dẫn:** `/staff/users`
- **Mô tả:** Tìm kiếm, tạo/sửa, deactivate.
- **Thao tác chính:**
  - Thêm
  - Sửa
  - Vô hiệu hóa

## 6. Dữ liệu & trường thông tin

### StaffUser

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| username | Đăng nhập | Có |
| name | Họ tên | Có |
| roleGroupCodes | Danh sách nhóm quyền | Có |
| customerScope / warehouseScope | Phạm vi dữ liệu | Không |
| status | active | inactive | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `active` | Đang hoạt động | Đăng nhập được |
| `inactive` | Không hoạt động | Khóa đăng nhập |

## 7. Quy tắc nghiệp vụ

1. Username unique.
2. User inactive không đăng nhập.
3. Quyền = hợp các permission của role groups.

## 8. Phân quyền

- **Permission key gợi ý:** `staff.users.*`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Tạo user gắn role Ops thấy đúng menu vận hành.
2. Deactivate chặn login.
