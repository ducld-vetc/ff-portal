# Tổng hợp hàng hư hỏng / chuyển đổi

| | |
|--|--|
| **Route** | `/client/summaries/goods-damage` |
| **Menu** | Tổng hợp → Hàng hư hỏng / chuyển đổi |
| **Actor** | Partner / khách hàng |

## Mục đích

Cho đối tác theo dõi **lượng hàng hóa bị ghi nhận hư hỏng** hoặc **chuyển đổi tình trạng** (mới ↔ đã qua sử dụng ↔ hư hỏng) tại kho 3PL.

## Loại sự kiện

| Loại | Ý nghĩa |
|------|---------|
| **Hư hỏng** | Hàng chuyển sang tình trạng hư hỏng (vỡ, rò, đứt…) |
| **Chuyển đổi** | Đổi tình trạng / phân loại lại (VD mới → đã dùng, hư → đã dùng thanh lý) |

## Chức năng

- Lọc theo khoảng ngày, kho, loại sự kiện
- Tìm SKU / tên SP / lý do / chứng từ
- Thẻ thống kê: số dòng, SL hư hỏng, SL chuyển đổi, tổng SL
- Xuất Excel (demo)

## Cột chính

Ngày · Loại · Kho · Sản phẩm · Tình trạng (từ → đến) · SL · Lý do · Chứng từ / vị trí

## Ghi chú

Dữ liệu demo gắn `customerId` của scope cổng Khách hàng.
