export type StorageMode = 'manual' | 'auto'

export type StorageDevice = {
  id: string
  code: string
  name: string
  deviceType: string
  size: string
  locationType: string
  mode: StorageMode
  warehouseCode: string
  warehouseName: string
  createdBy: string
  createdAt: string
}

export const locationTypes = [
  { value: 'SHELF', label: 'Kệ (Shelf)' },
  { value: 'PALLET', label: 'Pallet' },
  { value: 'BIN', label: 'Bin / ngăn' },
  { value: 'FLOOR', label: 'Sàn (Floor)' },
  { value: 'CAGE', label: 'Lồng (Cage)' },
]

export const deviceTypes = [
  { value: 'RACK', label: 'Rack' },
  { value: 'SHELF_UNIT', label: 'Kệ đơn' },
  { value: 'PALLET_RACK', label: 'Pallet rack' },
  { value: 'BIN_CABINET', label: 'Tủ bin' },
  { value: 'CAGE', label: 'Lồng chứa' },
]

export const seedStorageDevices: StorageDevice[] = [
  {
    id: 'sd-1',
    code: 'RN019',
    name: 'Kệ A-01',
    deviceType: 'RACK',
    size: '120x80x200',
    locationType: 'SHELF',
    mode: 'manual',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    createdBy: 'admin',
    createdAt: '2026-06-12T09:20:00',
  },
  {
    id: 'sd-2',
    code: 'RON.065',
    name: 'Pallet Zone B',
    deviceType: 'PALLET_RACK',
    size: '110x110x150',
    locationType: 'PALLET',
    mode: 'auto',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    createdBy: 'hang.nguyen',
    createdAt: '2026-06-18T14:05:00',
  },
  {
    id: 'sd-3',
    code: 'BIN-012',
    name: 'Tủ bin C-12',
    deviceType: 'BIN_CABINET',
    size: '60x40x180',
    locationType: 'BIN',
    mode: 'manual',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'Kho Hà Nội Đông Anh',
    createdBy: 'admin',
    createdAt: '2026-07-01T10:40:00',
  },
  {
    id: 'sd-4',
    code: 'FL-003',
    name: 'Sàn chứa tạm',
    deviceType: 'SHELF_UNIT',
    size: '200x200x50',
    locationType: 'FLOOR',
    mode: 'manual',
    warehouseCode: 'WH-DN-01',
    warehouseName: 'Kho Đà Nẵng',
    createdBy: 'quan.le',
    createdAt: '2026-07-10T08:15:00',
  },
  {
    id: 'sd-5',
    code: 'CG-008',
    name: 'Lồng hàng hoàn',
    deviceType: 'CAGE',
    size: '100x80x160',
    locationType: 'CAGE',
    mode: 'auto',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'Kho Hà Nội Đông Anh',
    createdBy: 'khai.tran',
    createdAt: '2026-07-15T16:22:00',
  },
]

export function labelOf(
  options: { value: string; label: string }[],
  value: string,
) {
  return options.find((o) => o.value === value)?.label || value
}
