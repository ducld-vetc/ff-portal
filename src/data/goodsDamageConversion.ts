/** Tổng hợp hàng hóa hư hỏng / chuyển đổi — demo cổng Khách hàng */

export type GoodsEventKind = 'damaged' | 'converted'

export type GoodsDamageConversionRow = {
  id: string
  date: string
  warehouseCode: string
  warehouseName: string
  kind: GoodsEventKind
  sku: string
  partnerSku?: string
  productName: string
  fromCondition: 'new' | 'used' | 'damaged'
  toCondition: 'new' | 'used' | 'damaged'
  qty: number
  unit: string
  reason: string
  relatedDoc?: string
  locationCode?: string
  note?: string
  customerId: string
}

export const goodsEventKindLabel: Record<GoodsEventKind, string> = {
  damaged: 'Hư hỏng',
  converted: 'Chuyển đổi',
}

export const goodsConditionLabel: Record<GoodsDamageConversionRow['fromCondition'], string> = {
  new: 'Mới',
  used: 'Đã qua sử dụng',
  damaged: 'Hư hỏng',
}

export const seedGoodsDamageConversion: GoodsDamageConversionRow[] = [
  {
    id: 'gdc-1',
    date: '2026-07-20',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    kind: 'damaged',
    sku: 'SKU-CHARGER-20W',
    partnerSku: 'EVC-CHG-20',
    productName: 'Sạc nhanh 20W USB-C',
    fromCondition: 'new',
    toCondition: 'damaged',
    qty: 3,
    unit: 'Cái',
    reason: 'Vỡ vỏ khi đóng gói',
    relatedDoc: 'ISS-2201',
    locationCode: 'Z1.KE01.02',
    customerId: '1',
  },
  {
    id: 'gdc-2',
    date: '2026-07-19',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    kind: 'converted',
    sku: 'SKU-PHONE-X1',
    partnerSku: 'EVC-PH-X1',
    productName: 'Điện thoại demo X1',
    fromCondition: 'new',
    toCondition: 'used',
    qty: 1,
    unit: 'Cái',
    reason: 'Đổi tình trạng sau kiểm tra chất lượng',
    relatedDoc: 'ADJ-DEC-118',
    locationCode: 'Z1.KE01.04',
    customerId: '1',
  },
  {
    id: 'gdc-3',
    date: '2026-07-18',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'Kho Hà Nội Đông Anh',
    kind: 'damaged',
    sku: 'SKU-SERUM-30ML',
    partnerSku: 'EVC-SR-30',
    productName: 'Serum dưỡng ẩm 30ml',
    fromCondition: 'new',
    toCondition: 'damaged',
    qty: 6,
    unit: 'Chai',
    reason: 'Rò rỉ / chai móp',
    relatedDoc: 'ISS-2190',
    locationCode: 'Z1.KE02.03',
    customerId: '1',
  },
  {
    id: 'gdc-4',
    date: '2026-07-17',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    kind: 'converted',
    sku: 'SKU-CABLE-C-C-1M',
    partnerSku: 'EVC-CB-1M',
    productName: 'Cáp USB-C to C 1m',
    fromCondition: 'damaged',
    toCondition: 'used',
    qty: 4,
    unit: 'Cái',
    reason: 'Phân loại lại sau khi sửa chữa nhẹ',
    relatedDoc: 'ADJ-INC-092',
    note: 'Chuyển sang kênh thanh lý',
    customerId: '1',
  },
  {
    id: 'gdc-5',
    date: '2026-07-15',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    kind: 'damaged',
    sku: 'SKU-CHARGER-20W',
    partnerSku: 'EVC-CHG-20',
    productName: 'Sạc nhanh 20W USB-C',
    fromCondition: 'new',
    toCondition: 'damaged',
    qty: 2,
    unit: 'Cái',
    reason: 'Hư do vận chuyển nội bộ',
    relatedDoc: 'ISS-2177',
    locationCode: 'Z1.KE01.05',
    customerId: '1',
  },
  {
    id: 'gdc-6',
    date: '2026-07-14',
    warehouseCode: 'WH-DN-01',
    warehouseName: 'Kho Đà Nẵng',
    kind: 'converted',
    sku: 'SKU-SERUM-30ML',
    partnerSku: 'EVC-SR-30',
    productName: 'Serum dưỡng ẩm 30ml',
    fromCondition: 'new',
    toCondition: 'used',
    qty: 10,
    unit: 'Chai',
    reason: 'Chuyển lot demo / dùng thử',
    relatedDoc: 'ADJ-CVT-044',
    customerId: '1',
  },
  {
    id: 'gdc-7',
    date: '2026-07-10',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'Kho HCM Quận 7',
    kind: 'damaged',
    sku: 'SKU-CABLE-C-C-1M',
    partnerSku: 'EVC-CB-1M',
    productName: 'Cáp USB-C to C 1m',
    fromCondition: 'new',
    toCondition: 'damaged',
    qty: 5,
    unit: 'Cái',
    reason: 'Đứt đầu nối khi picking',
    relatedDoc: 'ISS-2150',
    locationCode: 'Z1.KE02.06',
    customerId: '1',
  },
]
