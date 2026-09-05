# Nhập kho (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm — portal **Khách hàng / Partner**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Vận hành |
| Menu | Vận hành → Nhập kho |
| Route | `/client/operations/inbound` |
| Actor chính | Nhân viên đối tác / Partner ops |
| Mức độ ưu tiên | Cao |

## 2. Mục tiêu nghiệp vụ

- Cho đối tác tạo yêu cầu nhập kho (IR) gửi vào kho 3PL.
- Theo dõi trạng thái phiếu: mới → đang xử lý → hoàn thành / hủy.
- Hỗ trợ copy phiếu, import/export, lọc nâng cao theo nhu cầu đối tác.

## 3. Phạm vi

### Trong phạm vi
- Danh sách IR (scoped)
- Tạo IR: kho, loại, tình trạng HH, NCC, ngày dự kiến, dòng SP (+ serial)
- Copy từ IR có sẵn (`?copyFrom=`)
- Xem chi tiết IR
- Lọc nâng cao: trạng thái, kho, NCC, loại, khoảng ngày
- Import / Xuất Excel / Xác nhận hàng loạt (theo UI)
- **Import CSV** theo mẫu `mau-yeu-cau-nhap-kho.csv` (chung với Admin)

### Ngoài phạm vi
- Thao tác kho nội bộ (check-in vật lý, picking sàn) — thuộc portal Admin.
- Tích hợp ERP đối tác (có thể bổ sung API sau).

## 4. Luồng nghiệp vụ

### 4.1. Tạo yêu cầu nhập kho

1. Vào Nhập kho → Thêm yêu cầu.
2. Nhập thông tin phiếu: kho nhập, loại (nhập/trả/điều chuyển), tình trạng hàng hóa, NCC, ngày dự kiến, mã IR đối tác, ghi chú.
3. Thêm sản phẩm từ catalog (SKU / SKU đối tác / tên); nhập SL, đơn giá; khai serial nếu SP serial.
4. Lưu → hệ thống sinh mã IR, status=Mới.
5. Kho (Admin) tiếp nhận/check-in/hoàn thành; Partner theo dõi trên list/detail.

### 4.2. Copy yêu cầu

1. Trên list chọn Copy → mở form tạo với dữ liệu IR nguồn.
2. Chỉnh sửa nếu cần → Lưu thành IR mới.

### 4.3. Theo dõi & lọc

1. Tìm theo trường (mã IR đối tác…).
2. Mở bộ lọc nâng cao → trạng thái/kho/NCC/loại/ngày dự kiến.
3. Click mã IR → xem chi tiết tiến độ nhận/lưu kho.

## 5. Màn hình & thao tác UI

### Danh sách IR

- **Đường dẫn:** `/client/operations/inbound`
- **Mô tả:** Bảng IR với toolbar tìm kiếm, lọc, thêm, import/export, xác nhận.
- **Thao tác chính:**
  - Thêm
  - Copy
  - Lọc
  - Import
  - Xuất Excel
  - Xem chi tiết

### Tạo IR

- **Đường dẫn:** `/client/operations/inbound/create`
- **Mô tả:** Form 2 cột: thông tin phiếu + dòng SP; sidebar phụ trách/loại/ghi chú.
- **Thao tác chính:**
  - Thêm SP
  - Khai serial
  - Lưu
  - Hủy

### Chi tiết IR

- **Đường dẫn:** `/client/operations/inbound/:id`
- **Mô tả:** Xem thông tin phiếu & dòng hàng, trạng thái xử lý phía kho.

## 6. Dữ liệu & trường thông tin

### InboundRequest (Customer view)

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code | Mã IR hệ thống | Có |
| partnerIrCode | Mã IR phía đối tác | Không |
| warehouseCode | Kho nhập | Có |
| type | inbound | return | transfer | Có |
| goodsCondition | new | used | damaged | Có |
| supplier / expectedAt / note | NCC, ngày dự kiến, ghi chú | Không |
| lines[] | productId, sku, partnerSku, qty, unitPrice, serials[] | Có |
| receivedQty / storedQty | Do kho cập nhật | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `new` | Mới | Partner đã tạo, chờ kho xử lý |
| `processing` | Đang xử lý | Kho đã check-in |
| `received` | Đã hoàn thành | Kho đã nhận & lưu |
| `cancelled` | Đã hủy | Hủy phiếu |

## 7. Quy tắc nghiệp vụ

1. Dữ liệu chỉ thuộc customer đăng nhập (scoped).
2. Phải có ≥ 1 dòng sản phẩm trước khi lưu.
3. Không trùng productId trong cùng phiếu.
4. Serial (nếu có) số lượng khớp qty dòng.
5. Partner không thực hiện check-in/hoàn thành sàn (Admin).
6. Sau khi kho hoàn thành, Partner chủ yếu xem; chỉnh sửa bị khóa theo status.

## 8. Phân quyền & phạm vi dữ liệu

- **Permission key gợi ý:** `client.operations.inbound.*`
- Chỉ xem/tạo/sửa dữ liệu thuộc customer đang đăng nhập.
- Không truy cập được yêu cầu của đối tác khác.

## 9. Tích hợp & API (đề xuất)

- GET danh sách (filter, phân trang, scoped)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / đổi trạng thái (theo quyền)

## 10. Tiêu chí nghiệm thu

1. Tạo IR thành công, xuất hiện trên list với status Mới.
2. Copy IR prefill đúng dòng SP.
3. Lọc trạng thái/kho hoạt động đúng.
4. Không thấy IR của customer khác.

## 11. Liên quan

- Admin: [Yêu cầu nhập kho](../../admin/04-van-hanh/01-nhap-kho/yeu-cau-nhap-kho.md) — phía kho thực thi.
