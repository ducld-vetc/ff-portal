# PDA — Tra cứu vị trí sản phẩm (Inquiry)

> Phase 1 · Inventory · Item/Location Lookup

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | PDA / Inventory |
| Actor | Any operator (read-only) |
| Map Admin | [Vị trí sản phẩm](../../admin/05-san-pham/vi-tri-san-pham.md) |
| Entity | `ProductLocationRow` — `src/data/productLocations.ts` |

## 2. Mục tiêu

Quét **SKU** hoặc **mã vị trí/kiện** → xem tồn, trạng thái, TTHH, HSD. **Không thay đổi tồn** (Phase 1).

## 3. Luồng màn hình

```
Universal scan input
  → Resolve type: SKU | LOCATION | PACKAGE
  → SKU: list all bins + packages for SKU
  → LOCATION: list all SKUs at bin
  → PACKAGE: show package detail + SKUs inside
```

## 4. Quy tắc scan

| Scan pattern | Resolve |
|---|---|
| SKU / barcode sản phẩm | Product lookup |
| Bin code (`R5.II.T1.001`, …) | Location lookup |
| Package (`PG...`) | Package lookup |

## 5. Trường hiển thị

| Trường | Ý nghĩa |
|---|---|
| `sku` / `name` | Sản phẩm |
| `placeCode` | Vị trí hoặc mã kiện |
| `kind` | location \| package |
| `status` | pickable / ready_storage / ready_handover |
| `qty` | Số lượng tồn |
| `pendingOut` | Chờ xuất (location only) |
| `condition` | TTHH |
| `expiryDate` | HSD |

## 6. API

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/pda/inquiry/scan?value=` | Universal resolve |
| GET | `/api/pda/inquiry/sku/:sku` | Tồn theo SKU |
| GET | `/api/pda/inquiry/location/:code` | Tồn theo bin |
| GET | `/api/pda/inquiry/package/:code` | Chi tiết kiện |

## 7. Tiêu chí nghiệm thu

1. Quét SKU → hiện đúng các vị trí/kiện trong kho session.
2. Quét bin → hiện SP tại bin.
3. Không có nút sửa tồn trên màn hình này (Phase 1).
