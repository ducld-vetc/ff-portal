# Bàn giao nhà vận chuyển

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Vận chuyển |
| Menu | Vận hành → Vận chuyển → Bàn giao nhà vận chuyển |
| Route | `/operations/carrier-handover` |
| Actor chính | Nhân viên bàn giao, supervisor VC |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Tạo phiên nhận (hàng trả từ ĐVVC) và phiên giao (bàn giao kiện cho ĐVVC).
- Quét kiện/vận đơn/OR để gom phiên; bàn giao và in/xuất biên bản.

## 3. Phạm vi

### Trong phạm vi
- List phiên + filter
- Tạo phiên nhận / phiên giao
- Chi tiết: bàn giao, cập nhật, in, Excel

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo phiên giao

1. Tạo phiên giao → chọn ĐVVC → quét kiện/OR/vận đơn → Import (optional).
2. Xem bảng kiện + tổng hợp theo OR → Tạo.
3. Vào chi tiết → Bàn giao khi sẵn sàng.

### 4.2. Tạo phiên nhận

1. Tương tự phiên giao kèm Loại trả hàng & Tình trạng kiện.

## 5. Màn hình & thao tác UI

### Danh sách

- **Đường dẫn:** `/operations/carrier-handover`
- **Mô tả:** Filter ngày/ĐVVC/loại phiên/trạng thái; nút tạo nhận/giao.

### Tạo nhận/giao

- **Đường dẫn:** `/operations/carrier-handover/receipt|delivery`
- **Mô tả:** Scan + bảng kiện + summary OR + sidebar ĐVVC.

### Chi tiết

- **Đường dẫn:** `/operations/carrier-handover/:id`
- **Mô tả:** Tab phiên bàn giao; actions Bàn giao/Cập nhật/In/Excel.

## 6. Dữ liệu & trường thông tin

### CarrierHandoverSession

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| sessionType | receipt | delivery | Có |
| carrierCode/Name | ĐVVC | Có |
| packages[] | outboundCode, tracking, packageCode, productQty, returnType?, condition? | Có |
| packageCount / outboundCount | Tổng hợp | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `new` | Mới | Mới tạo |
| `processing` | Đang xử lý | Đang xử lý |
| `handed_over` | Đã bàn giao | Hoàn tất bàn giao |
| `cancelled` | Đã hủy | Hủy phiên |

## 7. Quy tắc nghiệp vụ

1. ĐVVC bắt buộc trước khi tạo.
2. Không thêm trùng packageCode trong phiên.
3. Phiên nhận bắt buộc chọn loại trả/tình trạng mặc định khi quét.
4. Bàn giao chỉ khi new/processing.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.shipping.handover`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Tạo được cả 2 loại phiên.
2. Scan thêm kiện vào bảng.
3. Bàn giao đổi status handed_over.
