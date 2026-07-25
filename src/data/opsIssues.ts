function productPlaceholder(label: string, color: string) {
  const safe = encodeURIComponent(label.slice(0, 8))
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="16" fill="${color}"/><text x="80" y="86" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="16" font-weight="700">${safe}</text></svg>`,
  )}`
}

export type OpsIssueStatus = 'new' | 'processing' | 'resolved' | 'cancelled'
export type OpsIssueType = 'lost' | 'damaged' | 'surplus' | 'wrong_label' | 'shortage'

export type OpsIssue = {
  id: string
  locationCode: string
  sku: string
  partnerSku: string
  productName: string
  imageUrl?: string
  type: OpsIssueType
  status: OpsIssueStatus
  unit: string
  qty: number
  foundQty: number
  goodsCondition: string
  lotCode?: string
  serialOrLabel?: string
  expiryDate?: string | null
  createdBy: string
  createdAt: string
}

export const opsIssueStatusLabel: Record<OpsIssueStatus, string> = {
  new: 'Mới',
  processing: 'Đang xử lý',
  resolved: 'Đã xử lý',
  cancelled: 'Đã hủy',
}

export const opsIssueTypeLabel: Record<OpsIssueType, string> = {
  lost: 'Mất hàng',
  damaged: 'Hư hỏng',
  surplus: 'Hàng thừa',
  wrong_label: 'Sai nhãn',
  shortage: 'Thiếu hàng khi lấy',
}

export const opsIssueStatusOptions = Object.entries(opsIssueStatusLabel).map(([value, label]) => ({
  value,
  label,
}))

export const opsIssueTypeOptions = Object.entries(opsIssueTypeLabel).map(([value, label]) => ({
  value,
  label,
}))

export const seedOpsIssues: OpsIssue[] = [
  {
    id: 'iss-1',
    locationCode: 'R1.B2.T2.007',
    sku: 'YOG-BLEND-XOAI',
    partnerSku: 'BLN-XOAI-90',
    productName: 'Sữa Chua nguội Blendina vị Xoài Đào',
    imageUrl: productPlaceholder('XOAI', '#f59e0b'),
    type: 'lost',
    status: 'new',
    unit: 'Vỉ',
    qty: 1,
    foundQty: 0,
    goodsCondition: 'Mới',
    lotCode: 'LOT-BLN-0726',
    serialOrLabel: '',
    expiryDate: '2026-09-21',
    createdBy: 'Cuong - Vương Quốc Cường',
    createdAt: '2026-07-21T17:22:00',
  },
  {
    id: 'iss-2',
    locationCode: 'R5.II.T1.001',
    sku: 'PIN15DK',
    partnerSku: 'EVC-PIN-15',
    productName: 'Pin tích điện Lithium-ion 18650 3.7V 3000mAh',
    imageUrl: productPlaceholder('PIN', '#2563eb'),
    type: 'lost',
    status: 'new',
    unit: 'Cái',
    qty: 5,
    foundQty: 0,
    goodsCondition: 'Mới',
    lotCode: 'LOT-PIN-061',
    serialOrLabel: '',
    expiryDate: null,
    createdBy: 'tuan - Ngô Minh Tuấn',
    createdAt: '2026-07-22T09:10:00',
  },
  {
    id: 'iss-3',
    locationCode: 'R2.A1.T3.012',
    sku: 'SKU-SERUM-30ML',
    partnerSku: 'GM-SERUM-A',
    productName: 'Serum dưỡng ẩm 30ml',
    imageUrl: productPlaceholder('SERUM', '#db2777'),
    type: 'damaged',
    status: 'new',
    unit: 'Chai',
    qty: 2,
    foundQty: 1,
    goodsCondition: 'Hư hỏng',
    lotCode: 'LOT-SR-08',
    serialOrLabel: '',
    expiryDate: '2026-12-01',
    createdBy: 'ops - Ops Warehouse',
    createdAt: '2026-07-23T11:05:00',
  },
  {
    id: 'iss-4',
    locationCode: 'R3.C2.T1.004',
    sku: 'SKU-CHARGER-20W',
    partnerSku: 'EVC-CHG-20',
    productName: 'Sạc nhanh 20W USB-C',
    imageUrl: productPlaceholder('CHG', '#0ea5e9'),
    type: 'wrong_label',
    status: 'processing',
    unit: 'Cái',
    qty: 3,
    foundQty: 3,
    goodsCondition: 'Mới',
    lotCode: '',
    serialOrLabel: 'SN-CHG-0001',
    expiryDate: null,
    createdBy: 'hang - Nguyễn Thị Hằng',
    createdAt: '2026-07-24T08:40:00',
  },
  {
    id: 'iss-5',
    locationCode: 'R4.A1.T1.002',
    sku: 'SKU-CABLE-C-C-1M',
    partnerSku: 'EVC-CABLE-01',
    productName: 'Cáp USB-C to C 1m',
    imageUrl: productPlaceholder('CABLE', '#16a34a'),
    type: 'shortage',
    status: 'new',
    unit: 'Cái',
    qty: 10,
    foundQty: 7,
    goodsCondition: 'Mới',
    lotCode: 'LOT-CB-03',
    serialOrLabel: '',
    expiryDate: null,
    createdBy: 'Cuong - Vương Quốc Cường',
    createdAt: '2026-07-24T15:18:00',
  },
  {
    id: 'iss-6',
    locationCode: 'R1.A3.T2.009',
    sku: 'FRUIT-TAO-XO',
    partnerSku: 'GRS-TAO-01',
    productName: 'Táo đỏ nhập khẩu hộp 1kg',
    imageUrl: productPlaceholder('TAO', '#dc2626'),
    type: 'surplus',
    status: 'new',
    unit: 'QUẢ',
    qty: 4,
    foundQty: 4,
    goodsCondition: 'Mới',
    lotCode: 'LOT-TAO-25',
    serialOrLabel: '',
    expiryDate: '2026-08-15',
    createdBy: 'ops - Ops Warehouse',
    createdAt: '2026-07-25T07:30:00',
  },
  {
    id: 'iss-7',
    locationCode: 'R6.B1.T4.001',
    sku: 'BUNDLE-GIFT-01',
    partnerSku: 'GM-GIFT-01',
    productName: 'Combo quà tặng mùa hè',
    imageUrl: productPlaceholder('GIFT', '#7c3aed'),
    type: 'lost',
    status: 'resolved',
    unit: 'Bộ',
    qty: 1,
    foundQty: 1,
    goodsCondition: 'Mới',
    lotCode: '',
    serialOrLabel: 'LBL-GIFT-778',
    expiryDate: '2027-01-01',
    createdBy: 'tuan - Ngô Minh Tuấn',
    createdAt: '2026-07-19T13:45:00',
  },
  {
    id: 'iss-8',
    locationCode: 'R2.B2.T1.015',
    sku: 'SKU-PHONE-X1',
    partnerSku: 'EVC-PHONE-X1',
    productName: 'Điện thoại demo X1',
    imageUrl: productPlaceholder('PHONE', '#334155'),
    type: 'damaged',
    status: 'new',
    unit: 'Cái',
    qty: 1,
    foundQty: 0,
    goodsCondition: 'Hư hỏng',
    lotCode: '',
    serialOrLabel: 'IMEI-8800112233',
    expiryDate: null,
    createdBy: 'Cuong - Vương Quốc Cường',
    createdAt: '2026-07-25T10:12:00',
  },
]

export function listOpsIssues() {
  return seedOpsIssues
}
