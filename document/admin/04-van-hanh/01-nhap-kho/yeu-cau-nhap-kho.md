# Yêu cầu nhập kho

> Tài liệu mô tả nghiệp vụ phục vụ phát triển phần mềm. Nhãn menu: **Mới**.  
> Entity: `InboundRequest` — `src/data/inboundRequests.ts`

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | Admin / Vận hành / Nhập kho |
| Menu | Vận hành → Nhập kho → Yêu cầu nhập kho |
| Route danh sách | `/operations/inbound` |
| Route chi tiết | `/operations/inbound/:id` |
| Route tạo trả hàng | `/operations/inbound/return` |
| Actor chính | Nhân viên nhận hàng, supervisor nhập kho, ops |
| Nguồn tạo IR | Partner (Customer portal / import CSV), Admin (import CSV, trả hàng từ OR), API/ERP (tương lai) |
| Mức độ ưu tiên | Cao (tính năng mới) |

## 2. Mục tiêu nghiệp vụ

- Quản lý phiếu **Yêu cầu nhập kho (IR — Inbound Request)** từ lúc Partner/Ops tạo đến khi kho check-in, nhận hàng và hoàn thành.
- Cho phép kho **tra cứu, lọc, check-in, hoàn thành**, in/xuất chứng từ trên portal Admin.
- Hỗ trợ 3 loại phiếu: **Nhập kho**, **Hàng trả**, **Nhập điều chuyển**.
- Tạo nhanh IR loại **Hàng trả** từ **Yêu cầu xuất kho (OR)** đã giao.
- Đồng bộ trạng thái với tầng thực thi sàn kho (PDA: check-in → nhận hàng → putaway).

## 3. Phạm vi

### Trong phạm vi

- Danh sách IR toàn hệ thống (không scoped theo 1 customer) + tìm kiếm / lọc nâng cao / khoảng ngày tạo
- Chi tiết IR: xem dòng SP, check-in, hoàn thành, in biên bản, xuất Excel
- Tabs: ghi chú nhận hàng, lịch sử check-in, phiên nhận hàng (GRN), phiên lưu kho
- Tạo IR trả hàng từ OR (tra cứu mã OR / mã OR đối tác)
- **Import phiếu từ CSV** (tải mẫu + upload + xem trước + xác nhận)
- Xuất Excel danh sách / file chi tiết (demo UI)

### Ngoài phạm vi

- Form **tạo IR nhập thường** phía Admin (Partner tạo tại Customer → [Nhập kho](../../../customer/04-van-hanh/nhap-kho.md))
- Quét barcode / nhận từng dòng trên sàn — thuộc PDA ([Check-in IR](../../../pda/02-inbound/check-in-ir.md), [Nhận hàng](../../../pda/02-inbound/nhan-hang.md), [Lưu kho](../../../pda/02-inbound/luu-kho-putaway.md))
- Backend ERP/WMS thật (UI hiện dùng mock in-memory)

## 4. Luồng nghiệp vụ

### 4.0. Happy path end-to-end

```
Partner tạo IR (status=new)
  → Xe/hàng tới kho
  → Check-in (Admin hoặc PDA) → status=processing, lastCheckInAt
  → Nhận hàng (PDA / Admin) → cập nhật receivedQty theo dòng
  → Lưu kho / putaway → cập nhật storedQty
  → Hoàn thành → status=received, receivedAt
```

### 4.1. Tra cứu & tiếp nhận IR

1. Mở **Yêu cầu nhập kho** (`/operations/inbound`).
2. Chọn trường tìm (mặc định **Mã IR đối tác**) + nhập từ khóa; lọc theo **Ngày tạo**.
3. Mở **Bộ lọc** nếu cần: Trạng thái / Kho nhập / Loại.
4. Click **Mã IR** hoặc nút **Check in** (khi status = `new` | `processing`) → vào chi tiết.

### 4.2. Check-in & hoàn thành trên Admin

1. Tại chi tiết, kiểm tra sidebar (kho, loại, TTHH, NCC, tài xế/xe/cont…) và bảng sản phẩm.
2. **Check in**: `new`/`processing` → giữ/chuyển `processing`, ghi `lastCheckInAt`, tăng `receivedQty` (demo: +1 mỗi lần, không vượt `productQty`).
3. Khi đã nhận đủ / xác nhận xong → **Hoàn thành**:
   - `status = received`
   - `receivedQty = productQty`, `storedQty = productQty` (demo gộp nhận + lưu)
   - `receivedAt = hôm nay`, cập nhật `lastCheckInAt`
4. Phiếu `received` / `cancelled` → khóa Check-in & Hoàn thành.

> **Lưu ý sản phẩm đích:** Check-in Admin mang tính giám sát / fallback. Trên sàn, receiver dùng PDA để check-in mở `ReceiveSession` rồi nhận từng SKU; Admin phản ánh tiến độ `receivedQty` / `storedQty`.

### 4.3. Tạo nhập trả hàng từ OR

1. Từ list bấm **Tạo trả hàng** → `/operations/inbound/return`.
2. Nhập **mã OR** hoặc **mã OR đối tác** → Tìm.
3. Hệ thống hiển thị thông tin OR (đối tác, kho, khách đã mask PII, xe/cont…).
4. **Tạo trả hàng** → sinh IR mới:
   - `type = return`, `status = new`
   - `referenceCode = OR.code`
   - `partnerIrCode = OR.partnerOrCode`
   - `supplier = "Khách trả hàng"`
   - `lines[]` copy từ dòng OR
   - `note = "Trả hàng từ OR {code}"`
5. Điều hướng sang chi tiết IR vừa tạo.

### 4.4. Import phiếu từ CSV

1. Trên list bấm **Tải mẫu import** → tải `mau-yeu-cau-nhap-kho.csv` (UTF-8 BOM, mở được Excel).
2. Điền dữ liệu: mỗi dòng = 1 SKU; các dòng cùng `Ma_IR_doi_tac` + `Ma_kho` gom thành 1 phiếu.
3. Lưu lại dạng **CSV** (nếu sửa bằng Excel).
4. Bấm **Import phiếu** → chọn file → xem trước phiếu hợp lệ / dòng lỗi.
5. **Xác nhận import** → tạo IR `status=new`, xuất hiện trên danh sách.

**Cột template**

| Cột | Bắt buộc | Ghi chú |
|---|---|---|
| Ma_IR_doi_tac | Có | Khóa gom phiếu |
| Ma_kho | Có | `KBL`, `WH-HCM-01`, `WH-HN-01`, `WH-DN-01` |
| Loai | Có | `inbound` \| `return` \| `transfer` |
| TTHH | Có | `new` \| `used` \| `damaged` |
| Ngay_du_kien | Có | `YYYY-MM-DD` hoặc `DD/MM/YYYY` |
| So_luong | Có | Số nguyên > 0 |
| SKU hoặc SKU_doi_tac | Có (một trong hai) | Phải khớp catalog |
| Nha_cung_cap, Ma_tham_chieu, Doi_tac, Tai_xe, So_xe, So_container, Ghi_chu, Don_gia, DVT, Serial | Không | Serial nhiều giá trị cách nhau bởi `\|` |

File mẫu tĩnh: `public/templates/mau-yeu-cau-nhap-kho.csv` · logic: `src/data/inboundImport.ts`.

### 4.5. In / xuất chứng từ

- **In biên bản**: biên bản nhận hàng (demo).
- **Xuất Excel** (list / detail): export theo bộ lọc hoặc phiếu đang xem (demo).

## 5. Màn hình & thao tác UI

### 5.1. Danh sách IR — `/operations/inbound`

| Thành phần | Mô tả |
|---|---|
| Header | Tiêu đề «Yêu cầu nhập kho»; nút Tải mẫu import, Import phiếu, Tạo trả hàng, Xuất Excel, Xuất file chi tiết |
| Ô tìm | Select trường + Input + Tìm + Bộ lọc |
| Trường tìm | Mã IR đối tác, Mã IR, Nhà cung cấp, Kho nhập, Mã tham chiếu |
| Khoảng ngày | Mặc định 30 ngày gần nhất theo **Ngày tạo** |
| Bảng | STT, Mã IR (link), Đối tác, Mã IR đối tác, SL SKU, SL Item, SL thực nhận, SL lưu kho, NCC, Loại, Trạng thái, TTHH, Ngày dự kiến gửi hàng, Check-in lần cuối, nút Check in |
| Drawer lọc | Trạng thái, Kho nhập, Loại — Đặt lại / Áp dụng |

**Thao tác chính:** Tìm · Bộ lọc · Mở chi tiết · Check in (nhanh) · Tải mẫu · Import · Tạo trả hàng · Xuất Excel

### 5.2. Chi tiết IR — `/operations/inbound/:id`

**Layout:** 2 cột — trái: bảng SP + tabs; phải: sidebar thông tin phiếu.

| Vùng | Nội dung |
|---|---|
| Header actions | Thoát · In biên bản · Check in · Hoàn thành · Xuất Excel |
| Bảng SP | Tên/SKU/SKU ĐT, SL, Thực nhận, SL tham chiếu, SL lưu kho, ĐVT, Giá, Ghi chú; tìm theo mã/tên; «Ẩn sản phẩm nhận đủ»; tổng SL / thực nhận |
| Tab Ghi chú nhận hàng | `note` |
| Tab Check in | `lastCheckInAt`, người phụ trách |
| Tab Phiên nhận hàng | Mã GRN dạng `CKS{code}`, bảng dòng SP + TTHH phiếu |
| Tab Phiên lưu kho | `storedQty / productQty` |
| Sidebar | Mã IR + tag trạng thái; phụ trách (tên, SĐT); kho, ngày dự kiến; loại, TTHH, người tạo, ghi chú; tài xế / số xe / container / mã IR đối tác / mã tham chiếu / mã OR trả hàng / NCC; dịch vụ cộng thêm; timestamps (tạo / hàng đến / hoàn tất) |

**Thao tác chính:** Check-in · Hoàn thành · In biên bản · Xuất Excel · Thoát

### 5.3. Tạo trả hàng — `/operations/inbound/return`

| Thành phần | Mô tả |
|---|---|
| Ô tìm | Mã xuất kho / mã xuất kho đối tác |
| Card OR | Đối tác, kho xuất, mã OR, mã OR ĐT, khách (mask), địa chỉ (mask), số xe, container |
| CTA | Tạo trả hàng → tạo IR `type=return` và mở chi tiết |

## 6. Dữ liệu & trường thông tin

### 6.1. InboundRequest (header)

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| `id` | ID nội bộ | Có |
| `code` | Mã IR hệ thống (vd. `IRDDBQUB8864`) | Có |
| `partnerIrCode` | Mã IR phía đối tác | Không |
| `partnerName` | Tên đối tác / khách hàng | Không |
| `country` | Quốc gia | Có |
| `warehouseCode` / `warehouseName` | Kho nhập | Có |
| `status` | Xem bảng trạng thái | Có |
| `type` | `inbound` \| `return` \| `transfer` | Có |
| `goodsCondition` | `new` \| `used` \| `damaged` | Có |
| `skuCount` | Số dòng SKU | Có |
| `productQty` | Tổng SL khai báo (ref) | Có |
| `receivedQty` | Tổng SL thực nhận | Có |
| `storedQty` | Tổng SL đã putaway | Không |
| `supplier` | Nhà cung cấp | Không |
| `expectedAt` | Ngày dự kiến gửi hàng | Có |
| `receivedAt` | Ngày hàng đến / hoàn tất | Không |
| `lastCheckInAt` | Check-in lần cuối | Không |
| `createdAt` | Ngày tạo | Có |
| `expiredAt` | Hết hạn phiếu (nếu có) | Không |
| `referenceCode` | Mã tham chiếu (PO, OR…) | Không |
| `driver` / `vehicleNo` / `containerNo` | Thông tin vận chuyển tới kho | Không |
| `note` | Ghi chú | Không |
| `ownerName` / `ownerPhone` | Người phụ trách / tạo | Có |
| `lines[]` | Dòng sản phẩm | Có (≥ 1) |

### 6.2. InboundLine

| Trường | Kiểu / Ghi chú | Bắt buộc |
|---|---|---|
| `id` / `productId` | ID dòng / SP catalog | Có |
| `name` | Tên sản phẩm | Có |
| `sku` / `partnerSku` | SKU hệ thống / đối tác | Có |
| `unit` | Đơn vị tính | Có |
| `qty` | SL khai báo trên IR | Có |
| `unitPrice` | Đơn giá | Không |
| `imageUrl` | Ảnh SP | Không |
| `serials[]` | Serial/IMEI theo SL (nếu SP quản lý serial) | Không |

### 6.3. Enum hiển thị

**Loại (`type`)**

| Mã | Tên hiển thị |
|---|---|
| `inbound` | Nhập kho |
| `return` | Hàng trả |
| `transfer` | Nhập điều chuyển |

**Tình trạng hàng hóa (`goodsCondition`)**

| Mã | Tên hiển thị |
|---|---|
| `new` | Mới |
| `used` | Đã qua sử dụng |
| `damaged` | Hư hỏng |

### 6.4. Trạng thái

| Mã | Tên hiển thị | Ý nghĩa | Thao tác cho phép |
|---|---|---|---|
| `new` | Mới | Đã tạo, chưa tiếp nhận tại kho | Check-in, xem, xuất |
| `processing` | Đang xử lý | Đã check-in; đang nhận / lưu | Check-in tiếp, hoàn thành, xem, xuất |
| `received` | Đã hoàn thành | Đã nhận & (demo) lưu đủ | Chỉ xem / in / xuất |
| `cancelled` | Đã hủy | Phiếu không còn hiệu lực | Chỉ xem / xuất |

```
new ──check-in──► processing ──hoàn thành──► received
 │                     │
 └──── (hủy) ──────────┴──────────────► cancelled
```

## 7. Quy tắc nghiệp vụ

1. **Khóa sau hoàn tất/hủy:** `status ∈ {received, cancelled}` → không Check-in / Hoàn thành.
2. **Check-in:** chỉ hợp lệ khi phiếu còn mở (`new` hoặc `processing`); ghi `lastCheckInAt`; chuyển `new` → `processing`.
3. **SL thực nhận:** `receivedQty ≤ productQty` (tổng); trên PDA ràng buộc theo từng dòng (`SKU_NOT_ON_IR`, `QTY_EXCEEDS`).
4. **Hoàn thành:** yêu cầu đã có tiến trình nhận (thực tế: đủ dòng hoặc supervisor duyệt lệch — Phase 2); cập nhật `receivedAt`, đồng bộ `storedQty` khi putaway xong (sản phẩm đích tách nhận vs lưu).
5. **IR trả hàng:** bắt buộc tham chiếu OR hợp lệ (`referenceCode`); copy dòng từ OR; PII khách hàng mask trên màn tạo trả.
6. **TTHH:** áp dụng cấp phiếu; nhận hàng PDA có thể override theo dòng (new/damaged/expired) nếu cấu hình.
7. **Serial:** nếu SP quản lý serial, số serial phải khớp SL nhận trên dòng.
8. **Kho:** IR gắn 1 kho; PDA chỉ check-in IR thuộc kho đang làm việc.
9. **Không sửa cấu trúc dòng** sau khi đã `processing` sâu / đã có GRN (trừ quy trình điều chỉnh được phép).
10. **Partner** tạo/theo dõi IR trên Customer; **Admin** thực thi & giám sát; không lẫn quyền dữ liệu giữa 2 portal.

## 8. Phân quyền

Permission keys (Admin):

| Key | Mô tả |
|---|---|
| `operations.inbound.view` | Xem danh sách / chi tiết IR |
| `operations.inbound.import` | Import yêu cầu nhập kho từ CSV |
| `operations.inbound.checkin` | Check-in / nhận hàng |
| `operations.inbound.complete` | Hoàn thành phiếu nhập |
| `operations.inbound.export` | Xuất Excel nhập kho |

Gợi ý bổ sung (nếu tách quyền tạo trả hàng): `operations.inbound.create_return`.

PDA liên quan: `pda.inbound.checkin` · `pda.inbound.receive` · `pda.inbound.complete` · `pda.inbound.putaway`.

## 9. Tích hợp & API (đề xuất)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/admin/inbound` | Danh sách + filter (`status`, `warehouseCode`, `type`, search field, `createdFrom`/`createdTo`), phân trang |
| GET | `/api/admin/inbound/:id` | Chi tiết + lines + tiến độ nhận/lưu |
| POST | `/api/admin/inbound/:id/check-in` | Check-in → `processing` |
| POST | `/api/admin/inbound/:id/complete` | Hoàn thành → `received` |
| POST | `/api/admin/inbound/import` | Upload CSV → tạo nhiều IR |
| POST | `/api/admin/inbound/returns` | Body `{ outboundId \| outboundCode }` → tạo IR `type=return` |
| GET | `/api/admin/inbound/export` | Xuất Excel theo filter |
| GET | `/api/admin/inbound/:id/export` | Xuất chi tiết 1 phiếu |
| GET | `/api/admin/inbound/:id/grn-print` | In biên bản / GRN |

Đồng bộ với PDA API: lookup IR, check-in session, receive-line, complete, putaway (xem tài liệu PDA).

## 10. Tiêu chí nghiệm thu

1. Lọc theo trạng thái / kho / loại / ngày tạo / trường tìm — kết quả đúng.
2. Click Mã IR mở đúng chi tiết; nút Check in trên list chỉ hiện với `new` | `processing`.
3. Check-in từ `new` → `processing`, có `lastCheckInAt`; list phản ánh ngay.
4. Hoàn thành → `received`, khóa nút Check-in/Hoàn thành; `receivedQty` / `storedQty` cập nhật.
5. Tạo trả hàng từ OR hợp lệ → IR `type=return`, `referenceCode` = mã OR, dòng SP khớp OR.
6. Import CSV mẫu hợp lệ → tạo đúng số phiếu; dòng lỗi SKU/kho/ngày được báo rõ, không tạo phiếu lỗi.
7. OR không tồn tại → báo lỗi, không tạo IR.
8. PII khách trên màn tạo trả được mask.
9. User thiếu `operations.inbound.checkin` / `complete` / `import` không thực hiện được thao tác tương ứng.
10. IR tạo từ Customer portal / import xuất hiện trên Admin list cùng trạng thái.

## 11. Liên quan

| Tài liệu | Vai trò |
|---|---|
| [Customer — Nhập kho](../../../customer/04-van-hanh/nhap-kho.md) | Partner tạo / theo dõi IR |
| [PDA — Check-in IR](../../../pda/02-inbound/check-in-ir.md) | Check-in trên sàn |
| [PDA — Nhận hàng](../../../pda/02-inbound/nhan-hang.md) | Ghi SL thực nhận theo dòng |
| [PDA — Lưu kho (Putaway)](../../../pda/02-inbound/luu-kho-putaway.md) | Cập nhật `storedQty` |
| [Yêu cầu xuất kho](../02-xuat-kho/yeu-cau-xuat-kho.md) | Nguồn OR cho nhập trả hàng |
