# Danh sách phiên kiểm kê

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Kiểm kê |
| Menu | Vận hành → Kiểm kê → Danh sách phiên kiểm kê |
| Route | `/operations/stocktake` |
| Actor chính | Kiểm kê viên, supervisor tồn kho |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý phiên kiểm kê/kiểm đếm: tạo theo SKU-BIN, thường nhật, hoặc kiểm kê tổng.
- Theo dõi tiến độ đếm, chênh lệch; hoàn thành/hủy; in biên bản.

## 3. Phạm vi

### Trong phạm vi
- List + filter
- Modal tạo phiên kiểm kê
- Tạo kiểm đếm thường nhật (3 tab)
- Tạo theo SKU/BIN
- Chi tiết phiên + KQ lần 1/2/3

### Ngoài phạm vi
- Tích hợp ERP/WMS backend thực tế (UI hiện tại có thể dùng mock).
- Ứng dụng mobile native (trừ khi nêu riêng).

## 4. Luồng nghiệp vụ

### 4.1. Tạo phiên kiểm kê

1. Bấm Tạo phiên kiểm kê → chọn Loại, Đối tác (Nội bộ/Đối tác yêu cầu), Ghi chú → Lưu.
2. Hệ thống tạo phiên status=counting → sang chi tiết.

### 4.2. Kiểm đếm thường nhật

1. Chọn tab Theo vị trí / Theo sản phẩm / Tồn kho thay đổi.
2. Nhập loại bin hoặc đối tác (+ thời gian nếu change) → xem thống kê Vị trí/SKU/SP → Tạo.

### 4.3. Hoàn thành phiên

1. Nhập kết quả đếm (KQ lần 1/2/3).
2. Hoàn thành → cập nhật ended/confirmed; In biên bản.

## 5. Màn hình & thao tác UI

### Danh sách phiên

- **Đường dẫn:** `/operations/stocktake`
- **Mô tả:** 3 nút tạo + bảng phiên + Hủy khi đang đếm.

### Tạo thường nhật

- **Đường dẫn:** `/operations/stocktake/create-daily`
- **Mô tả:** Tabs vị trí/SP/tồn đổi + stats.

### Tạo SKU/BIN

- **Đường dẫn:** `/operations/stocktake/create-sku-bin`
- **Mô tả:** Loại bin bắt buộc + ghi chú.

### Chi tiết

- **Đường dẫn:** `/operations/stocktake/:id`
- **Mô tả:** Thông tin phiên + bảng đếm + chứng từ.

## 6. Dữ liệu & trường thông tin

### StocktakeSession

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| requestType | internal | partner | Có |
| kind | full / count_by_* / daily_* / sku_bin | Có |
| partnerName | Bắt buộc nếu partner | Không |
| skuCount / productQty / locationCount | Phạm vi | Có |
| variancePct | % lệch | Không |
| lines[] | location, sku, systemQty, count1..3 | Không |

### Trạng thái

| Mã | Tên hiển thị | Ý nghĩa |
|---|---|---|
| `counting` | Đang kiểm đếm | Đang thực hiện |
| `completed` | Hoàn thành | Đã chốt |
| `cancelled` | Đã hủy | Hủy phiên |

## 7. Quy tắc nghiệp vụ

1. Partner bắt buộc khi requestType=partner.
2. Chỉ Hủy khi counting.
3. Chênh lệch dòng = (count cuối) - systemQty.
4. Thường nhật tab vị trí bắt buộc loại bin; tab SP/change bắt buộc đối tác.

## 8. Phân quyền

- **Permission key gợi ý:** `operations.stocktake.view / create`

## 9. Tích hợp & API (đề xuất cho phát triển)

- GET danh sách (filter, phân trang)
- GET chi tiết theo id
- POST tạo mới
- PUT/PATCH cập nhật / chuyển trạng thái

## 10. Tiêu chí nghiệm thu

1. 3 luồng tạo hoạt động và sinh mã phiên.
2. Chi tiết hiển thị progress vị trí/SP.
3. Hoàn thành/Hủy đổi trạng thái đúng.
