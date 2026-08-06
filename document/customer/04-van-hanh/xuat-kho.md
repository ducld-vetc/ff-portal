# Xuất kho (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm — portal **Khách hàng / Partner**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Vận hành |
| Menu | Vận hành → Xuất kho |
| Route | `/client/operations/outbound` |
| Actor chính | Nhân viên đối tác / Partner ops / CS |
| Mức độ ưu tiên | Cao |

## 2. Mục tiêu nghiệp vụ

- Cho đối tác tạo yêu cầu xuất kho (OR) tới kho 3PL: địa chỉ giao, COD, SP, ưu tiên.
- Theo dõi trạng thái đơn từ sẵn sàng lấy hàng → lấy → đóng gói → bàn giao.
- Hỗ trợ copy đơn, import, in phiếu, lọc nâng cao.

## 3. Phạm vi

### Trong phạm vi
- Danh sách OR + chọn nhiều dòng
- Tạo OR: kho, phương thức giao, gói VC, người mua/địa chỉ (tỉnh-huyện-xã), COD/đã thanh toán, ưu tiên, dòng SP
- Copy OR, xem chi tiết
- Lọc: trạng thái, kho, kênh, người mua, ngày tạo

### Ngoài phạm vi
- Thao tác kho nội bộ (check-in vật lý, picking sàn) — thuộc portal Admin.
- Tích hợp ERP đối tác (có thể bổ sung API sau).

## 4. Luồng nghiệp vụ

### 4.1. Tạo yêu cầu xuất kho

1. Xuất kho → Thêm yêu cầu.
2. Nhập kho xuất, phương thức giao (giao/nhận tại kho), gói vận chuyển, ưu tiên.
3. Nhập thông tin người mua & địa chỉ (cascade tỉnh → huyện → xã).
4. Thêm SP từ catalog; kiểm tra tồn khả dụng; chọn tình trạng HH; nhập SL/đơn giá.
5. Nhập COD / đã thanh toán / giá trị khai báo / ghi chú đóng gói (nếu có).
6. Lưu → sinh mã OR, status sẵn sàng lấy hàng → kho xử lý pick/pack/ship.

### 4.2. Theo dõi đơn

1. List lọc theo trạng thái/kênh.
2. Mở chi tiết xem tiến độ & thông tin VC/tracking khi kho cập nhật.

## 5. Màn hình & thao tác UI

### Danh sách OR

- **Đường dẫn:** `/client/operations/outbound`
- **Mô tả:** Bảng OR: ngày tạo, trạng thái, mã OR/ORĐT, người mua, SL…
- **Thao tác chính:**
  - Thêm
  - Copy
  - Import
  - Xuất
  - In
  - Lọc
  - Xem chi tiết

### Tạo OR

- **Đường dẫn:** `/client/operations/outbound/create`
- **Mô tả:** Form thông tin xuất + SP + sidebar ưu tiên/COD/gói VC.
- **Thao tác chính:**
  - Thêm SP
  - Lưu
  - Hủy

### Chi tiết OR

- **Đường dẫn:** `/client/operations/outbound/:id`
- **Mô tả:** Xem thông tin đơn, dòng hàng, trạng thái xử lý.

## 6. Dữ liệu & trường thông tin

### OutboundRequest (Customer view)

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code / partnerOrCode | Mã OR hệ thống / đối tác | Có |
| warehouseCode | Kho xuất | Có |
| deliveryMethod | delivery | pickup | Có |
| shippingPackage / priority | Gói VC & ưu tiên | Không |
| buyerName / buyerPhone / address* | Người nhận & địa chỉ | Có |
| cod / paidAmount / declaredValue | Tiền hàng | Không |
| lines[] | sku, qty, availableQty, condition, unitPrice | Có |
| trackingCode / carrierCode | Do kho/ĐVVC cập nhật | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `new` | Sẵn sàng lấy hàng | Chờ kho pick |
| `picking` | Đang lấy hàng | Đang pick |
| `packed` | Đã đóng gói | Đã pack |
| `shipped` | Đã bàn giao | Đã handover ĐVVC |
| `cancelled` | Đã hủy | Hủy |

## 7. Quy tắc nghiệp vụ

1. Scoped theo customer.
2. qty không vượt availableQty (cảnh báo/block).
3. Địa chỉ giao bắt buộc khi deliveryMethod = delivery.
4. COD và paidAmount ảnh hưởng tính toán còn phải thu.
5. Partner không tự đổi trạng thái sang packed/shipped — do kho/hệ thống.

## 8. Phân quyền & phạm vi dữ liệu

- **Permission key gợi ý:** `client.operations.outbound.*`
- Chỉ xem/tạo/sửa dữ liệu thuộc customer đang đăng nhập.
- Không truy cập được yêu cầu của đối tác khác.

## 9. Tích hợp & API (đề xuất)

- GET danh sách (filter, phân trang, scoped)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / đổi trạng thái (theo quyền)

## 10. Tiêu chí nghiệm thu

1. Tạo OR hiện trên list status sẵn sàng lấy hàng.
2. Cascade địa chỉ tỉnh/huyện/xã đúng.
3. Copy OR prefill được.
4. Không thấy OR customer khác.

## 11. Liên quan

- Admin: [Yêu cầu xuất kho](../../admin/04-van-hanh/02-xuat-kho/yeu-cau-xuat-kho.md)
- Customer: [Xuất kho lỗi](./xuat-kho-loi.md), [Vận đơn](./van-don.md)
