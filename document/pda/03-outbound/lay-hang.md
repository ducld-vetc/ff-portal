# PDA — Lấy hàng (Picking)

> Phase 1 · Outbound · Directed Pick

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | PDA / Outbound |
| Actor | Picker |
| Map Admin | [Lấy hàng](../../admin/04-van-hanh/02-xuat-kho/lay-hang.md), Phân công lấy hàng |
| Entity | `PickList`, `PickListLine` — `src/data/pickingLists.ts` |

## 2. Mục tiêu

Picker thực hiện **directed pick** theo pick list đã phân công: quét bin → SKU → SL, gán **tote**, hoàn tất phiên.

**Phase 1:** PTO, Cluster, SIO, SSO, MSMQ (B2C). **Không gồm:** PTS Sort, B2B pallet, Skip/Re-pick (Phase 2).

## 3. Luồng màn hình

```
Pick task list (assigned to me)
  → Select / Scan pick list code
  → Scan Tote (container assign)
  → Loop directed lines:
        Show location → Scan BIN → Scan SKU → Enter picked qty
  → Complete pick session
  → Drop tote to pack station
```

## 4. Quy tắc scan

| Bước | Scan | Validation |
|---|---|---|
| Start | **Pick list code** | Status=`ready`/`picking`, assignee=current user |
| Container | **Tote code** | Tote empty hoặc available; đúng loại theo pick type |
| Per line | **Location** (`placeCode`) | Khớp `line.location` |
| Per line | **SKU** | Khớp line; lot/HSD nếu allocate |
| Per line | **Qty** | `pickedQty + delta <= line.qty` |

| Pick type (Phase 1) | Tote rule |
|---|---|
| PTO | 1 tote = 1 đơn (OR) |
| Cluster / SIO | 1 tote = nhiều đơn (multi-SKU) |
| SSO / MSMQ | 1 tote = nhiều đơn cùng pattern |

## 5. Trường nghiệp vụ

| Trường | Ý nghĩa |
|---|---|
| `code` | Mã pick list (DSLH) |
| `type` | PTO / Cluster / SIO / SSO / MSMQ |
| `assignee` | Picker được gán |
| `lines[].location` | Vị trí cần đến |
| `lines[].sku` | SKU cần lấy |
| `lines[].qty` | SL yêu cầu |
| `lines[].pickedQty` | SL đã lấy |
| `lines[].outboundCode` | Đơn xuất liên quan |
| `toteCode` | Thiết bị chứa đang dùng |

## 6. API

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/pda/pick/tasks?assignee=me&status=` | DS pick list |
| POST | `/api/pda/pick/tasks/:pickListId/start` | Bắt đầu phiên |
| POST | `/api/pda/pick/sessions/:sessionId/assign-tote` | `{ toteCode }` |
| GET | `/api/pda/pick/sessions/:sessionId/next-line` | Dòng kế tiếp (directed sequence) |
| POST | `/api/pda/pick/sessions/:sessionId/pick-line` | `{ lineId, binCode, sku, qty }` |
| POST | `/api/pda/pick/sessions/:sessionId/complete` | Hoàn tất → status `picked` |

## 7. Tiêu chí nghiệm thu

1. Chỉ thấy pick list assigned cho user.
2. Scan bin sai → báo lỗi, không ghi nhận.
3. Complete → Admin pick list `picked`, tote chuyển trạng thái «chờ đóng gói».
