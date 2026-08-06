# Quản lý nhóm quyền

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Nhân sự & truy cập |
| Menu | Nhân sự & truy cập → Quản lý nhóm quyền |
| Route | `/staff/roles` |
| Actor chính | Super Admin, Admin hệ thống |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Định nghĩa nhóm quyền (role group) gắn tập permission keys.
- Kiểm soát truy cập module theo ma trận quyền.

## 3. Phạm vi

### Trong phạm vi
- Danh sách nhóm quyền
- Tạo/sửa form với cây permission
- Nhóm hệ thống (SUPER_ADMIN)

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (hiện tại UI demo/mock).
- Mobile app native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo nhóm quyền

1. Vào /staff/roles/new.
2. Nhập code, name, mô tả.
3. Tick permission trên cây quyền.
4. Lưu; không cho trùng SUPER_ADMIN.

### 4.2. Sửa / xóa

1. Mở nhóm → cập nhật permission.
2. Không xóa được nhóm isSystem.

## 5. Màn hình & thao tác UI

### Danh sách

- **Đường dẫn:** `/staff/roles`
- **Mô tả:** Bảng nhóm quyền + tag Hệ thống.

### Form tạo/sửa

- **Đường dẫn:** `/staff/roles/:id`
- **Mô tả:** Cây permission theo module.

## 6. Dữ liệu & trường thông tin

### RoleGroup

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code | Mã nhóm | Có |
| name | Tên | Có |
| permissionKeys | string[] | Có |
| isSystem | Nhóm hệ thống | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `system` | Hệ thống | Không xóa; SUPER_ADMIN full quyền |

## 7. Quy tắc nghiệp vụ

1. SUPER_ADMIN luôn full permission.
2. Nhóm hệ thống không xóa.
3. Nhóm custom phải có ≥ 1 permission.
4. Code unique.

## 8. Phân quyền

- **Permission key gợi ý:** `staff.roles.*`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Không tạo trùng SUPER_ADMIN.
2. Không xóa nhóm hệ thống.
3. User gắn nhóm nhận đúng quyền menu.
