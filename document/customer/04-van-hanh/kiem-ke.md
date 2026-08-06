# Kiểm kê (Customer)

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm — portal **Khách hàng / Partner**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Customer / Vận hành |
| Menu | Vận hành → Kiểm kê |
| Route | `/client/operations/stocktake` |
| Actor chính | Partner inventory / kế toán tồn |
| Mức độ ưu tiên | Cao |

## 2. Mục tiêu nghiệp vụ

- Cho đối tác tạo/theo dõi yêu cầu kiểm kê tồn tại các kho được gán.
- Xem kết quả chênh lệch sau khi kho hoàn tất phiên kiểm kê.

## 3. Phạm vi

### Trong phạm vi
- Danh sách yêu cầu/phiên kiểm kê của partner
- Tạo yêu cầu kiểm kê (UI)
- Xem trạng thái & variance
- Xuất Excel

### Ngoài phạm vi
- Thực hiện đếm trên sàn (KQ lần 1/2/3) — thuộc Admin kiểm kê.
- Tạo phiên kiểm đếm thường nhật chi tiết như Admin (có thể mở rộng sau).

## 4. Luồng nghiệp vụ

### 4.1. Yêu cầu kiểm kê

1. Vào Kiểm kê → Tạo kiểm kê.
2. Chọn kho được gán, phạm vi (toàn bộ/theo SP — tùy form).
3. Gửi yêu cầu → kho tạo phiên & thực hiện.
4. Partner theo dõi status & chênh lệch khi hoàn tất.

## 5. Màn hình & thao tác UI

### Danh sách kiểm kê

- **Đường dẫn:** `/client/operations/stocktake`
- **Mô tả:** Bảng mã KK, kho, trạng thái, chênh lệch, ngày tạo.
- **Thao tác chính:**
  - Tạo kiểm kê
  - Tìm
  - Xuất Excel

## 6. Dữ liệu & trường thông tin

### CustomerStocktakeRequest

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| code | Mã kiểm kê | Có |
| warehouse | Kho được gán | Có |
| status | Trạng thái phiên/yêu cầu | Có |
| variance | Chênh lệch tổng (sau hoàn tất) | Không |
| createdAt | Ngày tạo | Có |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `pending` | Chờ xử lý | Mới gửi (đích) |
| `counting` | Đang kiểm đếm | Kho đang đếm |
| `done` | Hoàn tất | Đã có kết quả |
| `cancelled` | Đã hủy | Hủy |

## 7. Quy tắc nghiệp vụ

1. Chỉ chọn kho trong danh sách kho được phân quyền cho partner.
2. Partner không sửa KQ đếm; chỉ xem kết quả sau khi kho hoàn thành.
3. Variance hiển thị sau status hoàn tất.

## 8. Phân quyền & phạm vi dữ liệu

- **Permission key gợi ý:** `client.operations.stocktake.*`
- Chỉ xem/tạo/sửa dữ liệu thuộc customer đang đăng nhập.
- Không truy cập được yêu cầu của đối tác khác.

## 9. Tích hợp & API (đề xuất)

- GET danh sách (filter, phân trang, scoped)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / đổi trạng thái (theo quyền)

## 10. Tiêu chí nghiệm thu

1. Tạo yêu cầu gắn đúng kho được gán.
2. List chỉ hiện KK của customer.
3. Khi kho hoàn tất, partner thấy variance.

## 11. Liên quan

- Admin: [Danh sách phiên kiểm kê](../../admin/04-van-hanh/06-kiem-ke/danh-sach-phien-kiem-ke.md)
