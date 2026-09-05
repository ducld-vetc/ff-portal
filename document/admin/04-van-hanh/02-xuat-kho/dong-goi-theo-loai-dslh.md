# Đóng gói — luồng chi tiết theo loại DSLH (cho Dev)

> Spec triển khai packing station Admin (`/operations/packing`).  
> Tham chiếu UI mock: `src/data/packingSessions.ts`, `src/pages/AdminPackingPage.tsx`.  
> Tài liệu tổng: [Đóng gói](./dong-goi.md)

## 0. Quy ước chung (áp dụng mọi loại)

### 0.1. Entity

| Entity | Vai trò |
|---|---|
| `PickList.type` | Loại DSLH (PTO/MIO/PTS/SIO/SSO/SMO/…) |
| `PackToteSession` | Phiên đóng gói theo 1 tote |
| `PackOrder` | 1 OR trong tote |
| `PackOrderLine` | 1 dòng SP cần quét (`qty`, `scannedQty`, `status`) |
| `packageCode` | Mã kiện (`PG…`) sinh khi đơn hoàn tất pack |
| `trackingCode` | Mã vận đơn trên nhãn |

### 0.2. Map loại → flow UI

| `PickList.type` | `flowKind` | Component gợi ý |
|---|---|---|
| `PTO`, `MIO`, `PTS` | `single_order` | `PackFlowSingleOrder` |
| `SIO` | `sio` | `PackFlowSio` |
| `SSO` | `sso` | `PackFlowBatchSameSku` |
| `SMO`, `MSMQ` | `smo` | `PackFlowBatchSamePattern` |
| `Cluster`, `PTD` | `single_order` (fallback) | Cùng single-order; PTD thường không vào station |

```ts
function resolvePackFlowKind(type: PickListType): PackFlowKind {
  if (type === 'SIO') return 'sio'
  if (type === 'SSO') return 'sso'
  if (type === 'SMO' || type === 'MSMQ') return 'smo'
  return 'single_order' // PTO | MIO | PTS | …
}
```

### 0.3. Trạng thái phiên

| `session.status` | Ý nghĩa |
|---|---|
| `active` | Đang đóng gói |
| `paused` | Tạm dừng — quét lại tote để resume |
| `pick_shortage` | Đã báo thiếu hàng — chuyển khu lấy lại |
| `done` | Hết đơn trong tote |

### 0.4. Entry / Exit phiên (mọi loại)

```
[Màn chính]
  Scan toteCode
    → lookup tote (status ready_packing | packing | paused)
    → nếu có session paused cùng tote → RESUME (giữ scannedQty)
    → else START session (status=active, device=packing)
    → mở màn phiên theo flowKind

[Màn phiên]
  … luồng riêng theo loại …
  Khi mọi PackOrder.completed = true → session.status=done → về màn chính
```

### 0.5. Side effects khi hoàn tất 1 đơn

1. Sinh `packageCode`, gán/sinh `trackingCode` nếu thiếu.
2. `PackOrder.completed = true` (`partial=true` nếu đóng gói thiếu).
3. Hiện modal/panel **Nhãn vận chuyển** (In nhãn).
4. Ghi lịch sử «Đơn đã xử lý».
5. OR liên quan → trạng thái đóng gói (backend).

### 0.6. Nút chung (mọi loại) — xem mục 5

Đóng gói thiếu · Tạm dừng · Thiếu hàng · VAS.

---

## 1. Luồng PTO / MIO / PTS (`flowKind = single_order`)

### 1.1. Đặc điểm

| | PTO | MIO | PTS |
|---|---|---|---|
| Khi lấy hàng | Lấy theo từng đơn | Đơn nhiều SP | Lấy + phân loại theo đơn |
| Trong tote lúc pack | **Đúng 1 OR** | **Đúng 1 OR**, nhiều dòng SKU | **Đúng 1 OR** đã sort |
| Pack | Quét đủ mọi dòng của đơn đó → 1 kiện |

> UI **cùng một flow**; khác nhau chủ yếu ở dữ liệu nguồn / packing note.

### 1.2. Sequence

```
1. Scan tote
2. Hiển thị:
   - Header đơn: outboundCode, partnerOrCode, partnerName
   - Bảng lines: sku, name, qty, scannedQty, unit, status
   - packingNote / hướng dẫn đóng gói (nếu có)
3. Packer scan từng SKU (barcode)
   - Match line thuộc đơn; scannedQty += 1 (không vượt qty)
   - Sai SKU → error «SKU không thuộc đơn»
   - Đã đủ dòng → warning «Đã quét đủ»
4. Khi mọi line: scannedQty >= qty
   → auto complete đơn
   → tạo packageCode + trackingCode
   → hiện nhãn VC
5. Session done (vì chỉ 1 đơn) → về màn chính
```

### 1.3. UI states

| State | Màn hình |
|---|---|
| `await_product_scan` | Focus ô quét SP; bảng line còn pending |
| `order_complete` | Modal nhãn; session → done |
| `partial_ready` | Có ≥1 line đã scan nhưng chưa đủ — cho phép «Đóng gói thiếu» |

### 1.4. API / event gợi ý

| Event | Input | Output |
|---|---|---|
| `POST /pack/sessions` | `{ toteCode }` | session + 1 order + lines |
| `POST /pack/sessions/:id/scan` | `{ sku }` | line progress; optional `completedOrder` |
| `POST /pack/sessions/:id/complete` | (optional explicit) | package + label |

### 1.5. Acceptance

- [ ] Tote PTO/MIO/PTS chỉ resolve đúng 1 OR.
- [ ] Hiện packing note nếu có.
- [ ] Quét đủ → có `packageCode`.
- [ ] Quét SKU ngoài đơn → lỗi, không tăng SL.

---

## 2. Luồng SIO (`flowKind = sio`)

### 2.1. Đặc điểm

- Mỗi **OR chỉ có 1 dòng SP** (`qty` thường = 1).
- **1 tote chứa nhiều OR**.
- Quét SP → hệ thống **tự map** OR còn mở có SKU đó → đóng gói ngay đơn đó.

### 2.2. Sequence

```
1. Scan tote
2. Hiển thị danh sách đơn trong tote:
   - outboundCode, partnerOrCode, sku, name, trạng thái (chờ / đã đóng gói), packageCode
3. Packer lấy 1 SP từ tote → Scan barcode
4. Hệ thống:
   a. Tìm PackOrder chưa completed có line.sku khớp và còn thiếu
   b. scannedQty += 1
   c. Vì đơn 1 SP: ngay lập tức complete đơn
   d. Tạo packageCode + trackingCode
   e. Hiện nhãn VC cho đơn vừa xong
   f. Highlight / cập nhật dòng đơn trên list
5. Lặp bước 3–4 đến khi mọi đơn completed
6. Session done
```

### 2.3. Quy tắc map SKU → đơn

1. Chỉ xét đơn `completed = false`.
2. Ưu tiên đơn có `line.sku` khớp và `scannedQty < qty`.
3. Nếu **nhiều đơn cùng SKU** còn mở: lấy đơn đầu tiên theo thứ tự ổn định (FIFO trong tote / sort `outboundCode`).
4. Không có đơn khớp → lỗi `SKU không khớp đơn còn lại trong tote`.

### 2.4. UI states

| State | Hiển thị |
|---|---|
| `list_orders` | Bảng nhiều đơn 1-line |
| `label_popup` | Sau mỗi lần scan thành công (1 đơn xong) |
| `all_done` | Hết đơn → về home |

### 2.5. Acceptance

- [ ] Scan SKU A đóng đúng 1 OR chứa A; OR khác không đổi.
- [ ] Hai đơn cùng SKU: scan 2 lần → đóng lần lượt 2 đơn.
- [ ] Mỗi đơn xong có `packageCode` riêng trên list.

---

## 3. Luồng SSO (`flowKind = sso`)

### 3.1. Đặc điểm

- Mọi đơn trong tote **cùng 1 SKU**.
- **Số lượng (`qty`) có thể khác** giữa các đơn (1, 2, 3…).
- Pack lần lượt **từng đơn**: gợi ý SL cần quét cho đơn hiện tại.

### 3.2. Sequence

```
1. Scan tote
2. Xác định currentOrder = đơn chưa completed đầu tiên
3. Hiển thị gợi ý lớn:
   - SKU
   - qty cần quét (vd. «SKU-CHARGER-20W × 2»)
   - progress scannedQty/qty
   - thông tin OR hiện tại
4. Packer scan SKU (đúng mã gợi ý)
   - scannedQty += 1 mỗi lần
   - Sai SKU → lỗi
5. Khi scannedQty >= qty của đơn hiện tại
   → complete đơn → packageCode + nhãn
   → currentOrder = đơn kế chưa xong
   → lặp từ bước 3
6. Hết đơn → session done
```

### 3.3. Quy tắc

- Một thời điểm chỉ 1 `currentOrderIndex`.
- Không cho quét “dồn” sang đơn sau khi đơn hiện tại chưa xong.
- `qty` lấy từ line đơn hiện tại (không hardcode).

### 3.4. Acceptance

- [ ] Đơn qty=1: 1 scan → nhãn; chuyển đơn qty=2.
- [ ] Progress bar/text `scanned/qty` đúng.
- [ ] Scan SKU khác → lỗi.

---

## 4. Luồng SMO (`flowKind = smo`) — áp dụng cả MSMQ

### 4.1. Đặc điểm

- Các đơn **giống nhau về bộ SKU và SL từng mã** (cùng pattern).
  - Ví dụ mỗi đơn: 1× sạc + 1× cáp.
- Packer phân hàng vật lý theo pattern, quét đủ gợi ý trên màn → 1 kiện / đơn → lặp.

### 4.2. Sequence

```
1. Scan tote
2. currentOrder = đơn chưa completed đầu tiên
3. Hiển thị pattern (bảng lines của đơn hiện tại):
   - sku, name, qty, scannedQty
   - packingNote kiểu «Pattern: 1 sạc + 1 cáp»
4. Packer scan lần lượt các SKU trong pattern
   - Mỗi scan +1 đúng line
   - Cho phép xen kẽ thứ tự SKU miễn thuộc pattern và chưa đủ
5. Khi mọi line của đơn: scannedQty >= qty
   → complete → packageCode + nhãn
   → currentOrder++
   → reset UI pattern cho đơn mới (scannedQty=0 trên đơn mới)
6. Lặp đến hết số đơn cần đóng gói
```

### 4.3. MSMQ

- Tạo DSLH có thể chọn `MSMQ` (nhiều SP giống nhau, SL có thể khác giữa đơn).
- **Packing:** map `MSMQ → flowKind smo`.
- Nếu SL từng mã **khác nhau giữa đơn**, UI vẫn dùng pattern của **đơn hiện tại** (không giả định mọi đơn qty giống hệt). Với **SMO thuần**, seed/data đảm bảo các đơn cùng pattern.

### 4.4. Acceptance

- [ ] Đủ 2 SKU của pattern → nhãn; đơn 2 hiện pattern mới (scanned=0).
- [ ] Thiếu 1 SKU trong pattern → chưa complete.
- [ ] Số đơn đóng = `orderQty` của tote/session.

---

## 5. Nút chức năng chung (mọi flow)

### 5.1. Đóng gói thiếu

```
Precondition:
  - Có đơn đang xử lý (SIO: đơn đã scan ≥1 SP; single/sso/smo: currentOrder)
  - Đơn chưa đủ (còn line pending)
  - scannedQty tổng > 0 trên đơn đó

Action:
  1. Hiện modal nhập PIN supervisor
  2. Verify PIN (demo: 123456)
  3. Mọi line chưa đủ → status = skipped
  4. completeOrder(partial=true) → packageCode + nhãn
  5. Chuyển đơn kế / done nếu hết
```

### 5.2. Tạm dừng

```
1. session.status = paused; lưu pausedAt + toàn bộ scannedQty
2. Đóng màn phiên → màn chính
3. Cho phép scan tote khác
4. Scan lại đúng toteCode → resume active, UI đúng progress cũ
```

### 5.3. Thiếu hàng

```
1. Scope đánh dấu shortage:
   - single/sso/smo: mọi line pending của currentOrder
   - sio: mọi line pending của mọi đơn chưa completed
   (Hoặc theo product rule: chỉ đơn đang thao tác — ghi rõ trong API; mock hiện tại: SIO = tất cả đơn mở)

2. Ví dụ đơn A,B,C:
   - Đã quét A,C → đánh dấu B shortage
   - Chưa quét gì → A,B,C shortage

3. session.status = pick_shortage
4. device/tote status = pick_shortage
5. Toast: tạm dừng → chuyển tote khu lấy lại → scan tote khác
```

### 5.4. Thêm VAS

```
1. Modal multi-select: seal_tape | dunnage | pe_wrap | gift_wrap | fragile_sticker
2. Gắn vasCodes[] vào session (và/hoặc đơn hiện tại — backend quyết định billing)
3. Không chặn luồng scan
```

---

## 6. Pseudo-code điều phối scan

```ts
function onScanProduct(session: PackToteSession, sku: string) {
  switch (session.flowKind) {
    case 'sio':
      return scanSio(session, sku)       // map OR → maybe complete 1 order
    case 'sso':
    case 'smo':
    case 'single_order':
      return scanCurrentOrder(session, sku) // +1 line; complete nếu đủ
  }
}

function scanCurrentOrder(session, sku) {
  const order = session.orders[session.currentOrderIndex]
  const line = order.lines.find(l => matchSku(l, sku) && l.scannedQty < l.qty)
  if (!line) throw Error(...)
  line.scannedQty++
  if (order.lines.every(l => l.scannedQty >= l.qty || l.status === 'skipped')) {
    completeOrder(order, partial=false)
    advanceCurrentIndex(session)
  }
}
```

---

## 7. Ma trận test nhanh (cho QA / Dev)

| Case | Input | Kỳ vọng |
|---|---|---|
| PTO happy | `TOTE-PTO-01` + scan đủ 2 SKU | 1 kiện, session done |
| MIO happy | `TOTE-MIO-01` + 3 SKU đủ qty | 1 kiện |
| PTS happy | `TOTE-PTS-01` | 1 kiện |
| SIO happy | `TOTE-SIO-01` scan lần lượt 4 SKU | 4 kiện / 4 OR |
| SSO happy | `TOTE-SSO-01` | 3 đơn qty 1→2→3 |
| SMO happy | `TOTE-SMO-01` | 3 đơn × pattern 2 SKU |
| Pause/resume | Scan 1 SP → Tạm dừng → quét lại tote | `scannedQty` giữ nguyên |
| Shortage | Chưa đủ → Thiếu hàng | line pending → shortage; tote `pick_shortage` |
| Partial | Scan 1/2 → PIN đúng | partial kiện + skipped |
| Partial sai PIN | PIN sai | không tạo kiện |

---

## 8. File tham chiếu trong repo

| File | Nội dung |
|---|---|
| `src/data/packingSessions.ts` | Seed tote + mock API |
| `src/data/pickingLists.ts` | `PickListType`, `resolvePackFlowKind` |
| `src/pages/AdminPackingPage.tsx` | Station UI |
| `src/components/packing/*` | Flow views + PIN/VAS/actions |
| `document/admin/04-van-hanh/02-xuat-kho/dong-goi.md` | BRD tổng |
