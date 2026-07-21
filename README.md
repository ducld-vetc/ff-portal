# FulfillOne Control Center (Local)

Giao diện admin fulfillment dựng lại local, bám theo [ffm-admin.evercharge.vn](https://ffm-admin.evercharge.vn/staff).

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Đăng nhập

- **Tài khoản:** `admin`
- **Mật khẩu:** `ops123456`

## Modules

1. Tổng quan
2. Onboarding khách hàng mới
3. Khách hàng
4. Kho
5. Nhân sự & truy cập
   - Quản lý nhóm quyền (mặc định có `SUPER_ADMIN` full quyền; tạo/cấu hình nhóm khác theo màn hình)
   - Quản lý nhân sự (tạo user + gán nhóm quyền)
6. Phân công lấy hàng
7. Product & SKU
8. Đơn vị vận chuyển
9. Báo cáo
10. Hệ thống (Audit log / Trạng thái dịch vụ)

Dữ liệu hiện là mock trong `src/data/mock.ts` + nhóm quyền lưu localStorage — chưa nối API thật.
