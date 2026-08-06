# Yêu cầu nhập kho

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Nhập kho |
| Menu | Vận hành → Nhập kho → Yêu cầu nhập kho |
| Route | `/operations/inbound` |
| Actor chính | Nhân viên nhận hàng, supervisor nhập kho, ops |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý phiếu yêu cầu nhập kho (IR) từ lúc tạo đến tiếp nhận & hoàn thành.
- Hỗ trợ nhập thường, trả hàng, điều chuyển; check-in và ghi nhận số lượng thực nhận/lưu kho.
- In/xuất chứng từ liên quan phiếu nhập.

## 3. Phạm vi

### Trong phạm vi
- Danh sách IR + bộ lọc nâng cao
- Chi tiết IR: check-in, hoàn thành, in/xuất
- Tạo phiếu nhập trả hàng từ OR xuất

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tiếp nhận & hoàn thành IR

1. Mở danh sách → tìm IR theo mã/đối tác/kho/ngày.
2. Vào chi tiết → Check-in (chuyển processing, cập nhật receivedQty).
3. Nhập/kiểm serial nếu có → Hoàn thành (received + stored).
4. In/xuất chứng từ khi cần.

### 4.2. Tạo trả hàng

1. Vào /operations/inbound/return → tìm OR xuất theo mã.
2. Xác nhận thông tin → Tạo IR type=return liên kết reference OR.

## 5. Màn hình & thao tác UI

### Danh sách IR

- **Đường dẫn:** `/operations/inbound`
- **Mô tả:** Bảng IR với search field, date range, drawer lọc trạng thái/kho/loại.
- **Thao tác chính:**
  - Tìm
  - Bộ lọc
  - Mở chi tiết
  - Tạo trả hàng

### Chi tiết IR

- **Đường dẫn:** `/operations/inbound/:id`
- **Mô tả:** Thông tin phiếu, dòng sản phẩm, thao tác check-in/hoàn thành.
- **Thao tác chính:**
  - Check-in
  - Hoàn thành
  - In
  - Xuất

### Tạo nhập trả hàng

- **Đường dẫn:** `/operations/inbound/return`
- **Mô tả:** Tra cứu OR và tạo IR return.

## 6. Dữ liệu & trường thông tin

### InboundRequest

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code | Mã IR | Có |
| partnerIrCode | Mã IR đối tác | Không |
| type | inbound | return | transfer | Có |
| goodsCondition | new | used | damaged | Có |
| warehouseCode | Kho nhập | Có |
| skuCount / productQty / receivedQty / storedQty | Số liệu tổng hợp | Có |
| lines[] | SKU, partnerSku, qty, unitPrice, serials | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `new` | Mới | Chưa tiếp nhận |
| `processing` | Đang xử lý | Đã check-in |
| `received` | Đã hoàn thành | Đã nhận & lưu kho |
| `cancelled` | Đã hủy | Không còn thao tác |

## 7. Quy tắc nghiệp vụ

1. Không chỉnh sửa nghiệp vụ khi status = received hoặc cancelled.
2. Check-in chỉ hợp lệ từ new → processing.
3. Hoàn thành cập nhật receivedQty/storedQty theo thực tế.
4. IR return phải tham chiếu OR xuất hợp lệ.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.inbound.view / create / update`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. Lọc danh sách đúng trạng thái/kho/loại.
2. Check-in và hoàn thành đổi trạng thái đúng.
3. Tạo trả hàng tạo IR type=return liên kết OR.
