# Tài liệu nghiệp vụ — tính năng nhãn **Mới**

Tài liệu mô tả nghiệp vụ (BRD) cho các chức năng đang gắn badge **Mới** trên menu, phục vụ thiết kế & phát triển phần mềm.

## Cấu trúc thư mục

Cấu trúc bám theo menu 2 portal:

| Thư mục | Portal | Mô tả |
|---|---|---|
| [`admin/`](./admin/) | Admin / nội bộ kho | Vận hành kho, thiết lập, nhân sự, sản phẩm, ĐVVC |
| [`customer/`](./customer/) | Khách hàng / Partner | Bảng điều khiển, cửa hàng, sản phẩm |
| [`pda/`](./pda/) | PDA / RF Mobile WMS | Execution layer trên sàn kho (Phase 1 MVP) |

## Quy ước tài liệu

Mỗi file chức năng gồm:

1. Thông tin chung (menu, route, actor)
2. Mục tiêu nghiệp vụ
3. Phạm vi
4. Luồng nghiệp vụ
5. Màn hình & thao tác UI
6. Dữ liệu & trường thông tin / trạng thái
7. Quy tắc nghiệp vụ
8. Phân quyền
9. Tích hợp & API đề xuất
10. Tiêu chí nghiệm thu

## Danh mục nhanh

Xem index chi tiết:

- [Admin](./admin/README.md)
- [Customer](./customer/README.md) — gồm cả nhóm **Vận hành** (Nhập/Xuất/Vận đơn/Kiểm kê/Xuất kho lỗi)
- [PDA](./pda/README.md) — ứng dụng thiết bị cầm tay (WMS execution)

> **Lưu ý triển khai hiện tại:** nhiều màn vận hành đang dùng dữ liệu mock/in-memory trong `src/data/*`. Tài liệu dưới đây mô tả nghiệp vụ đích để phát triển backend/API đầy đủ.
