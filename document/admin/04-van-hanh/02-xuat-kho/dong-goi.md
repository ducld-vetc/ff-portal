# Đóng gói

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.  
> Entity phiên: `PackToteSession` — `src/data/packingSessions.ts`

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Xuất kho |
| Menu | Vận hành → Xuất kho → Đóng gói |
| Route | `/operations/packing` |
| Actor chính | Nhân viên packing (packer) |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Đóng gói theo **tote đã lấy hàng xong**, với luồng UI **khác nhau theo loại DSLH** (phương thức lấy hàng).
- Quét sản phẩm để xác nhận đóng gói → sinh **mã kiện** (`PG…`) và **nhãn vận chuyển**.
- Hỗ trợ tạm dừng phiên, báo thiếu hàng, đóng gói thiếu (có PIN), khai báo VAS.

## 3. Phạm vi

### Trong phạm vi
- Packing station theo tote + 4 nhóm luồng: PTO/MIO/PTS, SIO, SSO, SMO
- 4 nút: Đóng gói thiếu · Tạm dừng · Thiếu hàng · Thêm VAS
- Bảng đơn đã xử lý (lịch sử phiên)
- Demo seed: `TOTE-PTO-01`, `TOTE-MIO-01`, `TOTE-PTS-01`, `TOTE-SIO-01`, `TOTE-SSO-01`, `TOTE-SMO-01`

### Ngoài phạm vi
- Đóng gói theo nhãn — màn riêng `/operations/packing-by-label`
- PDA pack rewrite (Phase 1 giữ luồng đơn giản; xem [PDA Đóng gói](../../../pda/03-outbound/dong-goi.md))
- Backend WMS thật (mock in-memory)

## 4. Luồng nghiệp vụ theo loại DSLH

### 4.0. Vào phiên

1. Packer quét **mã tote** trên màn chính.
2. Hệ thống resolve loại DSLH → mở phiên `PackToteSession` (`status=active`), cập nhật thiết bị → `packing`.
3. Quét lại tote đang `paused` → resume đúng tiến độ `scannedQty`.

```
Scan tote → Resolve pickType → Flow UI
  → Scan SKU(s) → Complete order → packageCode + tracking label
  → Lặp đến hết đơn trong tote → session done
```

### 4.1. PTO / MIO / PTS — 1 tote = 1 đơn

| Bước | Thao tác | Hệ thống |
|---|---|---|
| 1 | Quét tote | Hiện thông tin đơn, chi tiết SP, ghi chú/hướng dẫn đóng gói |
| 2 | Quét từng SKU trong tote | Cộng `scannedQty` theo dòng |
| 3 | Đủ toàn bộ SP | Tạo `packageCode`, hiện nhãn VC để in/dán |

### 4.2. SIO — nhiều đơn, mỗi đơn 1 SP

1. Quét tote → danh sách đơn (mỗi đơn 1 dòng SP).
2. Packer lấy SP từ tote, quét barcode → hệ thống **map đúng OR**.
3. Tạo kiện + hiện nhãn ngay cho đơn đó; cập nhật số kiện theo đơn.
4. Lặp đến hết SP trong tote.

### 4.3. SSO — cùng 1 SKU, SL có thể khác theo đơn

1. Quét tote → gợi ý **SKU × SL** của đơn hiện tại.
2. Quét đủ SL gợi ý → hiện nhãn VC → packer đóng hàng vật lý, in & dán.
3. Chuyển đơn kế; lặp đến đủ số đơn.

### 4.4. SMO — cùng bộ SKU và SL từng mã (pattern)

1. Quét tote → hiện **pattern** (nhiều SKU + SL) của một đơn mẫu.
2. Phân hàng vật lý theo pattern, quét đủ gợi ý → nhãn VC → in/dán.
3. Lặp pattern cho các đơn còn lại đến hết tote.

> `MSMQ` (tạo DSLH) map hành vi đóng gói giống **SMO**.

## 5. Nút chức năng

### (1) Đóng gói thiếu

- **Mục đích:** Shop/khách đồng ý giao phần hàng còn lại dù thiếu SP.
- **Thao tác:** Nhập mật khẩu supervisor (demo PIN `123456`) → các dòng chưa quét = `skipped` → vẫn tạo kiện (partial) + nhãn.
- **Điều kiện:** Đã quét ≥ 1 SP trên đơn hiện tại; đơn chưa đủ.

### (2) Tạm dừng

- Lưu phiên `paused`, đưa về màn chính khu đóng gói.
- Có thể quét tote khác.
- Quét lại **đúng mã tote** → tiếp tục từ vị trí trước khi tạm dừng.

### (3) Thiếu hàng

- Đánh dấu mọi SP **chưa quét** của phạm vi đang xử lý là `shortage`.
  - Ví dụ đơn A,B,C: chỉ quét A,C → B thiếu; chưa quét gì → A,B,C thiếu.
- Tote → trạng thái **lấy hàng bị thiếu** (`pick_shortage`).
- Packer **Tạm dừng**, chuyển tote sang khu lấy lại; quét tote khác để làm tiếp.

### (4) Thêm dịch vụ cộng thêm (VAS)

- Khai báo dịch vụ đặc biệt trong phiên: băng keo niêm phong, dunnage, bọc PE, gói quà, tem dễ vỡ…
- Phục vụ xử lý đúng yêu cầu và tính phí sau này.

## 6. Màn hình & thao tác UI

### Màn chính — `/operations/packing`

- Ô quét tote + hint demo theo loại.
- Bảng đơn đã xử lý: ngày, tote, loại, đối tác, OR, kiện, vận đơn, in chứng từ.

### Màn phiên

- Header: tote, loại DSLH, tiến độ đơn, mã DSLH.
- Vùng nội dung theo `flowKind`: single_order / sio / sso / smo.
- Ô quét SKU.
- Modal nhãn sau mỗi đơn hoàn tất.
- Sticky footer: 4 nút chức năng.

## 7. Dữ liệu

### PackToteSession

| Trường | Ghi chú |
|---|---|
| `toteCode` / `pickType` / `flowKind` | Tote & loại luồng |
| `status` | `active` \| `paused` \| `pick_shortage` \| `done` |
| `orders[]` | Danh sách OR trong tote |
| `currentOrderIndex` | Đơn đang pack (SSO/SMO/PTO…) |
| `vasCodes[]` | VAS đã chọn |

### PackOrder / PackOrderLine

| Trường | Ghi chú |
|---|---|
| `outboundCode`, `partnerOrCode`, `packingNote` | Header đơn |
| `lines[].sku/qty/scannedQty/status` | Tiến độ quét |
| `packageCode`, `trackingCode`, `partial` | Kết quả đóng gói |

## 8. Quy tắc nghiệp vụ

1. Không bắt đầu lại tote đã `done` trong phiên demo hiện tại.
2. SKU phải thuộc đơn đang xử lý (hoặc map được đơn SIO còn mở).
3. Không complete khi còn dòng `pending` (trừ Đóng gói thiếu có PIN).
4. Thiếu hàng → không “xóa” tiến độ đã quét; đánh dấu phần chưa quét.
5. Tạm dừng không mất `scannedQty`.

## 9. Phân quyền

| Key | Mô tả |
|---|---|
| `operations.packing.view` | Vào station đóng gói |
| `operations.packing.partial` (gợi ý) | Đóng gói thiếu (PIN) |
| `operations.packing.vas` (gợi ý) | Khai báo VAS |

## 10. API đề xuất

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/admin/pack/totes/:code` | Lookup tote + pickType + orders |
| POST | `/api/admin/pack/sessions` | Start / resume |
| POST | `/api/admin/pack/sessions/:id/scan` | `{ sku }` |
| POST | `/api/admin/pack/sessions/:id/pause` | Tạm dừng |
| POST | `/api/admin/pack/sessions/:id/shortage` | Báo thiếu |
| POST | `/api/admin/pack/sessions/:id/partial` | `{ pin }` đóng gói thiếu |
| POST | `/api/admin/pack/sessions/:id/vas` | `{ codes[] }` |

## 11. Tiêu chí nghiệm thu

1. `TOTE-PTO-01` / MIO / PTS: hiện 1 đơn + note; quét đủ → có kiện + nhãn.
2. `TOTE-SIO-01`: mỗi lần quét SKU tạo kiện đúng OR.
3. `TOTE-SSO-01` / `TOTE-SMO-01`: gợi ý SL/pattern đúng; đủ → nhãn; lặp hết đơn.
4. Tạm dừng + quét lại tote resume `scannedQty`.
5. Thiếu hàng → tote `pick_shortage`; Đóng gói thiếu cần PIN đúng; VAS lưu trên phiên.

## 12. Liên quan

- [Đóng gói theo loại DSLH — spec Dev](./dong-goi-theo-loai-dslh.md) — sequence, rule, API, test matrix từng loại
- [Đóng gói theo nhãn](./dong-goi-theo-nhan.md)
- [Lấy hàng](./lay-hang.md) — nguồn DSLH / tote
- [PDA — Đóng gói](../../../pda/03-outbound/dong-goi.md)
