# Vận hành (Admin) — nhóm chức năng **Mới**

Nhóm menu **Vận hành** trên Admin cũng gắn badge **Mới**. Tài liệu con được chia theo submenu giống UI:

| Submenu | Thư mục | Chức năng |
|---|---|---|
| Nhập kho | [`01-nhap-kho/`](./01-nhap-kho/) | Yêu cầu nhập kho |
| Xuất kho | [`02-xuat-kho/`](./02-xuat-kho/) | Yêu cầu xuất kho, Lấy hàng, Lấy hàng B2B, Đóng gói, Đóng gói theo nhãn |
| Tồn kho | [`03-ton-kho/`](./03-ton-kho/) | Điều chỉnh tồn |
| Vận chuyển | [`04-van-chuyen/`](./04-van-chuyen/) | Bàn giao ĐVVC, Cập nhật đơn xuất |
| Tiện ích | [`05-tien-ich/`](./05-tien-ich/) | Vấn đề phát sinh, In nhãn, Thiết bị chứa hàng |
| Kiểm kê | [`06-kiem-ke/`](./06-kiem-ke/) | Danh sách phiên kiểm kê |

## Luồng nghiệp vụ tổng quát (happy path xuất)

1. Có **Yêu cầu xuất kho** (OR) sẵn sàng lấy hàng  
2. Tạo / phân công **Lấy hàng** (hoặc B2B)  
3. **Đóng gói** (theo thiết bị hoặc theo nhãn)  
4. **Bàn giao nhà vận chuyển** (phiên giao)  
5. Theo dõi **Cập nhật đơn xuất** / sự cố tại **Vấn đề phát sinh**

Nhập kho và kiểm kê / điều chỉnh tồn là các nhánh song song hỗ trợ độ chính xác tồn.
