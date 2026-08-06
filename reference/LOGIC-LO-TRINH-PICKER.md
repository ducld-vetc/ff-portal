# Nghiệp vụ chi tiết: LỘ TRÌNH PICKER (Pick Path)

> **UI vận hành:** Phân công lấy hàng → chi tiết wave  
> **UI cấu hình:** Kho → Thiết lập vị trí (**Zone → Thiết bị → Ô kệ** + priority)  
> Code: `buildPickerPathForWave()` · `PickupWaveDetailPage.tsx`  
> Layout: [`LOGIC-THIET-LAP-VI-TRI-CHUA-HANG.md`](./LOGIC-THIET-LAP-VI-TRI-CHUA-HANG.md)

---

## 0. Phân tách trách nhiệm

| Layer | Nơi | Chứa gì |
|-------|-----|---------|
| **Layout kho** | Kho → Vị trí | Zone, Thiết bị, Ô kệ + độ ưu tiên |
| **Lộ trình picker** | Wave lấy hàng | Thứ tự ô kệ **của từng yêu cầu** |

```text
Cấu hình priority (Kho)  +  Allocate ô kệ theo SKU (wave)  →  Sort  →  Lộ trình wave
```

## 1. Lộ trình picker là gì?

Thứ tự các **ô kệ** picker phải đi khi thực hiện **một wave**. Hệ thống suy ra thứ tự từ độ ưu tiên:

`Zone → Thiết bị → Ô kệ` (+ Fast Moving / Không lấy hàng)

## 2. Đầu vào

| Input | Mô tả |
|-------|--------|
| Dòng pick wave | SKU + SL + `binCode` đã allocate |
| Master vị trí | Zone, Device, Bin + `pickPriority` |
| Cờ ô kệ | `nonPickable`, `fastMoving` |

Loại: `nonPickable`, không còn tồn, ô không tồn tại trên layout.

## 3. Sort chuẩn

```text
1. Zone.pickPriority     ASC
2. Device.pickPriority   ASC
3. Bin.fastMoving        DESC  (true trước)
4. Bin.pickPriority      ASC
```

**Vẽ đường trên thiết bị** chủ yếu bằng `Bin.pickPriority` (đi thẳng / chữ U / zigzag giữa hai thiết bị cùng zone).

### Ví dụ chữ U (seed demo WH-HCM-01)

| Thiết bị | Ô vật lý | pickPriority |
|----------|----------|--------------|
| KE01 | .01 → .06 | 1 → 6 |
| KE02 | .06 → .01 | 7 → 12 |

Wave 01 allocate `Z1.KE01.02`, `Z1.KE01.05`, `Z1.KE02.03` → thứ tự bước theo priority 2 → 5 → 10.

## 4. Nơi xem UI

**Phân công lấy hàng** → mở wave → bảng “Lộ trình picker của wave này”.  
Không cấu hình lộ trình trong màn Kho.
