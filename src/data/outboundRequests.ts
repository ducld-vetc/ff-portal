import { seedCatalogProducts } from './productCatalog'

export type OutboundStatus = 'new' | 'picking' | 'packed' | 'shipped' | 'cancelled'
export type DeliveryMethod = 'pickup' | 'delivery'
export type OutboundPriority = 'normal' | 'high' | 'urgent'
export type GoodsCondition = 'new' | 'used' | 'damaged'

export type OutboundLine = {
  id: string
  productId: string
  name: string
  sku: string
  partnerSku?: string
  imageUrl?: string
  goodsCondition: GoodsCondition
  qty: number
  availableQty: number
  assignedQty: number
  unitPrice: number
  discount: number
  note?: string
}

export type OutboundRequest = {
  id: string
  code: string
  partnerOrCode: string
  internalCode?: string
  warehouseCode: string
  warehouseName: string
  deliveryMethod: DeliveryMethod
  shippingPackage: string
  status: OutboundStatus
  isB2b: boolean
  buyerName: string
  buyerPhone: string
  buyerEmail?: string
  note?: string
  province: string
  district: string
  ward: string
  address: string
  priority: OutboundPriority
  referenceCode?: string
  expectedDeliveryAt?: string | null
  requireDocuments: boolean
  noPacking: boolean
  packingNote?: string
  driver?: string
  vehicleNo?: string
  containerNo?: string
  channel?: string
  storeName?: string
  occurredAt?: string | null
  slaChannel?: string
  paidAmount: number
  cod: number
  declaredValue: number
  createdAt: string
  lines: OutboundLine[]
}

export const outboundStatusLabel: Record<OutboundStatus, string> = {
  new: 'Mới',
  picking: 'Đang lấy hàng',
  packed: 'Đã đóng gói',
  shipped: 'Đã bàn giao',
  cancelled: 'Đã hủy',
}

export const outboundStatusColor: Record<OutboundStatus, string> = {
  new: 'green',
  picking: 'processing',
  packed: 'blue',
  shipped: 'cyan',
  cancelled: 'default',
}

export const deliveryMethodLabel: Record<DeliveryMethod, string> = {
  pickup: 'Lấy hàng tại kho',
  delivery: 'Giao hàng tận nơi',
}

export const outboundPriorityLabel: Record<OutboundPriority, string> = {
  normal: 'Bình thường',
  high: 'Cao',
  urgent: 'Khẩn cấp',
}

export const goodsConditionLabel: Record<GoodsCondition, string> = {
  new: 'Mới',
  used: 'Đã qua sử dụng',
  damaged: 'Hư hỏng',
}

export const outboundWarehouseOptions = [
  { value: 'KQ2', label: 'KQ2 - Kho Cảng Quận 2' },
  { value: 'WH-HCM-01', label: 'WH-HCM-01 · Kho HCM Quận 7' },
  { value: 'WH-HN-01', label: 'WH-HN-01 · Kho Hà Nội Đông Anh' },
  { value: 'WH-DN-01', label: 'WH-DN-01 · Kho Đà Nẵng' },
]

export const shippingPackageOptions = [
  { value: 'Standard', label: 'Standard' },
  { value: 'GHN Express', label: 'GHN Express' },
  { value: 'GHTK Standard', label: 'GHTK Standard' },
  { value: 'JT Express', label: 'JT Express' },
]

export const outboundSearchFields = [
  { value: 'partnerOrCode', label: 'Mã OR đối tác' },
  { value: 'code', label: 'Mã OR' },
  { value: 'internalCode', label: 'Mã OR nội bộ' },
  { value: 'buyerName', label: 'Người mua' },
  { value: 'warehouseName', label: 'Kho xuất' },
  { value: 'storeName', label: 'Cửa hàng' },
] as const

export type OutboundSearchField = (typeof outboundSearchFields)[number]['value']

export const vnProvinces = [
  {
    value: 'HCM',
    label: 'TP. Hồ Chí Minh',
    districts: [
      {
        value: 'Q7',
        label: 'Quận 7',
        wards: [
          { value: 'PTT', label: 'Phường Tân Thuận Đông' },
          { value: 'PTPhao', label: 'Phường Tân Phú' },
        ],
      },
      {
        value: 'Q2',
        label: 'Quận 2 (TP. Thủ Đức)',
        wards: [
          { value: 'PTD', label: 'Phường Thảo Điền' },
          { value: 'PAT', label: 'Phường An Thạnh' },
        ],
      },
    ],
  },
  {
    value: 'HN',
    label: 'Hà Nội',
    districts: [
      {
        value: 'CG',
        label: 'Cầu Giấy',
        wards: [
          { value: 'PDL', label: 'Phường Dịch Vọng' },
          { value: 'PMG', label: 'Phường Mai Dịch' },
        ],
      },
    ],
  },
]

function availableFor(sku: string) {
  const map: Record<string, number> = {
    'SKU-CHARGER-20W': 47,
    'SKU-CABLE-C-C-1M': 120,
    'SKU-SERUM-30ML': 35,
    'SKU-PHONE-X1': 8,
  }
  return map[sku] ?? 50
}

const seedOutboundRequests: OutboundRequest[] = [
  {
    id: 'or-1',
    code: 'ORAZB6FB5XRW785',
    partnerOrCode: 'SHOPEE-99100',
    internalCode: 'OUT-INT-1001',
    warehouseCode: 'KQ2',
    warehouseName: 'KQ2 - Kho Cảng Quận 2',
    deliveryMethod: 'pickup',
    shippingPackage: 'Standard',
    status: 'new',
    isB2b: false,
    buyerName: 'Nguyễn Văn A',
    buyerPhone: '0901234567',
    buyerEmail: 'a@example.com',
    note: '',
    province: 'HCM',
    district: 'Q7',
    ward: 'PTT',
    address: '12 Nguyễn Văn Linh',
    priority: 'normal',
    referenceCode: 'REF-001',
    expectedDeliveryAt: '2026-07-22',
    requireDocuments: false,
    noPacking: false,
    packingNote: '',
    channel: 'Shopee',
    storeName: 'Giàn phơi thông minh AVOGROUP',
    occurredAt: '2026-07-20T18:20:00',
    slaChannel: '24h',
    paidAmount: 0,
    cod: 350000,
    declaredValue: 350000,
    createdAt: '2026-07-20T18:20:00',
    lines: [
      {
        id: 'orl-1',
        productId: 'cp-1',
        name: 'Sạc nhanh 20W USB-C',
        sku: 'SKU-CHARGER-20W',
        partnerSku: 'EVC-CHG-20',
        imageUrl: seedCatalogProducts[0]?.imageUrl,
        goodsCondition: 'new',
        qty: 2,
        availableQty: availableFor('SKU-CHARGER-20W'),
        assignedQty: 0,
        unitPrice: 175000,
        discount: 0,
      },
    ],
  },
  {
    id: 'or-2',
    code: 'ORHCMQ7B2201',
    partnerOrCode: 'TT-1002',
    internalCode: 'OUT-INT-1002',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'WH-HCM-01 · Kho HCM Quận 7',
    deliveryMethod: 'delivery',
    shippingPackage: 'GHN Express',
    status: 'picking',
    isB2b: true,
    buyerName: 'Công ty ABC',
    buyerPhone: '0281234567',
    buyerEmail: 'ops@abc.vn',
    province: 'HCM',
    district: 'Q2',
    ward: 'PTD',
    address: '88 Xuân Thủy',
    priority: 'high',
    requireDocuments: true,
    noPacking: false,
    channel: 'TikTok',
    storeName: '3A Mall',
    occurredAt: '2026-07-20T11:05:00',
    slaChannel: '48h',
    paidAmount: 100000,
    cod: 0,
    declaredValue: 450000,
    createdAt: '2026-07-20T11:05:00',
    lines: [
      {
        id: 'orl-2',
        productId: 'cp-2',
        name: 'Cáp USB-C to C 1m',
        sku: 'SKU-CABLE-C-C-1M',
        partnerSku: 'EVC-CABLE-01',
        imageUrl: seedCatalogProducts[1]?.imageUrl,
        goodsCondition: 'new',
        qty: 5,
        availableQty: availableFor('SKU-CABLE-C-C-1M'),
        assignedQty: 5,
        unitPrice: 90000,
        discount: 5000,
      },
    ],
  },
  {
    id: 'or-3',
    code: 'ORHN01C8830',
    partnerOrCode: 'MANUAL-77',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'WH-HN-01 · Kho Hà Nội Đông Anh',
    deliveryMethod: 'delivery',
    shippingPackage: 'GHTK Standard',
    status: 'shipped',
    isB2b: false,
    buyerName: 'Trần Thị B',
    buyerPhone: '0912345678',
    province: 'HN',
    district: 'CG',
    ward: 'PDL',
    address: '15 Duy Tân',
    priority: 'normal',
    requireDocuments: false,
    noPacking: false,
    channel: 'Website',
    storeName: '—',
    occurredAt: '2026-07-18T09:00:00',
    slaChannel: '—',
    paidAmount: 200000,
    cod: 0,
    declaredValue: 200000,
    createdAt: '2026-07-18T09:00:00',
    lines: [
      {
        id: 'orl-3',
        productId: 'cp-3',
        name: 'Serum dưỡng ẩm 30ml',
        sku: 'SKU-SERUM-30ML',
        goodsCondition: 'new',
        qty: 1,
        availableQty: availableFor('SKU-SERUM-30ML'),
        assignedQty: 1,
        unitPrice: 200000,
        discount: 0,
      },
    ],
  },
]

let outboundStore: OutboundRequest[] = [...seedOutboundRequests]

export function listOutboundRequests() {
  return outboundStore
}

export function getOutboundRequest(idOrCode: string) {
  return outboundStore.find((item) => item.id === idOrCode || item.code === idOrCode)
}

export function upsertOutboundRequest(next: OutboundRequest) {
  const idx = outboundStore.findIndex((item) => item.id === next.id)
  if (idx >= 0) {
    outboundStore = [...outboundStore.slice(0, idx), next, ...outboundStore.slice(idx + 1)]
  } else {
    outboundStore = [next, ...outboundStore]
  }
  return next
}

export function generateOutboundCode() {
  const suffix = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `OR${suffix}${Math.floor(100 + Math.random() * 900)}`
}

export function lineAmount(line: OutboundLine) {
  return line.qty * Math.max(0, line.unitPrice - line.discount)
}

export function outboundTotals(lines: OutboundLine[], paidAmount = 0) {
  const total = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0)
  const totalDiscount = lines.reduce((sum, line) => sum + line.qty * line.discount, 0)
  const remaining = Math.max(0, total - totalDiscount - paidAmount)
  return { total, totalDiscount, paidAmount, remaining }
}

export function formatAddress(row: Pick<OutboundRequest, 'address' | 'ward' | 'district' | 'province'>) {
  const province = vnProvinces.find((p) => p.value === row.province)
  const district = province?.districts.find((d) => d.value === row.district)
  const ward = district?.wards.find((w) => w.value === row.ward)
  return [row.address, ward?.label, district?.label, province?.label].filter(Boolean).join(', ')
}

export function productAvailableQty(sku: string) {
  return availableFor(sku)
}
