/** Tổng hợp vật tư tiêu hao — dữ liệu demo cổng Khách hàng */

export type MaterialConsumptionRow = {
  id: string
  date: string
  warehouseCode: string
  warehouseName: string
  materialCode: string
  materialName: string
  materialType: string
  unit: string
  qtyUsed: number
  relatedDoc: string
  relatedType: 'outbound' | 'packing' | 'stocktake'
  note?: string
  customerId: string
}

export const materialTypeLabel: Record<string, string> = {
  CARTON: 'Thùng carton',
  BAG: 'Túi nilon',
  FILLER: 'Vật liệu chèn',
  LABEL: 'Nhãn / tem',
  OTHER: 'Khác',
}

export const relatedTypeLabel: Record<MaterialConsumptionRow['relatedType'], string> = {
  outbound: 'Xuất kho',
  packing: 'Đóng gói',
  stocktake: 'Kiểm kê',
}

export const seedMaterialConsumption: MaterialConsumptionRow[] = [
  {
    id: 'mc-1',
    date: '2026-07-20',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    materialCode: 'EVC-CARTON-S',
    materialName: 'Thùng carton S 20×15×12',
    materialType: 'CARTON',
    unit: 'Cái',
    qtyUsed: 48,
    relatedDoc: 'OR-1001',
    relatedType: 'packing',
    customerId: '1',
  },
  {
    id: 'mc-2',
    date: '2026-07-20',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    materialCode: 'EVC-BAG-M',
    materialName: 'Túi nilon M',
    materialType: 'BAG',
    unit: 'Cái',
    qtyUsed: 36,
    relatedDoc: 'OR-1002',
    relatedType: 'packing',
    customerId: '1',
  },
  {
    id: 'mc-3',
    date: '2026-07-19',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    materialCode: 'BW-10M',
    materialName: 'Xốp bóng khí 10m',
    materialType: 'FILLER',
    unit: 'Mét',
    qtyUsed: 22,
    relatedDoc: 'PK-20260719-08',
    relatedType: 'packing',
    note: 'Chèn hàng dễ vỡ',
    customerId: '1',
  },
  {
    id: 'mc-4',
    date: '2026-07-18',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'Kho Hà Nội Đông Anh',
    materialCode: 'EVC-LBL-A6',
    materialName: 'Nhãn vận đơn A6',
    materialType: 'LABEL',
    unit: 'Cái',
    qtyUsed: 120,
    relatedDoc: 'OR-2001',
    relatedType: 'outbound',
    customerId: '1',
  },
  {
    id: 'mc-5',
    date: '2026-07-17',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    materialCode: 'EVC-CARTON-M',
    materialName: 'Thùng carton M 30×20×15',
    materialType: 'CARTON',
    unit: 'Cái',
    qtyUsed: 15,
    relatedDoc: 'OR-2002',
    relatedType: 'packing',
    customerId: '1',
  },
  {
    id: 'mc-6',
    date: '2026-07-16',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    materialCode: 'EVC-CARTON-S',
    materialName: 'Thùng carton S 20×15×12',
    materialType: 'CARTON',
    unit: 'Cái',
    qtyUsed: 60,
    relatedDoc: 'WAVE-20260716-03',
    relatedType: 'packing',
    customerId: '1',
  },
  {
    id: 'mc-7',
    date: '2026-07-15',
    warehouseCode: 'WH-DN-01',
    warehouseName: 'Kho Đà Nẵng',
    materialCode: 'EVC-BAG-M',
    materialName: 'Túi nilon M',
    materialType: 'BAG',
    unit: 'Cái',
    qtyUsed: 18,
    relatedDoc: 'OR-DN-441',
    relatedType: 'outbound',
    customerId: '1',
  },
  {
    id: 'mc-8',
    date: '2026-07-12',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    materialCode: 'BW-10M',
    materialName: 'Xốp bóng khí 10m',
    materialType: 'FILLER',
    unit: 'Mét',
    qtyUsed: 8,
    relatedDoc: 'KK-20260712-01',
    relatedType: 'stocktake',
    note: 'Bù hao kiểm kê',
    customerId: '1',
  },
]
