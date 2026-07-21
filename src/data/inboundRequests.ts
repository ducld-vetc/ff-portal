export type InboundStatus = 'new' | 'processing' | 'received' | 'cancelled'
export type GoodsCondition = 'new' | 'used' | 'damaged'
export type InboundType = 'inbound' | 'return' | 'transfer'

export type InboundLine = {
  id: string
  productId: string
  name: string
  partnerSku: string
  sku: string
  unit: string
  imageUrl?: string
  qty: number
  unitPrice: number
  /** Danh sách serial/IMEI theo số lượng (nếu có) */
  serials?: string[]
}

export function buildInboundSerials(sku: string, qty: number, existing?: string[]) {
  if (existing && existing.length > 0) {
    if (existing.length === qty) return existing
    if (existing.length > qty) return existing.slice(0, qty)
    const next = [...existing]
    for (let i = existing.length; i < qty; i += 1) {
      next.push(makeSerialCode(sku, i + 1))
    }
    return next
  }
  return Array.from({ length: qty }, (_, i) => makeSerialCode(sku, i + 1))
}

function makeSerialCode(sku: string, index: number) {
  const prefix = sku.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase() || 'SN'
  return `${prefix}-${String(index).padStart(4, '0')}`
}

export type InboundRequest = {
  id: string
  code: string
  partnerIrCode: string
  country: string
  warehouseCode: string
  warehouseName: string
  status: InboundStatus
  skuCount: number
  productQty: number
  receivedQty: number
  goodsCondition: GoodsCondition
  supplier: string
  type: InboundType
  expectedAt: string
  receivedAt: string | null
  createdAt: string
  expiredAt?: string | null
  referenceCode?: string
  driver?: string
  vehicleNo?: string
  containerNo?: string
  note?: string
  ownerName: string
  ownerPhone: string
  lines: InboundLine[]
}

export const inboundStatusLabel: Record<InboundStatus, string> = {
  new: 'Mới',
  processing: 'Đang xử lý',
  received: 'Đã nhận',
  cancelled: 'Đã hủy',
}

export const inboundStatusColor: Record<InboundStatus, string> = {
  new: 'blue',
  processing: 'processing',
  received: 'green',
  cancelled: 'default',
}

export const goodsConditionLabel: Record<GoodsCondition, string> = {
  new: 'Mới',
  used: 'Đã qua sử dụng',
  damaged: 'Hư hỏng',
}

export const goodsConditionColor: Record<GoodsCondition, string> = {
  new: 'green',
  used: 'gold',
  damaged: 'red',
}

export const inboundTypeLabel: Record<InboundType, string> = {
  inbound: 'Nhập kho',
  return: 'Nhập hoàn',
  transfer: 'Nhập điều chuyển',
}

export const inboundWarehouseOptions = [
  { value: 'KBL', label: 'KBL - Kho Bella Đà Lạt' },
  { value: 'WH-HCM-01', label: 'WH-HCM-01 · Kho HCM Quận 7' },
  { value: 'WH-HN-01', label: 'WH-HN-01 · Kho Hà Nội Đông Anh' },
  { value: 'WH-DN-01', label: 'WH-DN-01 · Kho Đà Nẵng' },
]

export const inboundSearchFields = [
  { value: 'partnerIrCode', label: 'Mã IR đối tác' },
  { value: 'code', label: 'Mã IR' },
  { value: 'supplier', label: 'Nhà cung cấp' },
  { value: 'warehouseName', label: 'Kho nhập' },
  { value: 'referenceCode', label: 'Mã tham chiếu' },
] as const

export type InboundSearchField = (typeof inboundSearchFields)[number]['value']

const seedInboundRequests: InboundRequest[] = [
  {
    id: 'ir-1',
    code: 'IRDDBQUB8864',
    partnerIrCode: '24725858',
    country: 'VN',
    warehouseCode: 'KBL',
    warehouseName: 'KBL - Kho Bella Đà Lạt',
    status: 'new',
    skuCount: 2,
    productQty: 200,
    receivedQty: 0,
    goodsCondition: 'new',
    supplier: 'SHEIN',
    type: 'inbound',
    expectedAt: '2024-01-29',
    receivedAt: null,
    createdAt: '2024-01-28T09:12:00',
    ownerName: 'Bella Nguyễn',
    ownerPhone: '0909092212',
    referenceCode: 'PO-SHEIN-2401',
    lines: [
      {
        id: 'irl-1',
        productId: 'demo-1',
        name: 'SHEIN MOD Chất rắn Vòng cổ Viên lắp lánh Đầm Black',
        partnerSku: 'SMCRD-B',
        sku: '2304101',
        unit: 'PCS',
        qty: 100,
        unitPrice: 0,
      },
      {
        id: 'irl-2',
        productId: 'demo-2',
        name: 'SHEIN Đầm maxi in hoa',
        partnerSku: 'SMFLW-M',
        sku: '2304102',
        unit: 'PCS',
        qty: 100,
        unitPrice: 0,
      },
    ],
  },
  {
    id: 'ir-2',
    code: 'IRHCMQ7A1021',
    partnerIrCode: 'EC-IR-8891',
    country: 'VN',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'WH-HCM-01 · Kho HCM Quận 7',
    status: 'processing',
    skuCount: 3,
    productQty: 85,
    receivedQty: 40,
    goodsCondition: 'new',
    supplier: 'EverCharge Supplier',
    type: 'inbound',
    expectedAt: '2026-07-18',
    receivedAt: null,
    createdAt: '2026-07-16T10:00:00',
    ownerName: 'Bella Nguyễn',
    ownerPhone: '0909092212',
    lines: [
      {
        id: 'irl-3',
        productId: 'cp-1',
        name: 'Sạc nhanh 20W USB-C',
        partnerSku: 'EVC-CHG-20',
        sku: 'SKU-CHARGER-20W',
        unit: 'Cái',
        qty: 50,
        unitPrice: 85000,
      },
      {
        id: 'irl-4',
        productId: 'cp-2',
        name: 'Cáp USB-C to C 1m',
        partnerSku: 'EVC-CABLE-01',
        sku: 'SKU-CABLE-C-C-1M',
        unit: 'Cái',
        qty: 30,
        unitPrice: 45000,
      },
      {
        id: 'irl-5',
        productId: 'cp-3',
        name: 'Serum dưỡng ẩm 30ml',
        partnerSku: 'SERUM-30',
        sku: 'SKU-SERUM-30ML',
        unit: 'Cái',
        qty: 5,
        unitPrice: 120000,
      },
    ],
  },
  {
    id: 'ir-3',
    code: 'IRHN01B7740',
    partnerIrCode: 'RT-2026-04',
    country: 'VN',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'WH-HN-01 · Kho Hà Nội Đông Anh',
    status: 'received',
    skuCount: 1,
    productQty: 12,
    receivedQty: 12,
    goodsCondition: 'used',
    supplier: 'Khách trả hàng',
    type: 'return',
    expectedAt: '2026-07-10',
    receivedAt: '2026-07-11',
    createdAt: '2026-07-09T14:20:00',
    ownerName: 'Bella Nguyễn',
    ownerPhone: '0909092212',
    lines: [
      {
        id: 'irl-6',
        productId: 'cp-1',
        name: 'Sạc nhanh 20W USB-C',
        partnerSku: 'EVC-CHG-20',
        sku: 'SKU-CHARGER-20W',
        unit: 'Cái',
        qty: 12,
        unitPrice: 0,
      },
    ],
  },
]

let inboundStore: InboundRequest[] = [...seedInboundRequests]

export function listInboundRequests() {
  return inboundStore
}

export function getInboundRequest(idOrCode: string) {
  return inboundStore.find((item) => item.id === idOrCode || item.code === idOrCode)
}

export function upsertInboundRequest(next: InboundRequest) {
  const idx = inboundStore.findIndex((item) => item.id === next.id)
  if (idx >= 0) {
    inboundStore = [...inboundStore.slice(0, idx), next, ...inboundStore.slice(idx + 1)]
  } else {
    inboundStore = [next, ...inboundStore]
  }
  return next
}

export function generateInboundCode() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `IR${suffix}${Math.floor(1000 + Math.random() * 9000)}`
}
