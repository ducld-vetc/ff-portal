# Vận hành (Customer / Partner)

Menu **Vận hành** trên portal Khách hàng cho phép đối tác tự tạo và theo dõi yêu cầu gửi vào kho 3PL, không thay thế thao tác sàn của Admin.

## Danh mục chức năng

| Menu | Tài liệu | Route |
|---|---|---|
| Nhập kho | [nhap-kho.md](./nhap-kho.md) | `/client/operations/inbound` |
| Xuất kho | [xuat-kho.md](./xuat-kho.md) | `/client/operations/outbound` |
| Vận đơn | [van-don.md](./van-don.md) | `/client/operations/waybills` |
| Kiểm kê | [kiem-ke.md](./kiem-ke.md) | `/client/operations/stocktake` |
| Xuất kho lỗi | [xuat-kho-loi.md](./xuat-kho-loi.md) | `/client/operations/error-outbound` |

## Vai trò trong chuỗi fulfillment

```
Partner tạo IR/OR/Waybill  →  Kho (Admin) tiếp nhận / pick / pack / handover  →  Partner theo dõi trạng thái & xử lý đơn lỗi
```

1. **Nhập kho**: Partner tạo yêu cầu nhập (IR), khai báo SP/serial; kho check-in & hoàn thành.
2. **Xuất kho**: Partner tạo OR (địa chỉ, COD, SP); kho lấy hàng/đóng gói/bàn giao.
3. **Vận đơn**: Partner quản lý vận đơn giao nhận (có thể tách khỏi OR kho hoặc liên kết).
4. **Kiểm kê**: Partner gửi yêu cầu kiểm kê tồn theo kho được gán.
5. **Xuất kho lỗi**: Theo dõi OR lỗi (sai địa chỉ, thiếu serial…) để xử lý/hủy/tạo lại.

## Phân biệt với Admin

| Khía cạnh | Customer | Admin |
|---|---|---|
| Mục tiêu | Tạo & theo dõi yêu cầu của mình | Thực thi vận hành kho |
| Scope dữ liệu | Chỉ customer đăng nhập | Đa đối tác / toàn kho |
| Thao tác sàn | Không (hoặc hạn chế) | Check-in, pick, pack, handover |
