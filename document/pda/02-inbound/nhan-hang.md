# PDA — Nhận hàng (Receiving)

> Phase 1 · Inbound · GRN / Receive

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | PDA / Inbound |
| Actor | Receiver |
| Tiền đề | Đã [Check-in IR](./check-in-ir.md), IR `processing` |
| Entity | `InboundRequest`, `InboundLine` |

## 2. Mục tiêu

Quét từng SKU (và serial nếu có), ghi **SL thực nhận**, **TTHH**, lot/HSD → cập nhật `receivedQty` trên IR.

## 3. Luồng màn hình

```
Receive session active
  → Scan SKU (or partner SKU barcode)
  → Show line: ref qty, received so far
  → Enter qty + condition (+ serial list if tracked)
  → Confirm line receive
  → Repeat until all lines done OR partial allowed
  → Complete IR (supervisor if qty mismatch)
```

### Hoàn tất IR (Receive Complete)

1. Hệ thống so sánh tổng thực nhận vs `productQty` (Ref. Qty).
2. **Khớp** → `status=received`, `receivedAt=today`, đóng session.
3. **Lệch** → cần supervisor PIN hoặc quay lại điều chỉnh dòng (Phase 2: in-session adjustment).

## 4. Quy tắc scan

| Bước | Scan | Validation |
|---|---|---|
| 1 | **SKU / partnerSku** | SKU phải thuộc `lines[]` của IR |
| 2 | (Optional) **Serial/IMEI** | Số serial = qty nếu SP tracked |
| 3 | **Confirm** | `receivedLineQty + delta <= line.qty` (hoặc cho phép over-receive theo config) |

| Mã lỗi | Thông báo |
|---|---|
| `SKU_NOT_ON_IR` | SKU không có trong phiếu nhập |
| `QTY_EXCEEDS_REF` | Vượt SL khai báo |
| `SERIAL_MISMATCH` | Số serial không khớp SL |

## 5. Trường nghiệp vụ (dòng nhận)

| Trường | Ý nghĩa |
|---|---|
| `sku` / `partnerSku` | Mã sản phẩm quét |
| `qty` (ref) | SL partner khai báo trên IR |
| `receivedQty` (line) | SL đã nhận tích lũy |
| `condition` | new / damaged / expired (override TTHH header nếu cần) |
| `serials[]` | IMEI/serial từng đơn vị |
| `lot` / `expiryDate` | Lô / HSD (nếu SP quản lý) |

## 6. API

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/pda/inbound/sessions/:sessionId` | Chi tiết phiên + lines progress |
| POST | `/api/pda/inbound/sessions/:sessionId/receive-line` | `{ sku, qty, condition?, serials? }` |
| POST | `/api/pda/inbound/sessions/:sessionId/complete` | Hoàn tất IR |
| DELETE | `/api/pda/inbound/sessions/:sessionId` | Hủy phiên (chỉ khi chưa complete) |

## 7. Tiêu chí nghiệm thu

1. Quét SKU đúng → cộng `receivedQty` header và line.
2. Complete khi đủ SL → IR `received` trên Admin.
3. Serial SP: số lượng serial = qty dòng.
