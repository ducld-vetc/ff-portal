# PDA — Check-in IR

> Phase 1 · Inbound · ASN/IR Check-in

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | PDA / Inbound |
| Actor | Receiver |
| Map Admin | [Yêu cầu nhập kho](../../admin/04-van-hanh/01-nhap-kho/yeu-cau-nhap-kho.md) |
| Entity | `InboundRequest` — `src/data/inboundRequests.ts` |

## 2. Mục tiêu

Khi xe/cont tới cổng, receiver **quét mã IR** (hoặc mã IR đối tác) để mở **phiên nhận hàng**, chuyển IR từ `new` → `processing`.

## 3. Luồng màn hình

```
Scan IR code → Validate → Confirm header → Start receive session → Receiving screen
     ↘ Not found / wrong status → Error + suggest actions
```

### Bước chi tiết

1. **Scan IR**: quét barcode trên phiếu kế hoạch / ASN.
2. **Hiển thị header**: Mã IR, đối tác, kho, NCC, ngày dự kiến, SL SKU/SP, TTHH.
3. **Xác nhận Check-in**: bấm «Bắt đầu nhận hàng».
4. Hệ thống: `status=processing`, `lastCheckInAt=now`, tạo `ReceiveSession`.
5. Chuyển sang [Nhận hàng](./nhan-hang.md).

## 4. Quy tắc scan

| Quét | Kết quả hợp lệ | Lỗi |
|---|---|---|
| `code` (IR hệ thống) | IR status=`new` | `received`/`cancelled` → không check-in |
| `partnerIrCode` | Resolve → IR nếu duy nhất | Nhiều IR → chọn danh sách |
| Mã không thuộc kho session | — | «IR không thuộc kho đang làm việc» |

## 5. Trường nghiệp vụ (hiển thị)

| Trường | Ý nghĩa |
|---|---|
| `code` | Mã IR fulfillment |
| `partnerIrCode` | Mã đối tác |
| `warehouseName` | Kho nhập |
| `supplier` | Nhà cung cấp |
| `expectedAt` | Ngày dự kiến đến |
| `goodsCondition` | TTHH lô hàng (new/used/damaged) |
| `skuCount` / `productQty` | Phạm vi khai báo |

## 6. API

| Method | Path | Body / Response |
|---|---|---|
| GET | `/api/pda/inbound/lookup?code=` | Resolve IR by code/partnerIrCode |
| POST | `/api/pda/inbound/:irId/check-in` | `{ warehouseCode }` → `ReceiveSession` |

## 7. Tiêu chí nghiệm thu

1. Check-in IR `new` thành công → Admin list hiển thị `processing`.
2. Không check-in IR đã `received` hoặc `cancelled`.
3. Scan partnerIrCode trùng 2 IR → UI chọn IR.
