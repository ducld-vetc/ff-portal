# Phạm vi Phase 1 — PDA Fulfillment MVP

> Quyết định phạm vi triển khai PDA giai đoạn 1, bám chuẩn WMS/fulfillment quốc tế và map với portal Admin hiện có.

## 1. Quyết định phạm vi

| Hạng mục | Phase 1 (MVP) | Phase 2 | Phase 3 |
|---|---|---|---|
| **Loại hình** | **B2C fulfillment** (đơn lẻ, e-commerce) | B2B, Returns, Cancelled putaway | Replenishment, internal transfer, dock load |
| **Nhập kho** | Check-in IR, Receiving, Putaway | Return receiving (DSP), điều chỉnh trong phiên nhận | Cross-dock |
| **Xuất kho** | Pick list, Directed pick, Tote assign, Complete | Sort (PTS), Skip/Re-pick, B2B pick | Voice pick |
| **Đóng gói** | Tote packing, Package ID, Print label | Label-based pack, partial/quick pack, cancel handling | Video capture |
| **Vận chuyển** | Bàn giao 3PL: phiên giao + phiên nhận (scan kiện/OR) | Dock load verification | Advanced carrier API |
| **Tồn kho** | Item/Location inquiry (read-only) | Cycle count, daily count, issue reporting | Adjustment, transfer |
| **Foundation** | Login, chọn kho, menu theo role | Offline queue, đa ngôn ngữ EN | Advanced offline-first |

### Lý do chọn B2C-only cho Phase 1

1. **80% volume** sàn TMĐT là B2C — pick/pack/handover đơn lẻ.
2. Portal Admin đã có module B2C end-to-end (IR, pick list, packing, handover).
3. B2B pick và return receiving có quy trình scan khác (pallet, kiện trả) — tách Phase 2 giảm rủi ro MVP.
4. HDSD kho xác nhận luồng PDA cốt lõi: Nhận → Lưu kho → Lấy hàng → Đóng gói → Bàn giao.

## 2. Module Phase 1 (12 chức năng thực thi)

| # | Module | Mã BRD | Actor |
|---|---|---|---|
| 1 | Đăng nhập & menu PDA | [01-foundation/dang-nhap-va-menu.md](./01-foundation/dang-nhap-va-menu.md) | All |
| 2 | Check-in IR | [02-inbound/check-in-ir.md](./02-inbound/check-in-ir.md) | Receiver |
| 3 | Nhận hàng (Receiving) | [02-inbound/nhan-hang.md](./02-inbound/nhan-hang.md) | Receiver |
| 4 | Hoàn tất IR | (trong nhan-hang.md) | Receiver/Supervisor |
| 5 | Lưu kho (Putaway) | [02-inbound/luu-kho-putaway.md](./02-inbound/luu-kho-putaway.md) | Putaway operator |
| 6 | Danh sách & phiên lấy hàng | [03-outbound/lay-hang.md](./03-outbound/lay-hang.md) | Picker |
| 7 | Directed pick + Tote | (trong lay-hang.md) | Picker |
| 8 | Đóng gói theo tote | [03-outbound/dong-goi.md](./03-outbound/dong-goi.md) | Packer |
| 9 | Tạo kiện + In nhãn VC | (trong dong-goi.md) | Packer |
| 10 | Bàn giao ĐVVC | [04-shipping/ban-giao-dvvc.md](./04-shipping/ban-giao-dvvc.md) | Handover clerk |
| 11 | Tra cứu vị trí SP | [05-inventory/tra-cuu-vi-tri.md](./05-inventory/tra-cuu-vi-tri.md) | Any operator |
| 12 | API layer `/api/pda/*` | [api-design.md](./api-design.md) | Backend |

## 3. Ngoài phạm vi Phase 1

- Ứng dụng native iOS/Android (PDA có thể là web responsive trên thiết bị scan).
- Offline-first đầy đủ (chỉ thiết kế hook API, chưa bắt buộc queue).
- B2B pallet pick, PTS sort station, return receiving, cancelled putaway.
- Điều chỉnh tồn, kiểm kê, báo vấn đề phát sinh trên PDA.
- Tích hợp ERP đối tác.

## 4. Tiêu chí nghiệm thu Phase 1

1. Luồng end-to-end: **IR check-in → receive → putaway → pick → pack → handover** chạy được trên PDA.
2. Mọi bước scan có validation (mã không hợp lệ, SL vượt, trạng thái sai).
3. Portal Admin phản ánh đúng trạng thái sau thao tác PDA (IR, pick list, package, handover).
4. Menu PDA hiển thị theo role (Receiver / Picker / Packer / Handover).
5. API contract documented và có mock layer trong `src/data/pdaApi.ts`.

## 5. Liên quan

- [Tổng quan PDA](./README.md)
- [Admin — Yêu cầu nhập kho](../admin/04-van-hanh/01-nhap-kho/yeu-cau-nhap-kho.md)
- [Admin — Lấy hàng](../admin/04-van-hanh/02-xuat-kho/lay-hang.md)
- [Admin — Đóng gói](../admin/04-van-hanh/02-xuat-kho/dong-goi.md)
- [Admin — Bàn giao NVC](../admin/04-van-hanh/04-van-chuyen/ban-giao-nha-van-chuyen.md)
