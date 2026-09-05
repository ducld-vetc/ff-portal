# PDA — Tài liệu nghiệp vụ & kỹ thuật

Tài liệu cho **ứng dụng PDA (RF/Mobile WMS)** — execution layer trên sàn kho. Portal Admin giữ planning/control layer.

## Cấu trúc

| Thư mục / file | Nội dung |
|---|---|
| [pham-vi-phase1.md](./pham-vi-phase1.md) | Quyết định phạm vi MVP (B2C) |
| [api-design.md](./api-design.md) | REST API `/api/pda/*` |
| [01-foundation/](./01-foundation/) | Đăng nhập, menu, session |
| [02-inbound/](./02-inbound/) | Check-in, Receiving, Putaway |
| [03-outbound/](./03-outbound/) | Picking, Packing |
| [04-shipping/](./04-shipping/) | Carrier handover |
| [05-inventory/](./05-inventory/) | Inquiry (Phase 1) |

## Menu PDA (Phase 1)

```
Home
├── Inbound
│   ├── Check-in IR
│   ├── Receiving
│   └── Putaway
├── Outbound
│   ├── Picking
│   └── Packing
├── Shipping
│   └── Bàn giao 3PL (giao / nhận)
├── Inventory
│   └── Inquiry
└── More
    └── My Sessions
```

## Map Portal Admin ↔ PDA

| Admin (Planning) | PDA (Execution) |
|---|---|
| Yêu cầu nhập kho (IR) | Check-in → Receiving → Putaway |
| Lấy hàng + Phân công | Pick Session |
| Đóng gói | Pack Session |
| Bàn giao NVC | Bàn giao 3PL (giao/nhận) |
| Vị trí sản phẩm | Inquiry (read-only) |

## Code tham chiếu

- **UI app:** routes `/pda/*` — layout mobile [`src/pda/PdaLayout.tsx`](../../src/pda/PdaLayout.tsx)
- Mock API: [`src/data/pdaApi.ts`](../../src/data/pdaApi.ts)
- Permissions: [`src/data/permissions.ts`](../../src/data/permissions.ts) — nhóm `pda.*`
- Role presets: [`src/data/pdaRoles.ts`](../../src/data/pdaRoles.ts)

### Truy cập nhanh

1. Mở `/pda/login` (hoặc link **Mở PDA WMS** trên trang đăng nhập Control Center)
2. Chọn vai trò + kho → **Vào PDA**
3. Menu home hiển thị module theo role (Supervisor thấy đủ Phase 1)

## Phân giai đầy đủ (~35 module)

Xem bản kế hoạch tổng thể (7 domain: Inbound, Outbound Pick, Outbound Pack, Shipping, Inventory, Utilities, Foundation). Phase 1 triển khai **12 module**; Phase 2–3 bổ sung Returns, B2B, Sort, Cycle count, v.v.
