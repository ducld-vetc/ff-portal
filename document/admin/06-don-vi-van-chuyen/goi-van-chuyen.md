# Gói vận chuyển

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Đơn vị vận chuyển |
| Menu | Đơn vị vận chuyển → Gói vận chuyển |
| Route | `/carriers/packages` |
| Actor chính | Admin VC, pricing |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Định nghĩa gói dịch vụ VC: tuyến, SLA, bậc cân, gắn tài khoản ĐVVC.

## 3. Phạm vi

### Trong phạm vi
- CRUD shipping package
- Weight tiers
- Link accountIds

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo gói

1. Nhập route/service/destination/SLA.
2. Cấu hình weightTiers (from-to gram, fee).
3. Chọn accountIds → active.

## 5. Màn hình & thao tác UI

### Shipping packages

- **Đường dẫn:** `/carriers/packages`
- **Mô tả:** List + form tiers.

## 6. Dữ liệu & trường thông tin

### ShippingPackage

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| route / serviceCode / serviceName | Tuyến & dịch vụ | Có |
| slaFastHours / slaSlowHours | SLA | Có |
| weightTiers[] | Bậc cân & phí | Có |
| accountIds[] | Tài khoản áp dụng | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `active` | Active | Đang bán |
| `inactive` | Inactive | Ngưng |

## 7. Quy tắc nghiệp vụ

1. Tier không chồng lấn khoảng gram.
2. Gói dùng khi tạo OR chọn shippingPackage.

## 8. Phân quyền

- **Permission key gợi ý:** `carriers.packages.*`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Tạo gói có tier hiển thị đúng.
2. Gắn account thành công.
