# Tổng hợp vật tư tiêu hao

| | |
|--|--|
| **Route** | `/client/summaries/materials` |
| **Menu** | Tổng hợp → Vật tư tiêu hao |
| **Actor** | Partner / khách hàng |

## Mục đích

Cho đối tác xem **lượng vật tư đóng gói đã tiêu hao** trong kỳ (carton, túi, filler, nhãn…) theo kho và chứng từ liên quan (xuất kho / đóng gói / kiểm kê).

## Chức năng

- Lọc theo khoảng ngày, kho, loại vật tư
- Tìm theo mã/tên vật tư, mã chứng từ
- Thẻ thống kê: số dòng, tổng SL tiêu hao, số loại vật tư
- Xuất Excel (demo)

## Cột chính

Ngày · Kho · Vật tư (tên/mã) · Loại · SL tiêu hao · Chứng từ · Ghi chú

## Ghi chú

Dữ liệu demo gắn `customerId` của scope cổng Khách hàng.
