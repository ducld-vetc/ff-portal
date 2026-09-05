# PDA — Đóng gói (Packing)

> Outbound · Tote Packing trên thiết bị cầm tay  
> Map Admin: [Đóng gói](../../admin/04-van-hanh/02-xuat-kho/dong-goi.md) · [Spec theo loại DSLH](../../admin/04-van-hanh/02-xuat-kho/dong-goi-theo-loai-dslh.md)  
> Entity: `PackToteSession` — `src/data/packingSessions.ts` (dùng chung Admin)

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | PDA / Outbound |
| Route | `/pda/packing` |
| Actor | Packer |
| UI | `src/pda/pages/PdaPackPage.tsx` |

## 2. Mục tiêu

- Quét **tote** → đóng gói theo **loại DSLH** (cùng rule với Admin station).
- Quét **SKU** (có ảnh + ghi chú dòng) → tạo **mã kiện** + **nhãn VC**.
- Hỗ trợ **Đóng gói thiếu** (PIN), **Tạm dừng**, **Thiếu hàng**, **VAS** trên mobile.

## 3. Luồng màn hình

```
[Home] Scan tote / tap chip demo
  → Session theo flowKind
  → Scan SKU
  → (đủ đơn) Modal nhãn → In
  → Lặp đến hết tote → màn «Tote hoàn tất»
```

### Theo loại

| Loại | UI PDA |
|---|---|
| PTO / MIO / PTS | Card đơn + list SP (ảnh, note, progress) |
| SIO | List nhiều đơn 1 SP; quét SP → kiện ngay |
| SSO | Gợi ý lớn SKU × qty + ảnh/note |
| SMO | Pattern nhiều dòng SP như single-order |

Demo tote: `TOTE-PTO-01`, `TOTE-MIO-01`, `TOTE-PTS-01`, `TOTE-SIO-01`, `TOTE-SSO-01`, `TOTE-SMO-01` (và legacy `RNN.052` → PTO).

## 4. Nút thao tác (mobile)

| Nút | Hành vi |
|---|---|
| Đóng gói thiếu | Modal PIN (`123456`) → partial pack |
| Tạm dừng | `paused` → về home; quét lại tote để resume |
| Thiếu hàng | Line chưa quét → shortage; banner hướng dẫn |
| Thêm VAS | Modal chọn dịch vụ |

## 5. API (logic mock dùng chung Admin)

| Method | Hàm | Mô tả |
|---|---|---|
| Start/Resume | `startOrResumePackSession` | Mở phiên theo tote |
| Scan | `scanPackProduct` | +1 SKU / complete đơn |
| Pause / Shortage / Partial / VAS | tương ứng trong `packingSessions.ts` | |

## 6. Tiêu chí nghiệm thu

1. PDA `/pda/packing` quét `TOTE-PTO-01` → thấy ảnh + ghi chú SP.
2. SIO/SSO/SMO đúng luồng như Admin.
3. Tạm dừng + quét lại tote giữ `scannedQty`.
4. Modal nhãn hiện `packageCode` + `trackingCode`.
5. Sample panel bên phải liệt kê đủ tote demo.
