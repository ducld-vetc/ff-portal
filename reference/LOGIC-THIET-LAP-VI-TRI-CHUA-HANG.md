# Logic nghiệp vụ: THIẾT LẬP CÁC VỊ TRÍ CHỨA HÀNG

> Xem thêm: lộ trình picker theo từng wave nằm ở **Phân công lấy hàng**, không nằm trong màn Kho — [`LOGIC-LO-TRINH-PICKER.md`](./LOGIC-LO-TRINH-PICKER.md)

---

## 1. Mục đích & điều kiện đầu

Sau khi **tạo kho** trên hệ thống, kho đang **trống** (chưa có phòng, lối đi, kệ, bin, thiết bị chứa).  
Phải thiết lập đủ cấu trúc vị trí trước khi vận hành put-away / picking.

**Thứ tự thiết lập bắt buộc (dependency):**

```
Phòng (Room)
  └─ Tầng kệ (Level)          ← master dùng chung, không thuộc 1 phòng cụ thể theo HDSD
  └─ Lối đi / Luống đi (Aisle)  ← thuộc Phòng
       └─ Dãy kệ (Rack)         ← thuộc Phòng + gắn Lối đi
            └─ Vị trí bin         ← thuộc Phòng + Tầng + Lối đi + Dãy kệ
Thiết bị chứa hàng (Tote/Pallet…) ← đăng ký riêng, dùng khi luân chuyển / picking
```

> **Lưu ý triển khai:** Room / Aisle / Rack / Bin có quan hệ cha–con rõ. Level (tầng) theo HDSD tạo độc lập rồi được chọn khi tạo Bin. Không cho tạo Bin nếu thiếu Room / Level / Aisle / Rack tương ứng.

---

## 2. Mô hình thực thể (logic data)

| Entity | Key fields | Unique | Parent |
|--------|------------|--------|--------|
| **Room** (Phòng) | `code` ≤ 5 ký tự, `pickPriority` (int ≥ 1) | `warehouseId + code` | Warehouse |
| **Level** (Tầng) | `code` ≤ 3 ký tự, `pickPriority` | `warehouseId + code` | Warehouse |
| **Aisle** (Lối/Luống đi) | `code` ≤ 10, `roomId`, `pickPriority` | `warehouseId + roomId + code` | Room |
| **Rack** (Dãy kệ) | `code` ≤ 10, `roomId`, `aisleId`, `pickPriority` | `warehouseId + roomId + code` | Room + Aisle |
| **Bin** (Vị trí lưu kho) | `code` ≤ 15, `roomId`, `levelId`, `aisleId`, `rackId`, `pickPriority`, `maxSku`, `nonPickable`, `fastMoving`, `sizeCm` | `warehouseId + code` | Room+Level+Aisle+Rack |
| **Container** (Thiết bị chứa) | `type` (tote/pallet…), `code` (manual hoặc auto), `qty` (khi auto) | `warehouseId + code` | Warehouse |

### Quy tắc Độ ưu tiên (pick priority) — dùng chung mọi cấp

- Kiểu: **số nguyên dương**.
- **Số càng nhỏ = ưu tiên càng cao** (`1` cao nhất, rồi `2`, `3`…).
- Dùng khi hệ thống **chỉ định vị trí lấy hàng (picking allocation)**.
- Ví dụ Room: P1 priority=1, P2 priority=2 → lấy hết P1 rồi mới P2.

---

## 3. Logic từng bước thiết lập

### 3.1. Phòng lưu trữ (Room)

**Menu:** Thiết lập → Quản lý vị trí → **+ Phòng**

| Field | Bắt buộc | Rule |
|-------|----------|------|
| Mã phòng | Có | Max 5 ký tự; unique trong kho |
| Độ ưu tiên | Có | Int ≥ 1; nhỏ hơn = ưu tiên picking cao hơn |

**Hành động:** Lưu → Room active, dùng được cho Aisle/Rack/Bin.

---

### 3.2. Tầng của kệ (Level)

**Menu:** Thiết lập → Quản lý vị trí → **+ Tầng**

| Field | Bắt buộc | Rule |
|-------|----------|------|
| Mã tầng | Có | Max 3 ký tự (VD: `A` = trệt, `B` = tầng 2) |
| Độ ưu tiên | Có | Thường tầng thấp (trệt) = priority nhỏ hơn để lấy trước |

**Logic picking:** Ưu tiên tầng có priority thấp hơn trước (VD A=1 rồi B=2).

---

### 3.3. Lối đi / Luống đi (Aisle)

**Định nghĩa:** Đường đi giữa các dãy kệ; phục vụ **put-away** và **picking**.

**Menu:** Quản lý vị trí → tab **Danh sách luống đi**

#### A) Thủ công — `+ Luống`

| Field | Bắt buộc | Rule |
|-------|----------|------|
| Mã phòng | Có | Phải tồn tại |
| Mã luống đi | Có | Max 10 ký tự |
| Độ ưu tiên | Có | Chỉ định thứ tự đi lấy theo lối |

#### B) Import Excel — `+ Nhiều Luống Đi`

1. Tải template (sheet **Mô tả** giải thích cột).  
2. Upload.  
3. Hệ thống validate từng dòng → trả **thành công / thất bại + lý do**.  
4. Chỉ commit dòng hợp lệ (hoặc fail-all — cần chốt khi implement; HDSD mô tả hiển thị kết quả từng bản ghi).

---

### 3.4. Dãy kệ (Rack)

**Menu:** Quản lý vị trí → tab **Danh sách kệ**

#### A) Thủ công — `+ Dãy Kệ`

| Field | Bắt buộc | Rule |
|-------|----------|------|
| Mã phòng | Có | Room tồn tại |
| Mã giá (kệ) | Có | Max 10 ký tự |
| Mã lối đi | Có | Aisle thuộc cùng Room |
| Độ ưu tiên | Có | Thứ tự ưu tiên giữa các kệ |

#### Logic ưu tiên khi 2 kệ cùng / khác lối đi

1. **Cùng một lối đi:** so sánh `rack.pickPriority` → kệ priority nhỏ hơn lấy trước.  
   VD: Kệ A=1, Kệ B=2 cùng aisle → lấy A hết rồi mới B.
2. **Khác lối đi:** hệ thống ưu tiên theo **độ ưu tiên của lối đi** trước (aisle priority), rồi mới xét trong lối đó.

#### B) Import Excel — `+ Nhiều Dãy Kệ`  
Cùng pattern template → upload → báo cáo success/fail từng dòng.

---

### 3.5. Vị trí lưu kho (Bin) — entity lõi

**Menu:** Quản lý vị trí → tab **Danh sách vị trí lưu kho**

#### A) Thủ công — `+ Vị trí`

| Field | Bắt buộc | Rule / ý nghĩa |
|-------|----------|----------------|
| Mã vị trí | Có | Max **15** ký tự; unique trong kho |
| Mã phòng | Có | FK Room |
| Mã tầng | Có | FK Level |
| Mã luống đi | Có | FK Aisle (cùng room) |
| Mã dãy kệ | Có | FK Rack (cùng room + aisle khuyến nghị) |
| Độ ưu tiên | Có | Thứ tự lấy hàng **trong/giữa** các bin |
| Số SKU tối đa | Khuyến nghị | HDSD: **tối ưu ≈ 7 SKU / bin** (soft limit hoặc hard — chốt product) |
| Không thể lấy hàng | Optional | `nonPickable=true` → **chỉ lưu trữ**, **không** allocate cho đơn xuất |
| Vị trí Fast Moving | Optional | `fastMoving=true` → **ưu tiên lấy trước** trong luồng picking |
| Kích thước (cm) | Optional | Dài/rộng/cao → tính **thể tích / CBM trống** cho put-away |

**Định dạng mã vị trí (convention HDSD):**

```text
R1.A1.B.03
│  │  │  └── số bin trên kệ
│  │  └───── mã tầng (B = tầng 2)
│  └──────── mã dãy kệ
└─────────── mã phòng
```

Hệ thống **không bắt buộc** auto-generate theo pattern này khi nhập thủ công, nhưng nên:

- Validate format (optional), hoặc  
- Cung cấp **gợi ý generate** từ Room + Rack + Level + sequence.

#### B) Import Excel — `+ Nhiều Vị trí`

- Template + sheet Mô tả.  
- Upload → kết quả từng dòng success/fail.  
- **Sau khi tạo thành công:** in tem mã vị trí và **dán lên vị trí vật lý** trong kho (đồng bộ WMS ↔ hiện trường).

---

### 3.6. Logic “Độ ưu tiên vị trí” & lộ trình picker (quan trọng)

Khi nhiều bin cần lấy trên 2 dãy kệ **cùng độ ưu tiên dãy**, thứ tự đi được **định hình bằng `bin.pickPriority` (index)**.

Giả sử 2 dãy A01, A02; mỗi dãy 1 tầng A; 6 bin `A.01`→`A.06`; ô cần pick là các vị trí có hàng.

#### Case 1 — Lối thông 2 phía

- Cả 2 dãy: set index bin `1 → 6` theo chiều từ đầu lối.  
- Picker đi theo thứ tự index tăng dần (VD cần lấy index 2, 3, 5) rồi ra trạm đóng gói.

#### Case 2 — Có góc chết cuối lối → đi chữ **U**

- Dãy A01: index `1 → 6`  
- Dãy A02: index `6 → 12` (đảo chiều + tiếp nối)  
- Picker đi vào một phía, quét U, ra ngoài (VD lấy 2 → 5 → 10).

#### Case 3 — Zigzag từ trong ra ngoài

- A01: `1 → 6`  
- A02: `6 → 1` (đảo)  
- Thứ tự pick theo index toàn cục phù hợp lộ trình zigzag (VD 2 → 4 → 5).

**Rule hệ thống khi build pick path:**

1. Lọc bin **có tồn khả dụng**, `nonPickable = false`.  
2. Ưu tiên `fastMoving = true` (nếu cùng điều kiện khác).  
3. Sort đa cấp gợi ý:

```text
Room.priority ASC
→ Aisle.priority ASC
→ Rack.priority ASC
→ Level.priority ASC
→ Bin.priority ASC
(+ FastMoving trước nếu cùng nhóm)
```

4. Nếu 2 rack khác aisle → **Aisle.priority thắng** trước khi so Rack (theo HDSD mục Dãy kệ).

---

### 3.7. Thiết bị chứa hàng (Tote / Pallet…)

**Menu riêng:** Thiết lập → **Quản lý thiết bị chứa hàng** (không nằm trong tab vị trí bin).

#### A) Thêm thủ công

| Field | Rule |
|-------|------|
| Loại dụng cụ | tote, pallet, … |
| Chế độ **Thủ công** | User tự nhập từng mã thiết bị |
| Chế độ **Auto** | User nhập **số lượng**; hệ thống **sinh mã ngẫu nhiên** hàng loạt |

#### B) Import Excel

- `Import Thiết Bị Chứa Hàng` → template → upload → success/fail từng dòng.

**Vai trò vận hành (liên quan vị trí):** đích put/pick có thể là **bin hoặc tote**; có thể luân chuyển bin → tote → bin khác.

---

## 4. Validation & ràng buộc (đề xuất implement)

| # | Rule | Severity |
|---|------|----------|
| 1 | Không tạo Aisle/Rack/Bin nếu Room chưa tồn tại | Error |
| 2 | Rack.aisle phải thuộc cùng Room với Rack.room | Error |
| 3 | Bin: aisle & rack cùng room; rack thuộc aisle đã chọn | Error |
| 4 | Trùng `code` trong cùng warehouse | Error |
| 5 | Độ dài mã vượt max (5/3/10/10/15) | Error |
| 6 | `pickPriority` null hoặc &lt; 1 | Error |
| 7 | Bin `maxSku` vượt khi put-away thêm SKU mới | Warning hoặc Error (config) |
| 8 | Allocate pick vào bin `nonPickable` | Forbidden |
| 9 | Import: báo rõ dòng lỗi, không im lặng bỏ qua | Required UX |
| 10 | Xóa Room/Aisle/Rack khi còn Bin con hoặc còn tồn | Forbidden / cascade có kiểm soát |

---

## 5. API / use-case checklist (cho task dev)

**Master data CRUD**

- [ ] CRUD Room, Level, Aisle, Rack, Bin theo warehouse context  
- [ ] Import bulk Aisle / Rack / Bin / Container + download template  
- [ ] Print barcode/QR mã bin sau khi tạo  

**Allocation / picking (consume priority)**

- [ ] Service chọn bin xuất theo sort priority đa cấp + fastMoving + nonPickable  
- [ ] Put-away gợi ý bin theo thể tích còn trống (size cm / CBM) và max SKU  

**UI tabs (Quản lý vị trí)**

- [ ] Phòng / Tầng (hoặc section riêng)  
- [ ] Danh sách luống đi  
- [ ] Danh sách kệ  
- [ ] Danh sách vị trí lưu kho  
- [ ] Màn Thiết bị chứa hàng riêng  

---

## 6. Tóm tắt 1 câu cho Product/Dev

> **Thiết lập vị trí chứa hàng** là pipeline cấu hình không gian kho từ **Room → Level → Aisle → Rack → Bin** (kèm **Container**), mọi cấp gắn **độ ưu tiên picking (số nhỏ = ưu tiên cao)**; Bin có thêm cờ **không lấy hàng**, **fast moving**, **max SKU**, **kích thước**; thứ tự đi lấy hàng trên hiện trường được “vẽ” chủ yếu bằng **bin.pickPriority** (thông / chữ U / zigzag), và hệ thống allocate tuân theo ưu tiên Room → Aisle → Rack → Level → Bin.
