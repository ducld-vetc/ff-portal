# PDA — Bàn giao 3PL (ĐVVC)

> Phase 1 · Shipping · Carrier / 3PL Handover

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | PDA / Shipping |
| Menu | **Bàn giao 3PL** → Phiên giao / Phiên nhận |
| Route | `/pda/handover/delivery` · `/pda/handover/receipt` |
| Actor | Handover clerk (`PDA_HANDOVER`) |
| Map Admin | [Bàn giao NVC](../../admin/04-van-hanh/04-van-chuyen/ban-giao-nha-van-chuyen.md) |
| Entity | `CarrierHandoverSession`, `HandoverPackage` — `src/data/carrierHandovers.ts` |
| UI | `src/pda/pages/PdaHandoverPage.tsx` |

## 2. Mục tiêu

Trên PDA tạo/mở phiên bàn giao với **3PL / ĐVVC**, **quét kiện** (`packageCode`) / vận đơn / OR vào phiên, **loại kiện** khi cần, **xác nhận bàn giao**.

- **Phiên giao** (`delivery`): bàn giao kiện xuất kho cho ĐVVC.
- **Phiên nhận** (`receipt`): nhận hàng trả từ ĐVVC (gắn Loại trả / Tình trạng khi quét).

## 3. Luồng màn hình

```
Home → Bàn giao 3PL → Phiên giao | Phiên nhận
  → Chọn ĐVVC → Tạo phiên (hoặc mở phiên đang xử lý)
  → [Receipt] chọn Loại trả / Tình trạng
  → Quét package / tracking / OR
  → Thêm vào danh sách (dedupe; từ chối OR hủy)
  → Loại kiện nếu sai
  → Xác nhận bàn giao → status handed_over
```

## 4. Quy tắc scan

| Scan | Resolve | Validation |
|---|---|---|
| `packageCode` (PG…) | Package demo ready | Chưa trùng trong phiên |
| `trackingCode` | → package | Tồn tại |
| `outboundCode` (OR) | → package | OR chưa hủy |

| Lỗi | Mô tả |
|---|---|
| `PACKAGE_DUPLICATE` | Trùng trong phiên |
| `PACKAGE_NOT_READY` | Không resolve được mã |
| `OR_CANCELLED` | OR đã hủy — không thêm |
| `HAS_CANCELLED_OR` | Confirm khi còn kiện OR hủy → modal loại & bàn giao phần còn lại |

## 5. Trường nghiệp vụ

| Trường | Ý nghĩa |
|---|---|
| `code` | Mã phiên bàn giao |
| `carrierCode` / `carrierName` | ĐVVC / 3PL |
| `sessionType` | `delivery` \| `receipt` |
| `status` | new → processing → handed_over |
| `packages[].packageCode` | Kiện quét vào |
| `packages[].returnType` / `condition` | Chỉ phiên nhận |
| `packageCount` | Tổng kiện |

## 6. API (mock)

| Method | Path | Mô tả |
|---|---|---|
| POST | `/api/pda/handover/sessions` | `createCarrierHandover` |
| POST | `/api/pda/handover/sessions/:id/scan` | `pdaHandoverScan` |
| DELETE | `/api/pda/handover/sessions/:id/packages/:packageCode` | `pdaHandoverRemovePackage` |
| POST | `/api/pda/handover/sessions/:id/confirm` | `pdaConfirmHandover` |

## 7. Side effects

- Phiên Admin sync cùng store `carrierHandovers` → status `handed_over`.
- OR hủy trong phiên: cảnh báo trên list + bắt buộc loại (hoặc “Loại hủy & bàn giao”) trước confirm.

## 8. Tiêu chí nghiệm thu

1. Home tile **Bàn giao 3PL** mở sheet Phiên giao / Phiên nhận.
2. Quét kiện hợp lệ → thêm vào list; quét trùng / OR hủy → từ chối.
3. Phiên nhận gắn Loại trả + Tình trạng theo chip đang chọn.
4. Confirm → Admin chi tiết phiên `handed_over`.
5. Sample panel: `PGHACWBMUP269170001`, `802789820795`, `ORHACWBMUP26917`.
