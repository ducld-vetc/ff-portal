# Logic nghiệp vụ: THIẾT LẬP VỊ TRÍ CHỨA HÀNG (3 cấp)

> Lộ trình picker theo wave: [`LOGIC-LO-TRINH-PICKER.md`](./LOGIC-LO-TRINH-PICKER.md)  
> Code: `src/data/warehouseLocations.ts` · UI: `WarehouseLocationsPage.tsx`

---

## 1. Mục đích

Sau khi **tạo kho**, cần thiết lập cấu trúc vị trí tối giản trước khi put-away / picking.

**Thứ tự bắt buộc:**

```
Zone (Khu vực)
  └─ Thiết bị (Kệ / thiết bị chứa hàng)
       └─ Ô kệ (Bin)
```

Không còn Room / Level / Aisle / Rack tách riêng.

---

## 2. Mô hình

| Entity | Key fields | Unique | Parent |
|--------|------------|--------|--------|
| **Zone** | `code` ≤ 10, `name?`, `pickPriority` ≥ 1 | `warehouseId + code` | Warehouse |
| **Thiết bị** | `code` ≤ 15, `zoneId`, `name?`, `pickPriority` | `warehouseId + zoneId + code` | Zone |
| **Ô kệ** | `code` ≤ 20, `zoneId`, `deviceId`, `pickPriority`, `maxSku`, `nonPickable`, `fastMoving`, size cm | `warehouseId + code` | Thiết bị |

**Gợi ý mã ô kệ:** `{Zone}.{Thiết bị}.{STT}` — VD `Z1.KE01.03`.

### Độ ưu tiên

- Số nguyên dương; **càng nhỏ = ưu tiên càng cao**.
- Sort picking: `Zone.pickPriority` → `Device.pickPriority` → `Bin.pickPriority` (+ FastMoving trước trong cùng nhóm).
- Ô `nonPickable` không đưa vào lộ trình.

---

## 3. Thiết lập từng cấp

### 3.1 Zone

| Field | Bắt buộc | Rule |
|-------|----------|------|
| Mã zone | Có | Max 10; unique trong kho |
| Tên | Không | Mô tả khu (picking, lưu trữ…) |
| Độ ưu tiên | Có | Int ≥ 1 |

### 3.2 Thiết bị

| Field | Bắt buộc | Rule |
|-------|----------|------|
| Zone | Có | Phải có zone trước |
| Mã thiết bị | Có | Unique trong cùng zone |
| Tên | Không | |
| Độ ưu tiên | Có | So sánh giữa các thiết bị cùng zone |

### 3.3 Ô kệ

| Field | Bắt buộc | Rule |
|-------|----------|------|
| Thiết bị | Có | Kéo theo `zoneId` từ thiết bị |
| Mã ô kệ | Có | Unique trong kho |
| Độ ưu tiên | Có | Vẽ thứ tự đi trên thiết bị (thẳng / chữ U / zigzag) |
| Max SKU | Có | |
| Không lấy hàng | Không | Loại khỏi picking |
| Fast moving | Không | Ưu tiên trong cùng nhóm sort |
| Dài/Rộng/Cao (cm) | Không | |

---

## 4. “Đủ cấu hình”

Kho sẵn sàng khi: `zones ≥ 1` **và** `devices ≥ 1` **và** `bins ≥ 1`.

---

## 5. Liên hệ picking

- Layout kho chỉ cung cấp **độ ưu tiên**.
- Wave lấy hàng allocate sẵn mã ô kệ → `buildPickerPathForWave()` sắp điểm dừng theo Zone → Thiết bị → Ô kệ.
- Xem màn **Phân công lấy hàng → chi tiết wave**.
