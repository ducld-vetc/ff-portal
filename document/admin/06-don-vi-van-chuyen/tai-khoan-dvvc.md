# Tài khoản đơn vị vận chuyển

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Đơn vị vận chuyển |
| Menu | Đơn vị vận chuyển → Tài khoản đơn vị vận chuyển |
| Route | `/carriers/accounts` |
| Actor chính | Admin VC, onboarding khách |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý tài khoản kết nối API/đối tác với từng ĐVVC theo khách hàng/kho.
- Lưu credentials động theo từng carrier.

## 3. Phạm vi

### Trong phạm vi
- List/filter
- Modal tạo/sửa với field động theo carrier
- Trạng thái kết nối

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo tài khoản

1. Chọn loại (customer / customer_warehouse), ĐVVC, partner, kho (nếu có).
2. Nhập credentials theo form carrier → Lưu.
3. Theo dõi connection connected/disconnected.

## 5. Màn hình & thao tác UI

### Carrier accounts

- **Đường dẫn:** `/carriers/accounts`
- **Mô tả:** List + CarrierAccountFormModal.

## 6. Dữ liệu & trường thông tin

### CarrierAccount

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| type | customer | customer_warehouse | Có |
| carrierCode / partnerCode | ĐVVC & đối tác | Có |
| warehouseCode | Nếu theo kho | Không |
| credentials | Key-value động | Không |
| connection | connected|disconnected | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `active` | Active | Đang dùng |
| `inactive` | Inactive | Ngưng |
| `connected` | Đã kết nối | Connection OK |

## 7. Quy tắc nghiệp vụ

1. Field credentials phụ thuộc carrierCode.
2. Account gắn gói vận chuyển qua accountIds.

## 8. Phân quyền

- **Permission key gợi ý:** `carriers.accounts.*`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Đổi carrier đổi form credentials.
2. Lưu account hiện trên list.
