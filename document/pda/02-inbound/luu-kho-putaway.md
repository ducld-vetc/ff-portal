# PDA — Lưu kho (Putaway)

> Phase 1 · Inbound · Directed Putaway

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | PDA / Inbound |
| Actor | Putaway operator |
| Tiền đề | IR `received` (hoặc hàng staging sau receive) |
| Map Admin | IR `storedQty`, [Vị trí sản phẩm](../../admin/05-san-pham/vi-tri-san-pham.md) |

## 2. Mục tiêu

Hệ thống **chỉ vị trí đích** (directed putaway); operator quét **bin + SKU** để xác nhận cất hàng, tăng tồn tại vị trí.

## 3. Luồng màn hình

```
Putaway task list (by IR or open tasks)
  → Select task / Scan LPN-staging
  → Show: SKU, qty to put, Suggested bin (directed)
  → Scan destination BIN
  → Scan SKU (confirm)
  → Enter qty put
  → Confirm → Next line / Complete task
```

## 4. Quy tắc scan

| Thứ tự | Scan | Validation |
|---|---|---|
| 1 | **Task / IR / Staging LPN** | Task status=`open`, thuộc kho session |
| 2 | **Destination location** (`placeCode`) | Bin tồn tại, active, đúng `locationType` |
| 3 | **SKU** | Khớp task line |
| 4 | Confirm qty | `putQty <= remainingQty` |

| Lỗi | Mô tả |
|---|---|
| `BIN_NOT_FOUND` | Mã vị trí không tồn tại |
| `BIN_WRONG_ZONE` | Vị trí không phù hợp loại hàng |
| `SKU_MISMATCH` | SKU không khớp task |

## 5. Trường nghiệp vụ

| Trường | Ý nghĩa |
|---|---|
| `suggestedBin` | Vị trí hệ thống gợi ý (pick path / zone rules) |
| `sku` | SP cần cất |
| `qtyToPut` | SL còn lại cần putaway |
| `putQty` | SL xác nhận lần này |
| `storedQty` (IR) | Tổng đã lưu kho trên phiếu |

## 6. API

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/pda/putaway/tasks?warehouse=&status=open` | Danh sách task |
| GET | `/api/pda/putaway/tasks/:taskId` | Chi tiết + suggested bin |
| POST | `/api/pda/putaway/tasks/:taskId/confirm` | `{ binCode, sku, qty }` |
| POST | `/api/pda/putaway/tasks/:taskId/complete` | Đóng task |

## 7. Cập nhật tồn

Sau confirm thành công:
- Tạo/cập nhật `ProductLocation` (`kind=location`, `status=ready_storage` hoặc `pickable`).
- Cập nhật IR `storedQty`.

## 8. Tiêu chí nghiệm thu

1. Scan bin sai → từ chối.
2. Putaway đủ → `storedQty` = `receivedQty` trên Admin IR detail.
3. Vị trí SP hiển thị tồn mới trên Admin.
