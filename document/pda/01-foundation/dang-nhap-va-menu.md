# PDA — Đăng nhập & Menu

> Phase 1 · Foundation

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Module | PDA / Foundation |
| Route app | `/pda` (home), `/pda/login` |
| Actor | Mọi nhân viên kho |
| API prefix | `/api/pda/auth`, `/api/pda/session` |

## 2. Mục tiêu

- Xác thực operator trên thiết bị PDA.
- Chọn **kho làm việc** và **ca** (shift) trước khi vào menu.
- Hiển thị menu module theo **role PDA** (Receiver, Picker, Packer, Handover, Supervisor).

## 3. Luồng màn hình

```
Login → Chọn kho → (Chọn ca) → Home menu → Module
                ↘ Phiên đang mở? → Resume hoặc Abandon
```

### 3.1. Đăng nhập

1. Nhập username + password (hoặc scan badge nhân viên nếu có).
2. API trả JWT + `permissionKeys` + danh sách kho được phép.
3. Lưu token local; redirect chọn kho.

### 3.2. Chọn kho / ca

1. Dropdown kho (chỉ kho user có quyền `pda.session.warehouse`).
2. Ca: `morning` | `afternoon` | `night` (optional Phase 1).
3. `POST /api/pda/session/start` → `sessionId`, `warehouseCode`.

### 3.3. Home menu

- Grid icon theo domain: Inbound, Outbound, Shipping, Inventory, More.
- Ẩn module không có permission (vd. Picker không thấy Receiving).
- Badge số phiên đang mở (pick/pack/receive).

## 4. Quy tắc scan (Foundation)

| Scan | Hành vi |
|---|---|
| Employee badge | Login shortcut (Phase 2) |
| Warehouse barcode | Quick-select kho nếu user có 1 kho |

## 5. API

| Method | Path | Mô tả |
|---|---|---|
| POST | `/api/pda/auth/login` | Login |
| POST | `/api/pda/auth/logout` | Logout |
| GET | `/api/pda/auth/me` | Profile + permissions |
| POST | `/api/pda/session/start` | Bắt đầu ca/kho |
| GET | `/api/pda/session/active` | Phiên PDA đang mở (receive/pick/pack) |

## 6. Phân quyền

| Key | Mô tả |
|---|---|
| `pda.auth.login` | Đăng nhập PDA |
| `pda.session.warehouse` | Chọn kho |
| `pda.menu.inbound` | Nhóm Inbound |
| `pda.menu.outbound` | Nhóm Outbound |
| `pda.menu.shipping` | Nhóm Shipping |
| `pda.menu.inventory` | Nhóm Inventory |

## 7. Tiêu chí nghiệm thu

1. User Picker chỉ thấy Picking (+ Inquiry nếu có quyền).
2. Đổi kho → reset context scan.
3. Token hết hạn → về login, không mất phiên server-side đang mở (resume được).
