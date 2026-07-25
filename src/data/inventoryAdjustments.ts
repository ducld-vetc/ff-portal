import { goodsConditionLabel, type GoodsCondition } from './inboundRequests'
import { seedCatalogProducts } from './productCatalog'

export type InventoryAdjustStatus = 'new' | 'confirmed' | 'cancelled'
export type InventoryAdjustDirection = 'increase' | 'decrease'

export type InventoryAdjustLine = {
  id: string
  productId: string
  name: string
  partnerSku: string
  sku: string
  unit: string
  imageUrl?: string
  lotCode?: string
  lotDate?: string | null
  qty: number
  goodsCondition?: GoodsCondition
  productKind?: string
}

export type InventoryAdjustment = {
  id: string
  code: string
  partnerName: string
  direction: InventoryAdjustDirection
  skuCount: number
  itemCount: number
  status: InventoryAdjustStatus
  createdAt: string
  createdBy: string
  confirmedAt?: string | null
  confirmedBy?: string | null
  note?: string
  lines: InventoryAdjustLine[]
}

/** Tồn khả dụng để chọn khi giảm tồn */
export type InventoryStockRow = {
  id: string
  productId: string
  name: string
  partnerSku: string
  sku: string
  unit: string
  imageUrl?: string
  goodsCondition: GoodsCondition
  productKind: string
  lotCode: string
  lotDate: string | null
  stockQty: number
  locationStockQty: number
}

export const inventoryAdjustStatusLabel: Record<InventoryAdjustStatus, string> = {
  new: 'Mới',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
}

export const inventoryAdjustStatusColor: Record<InventoryAdjustStatus, string> = {
  new: 'blue',
  confirmed: 'success',
  cancelled: 'default',
}

export const inventoryPartnerOptions = [
  { value: 'GRS - GRS', label: 'GRS - GRS' },
  { value: 'KHAITN02 - CÔNG TY TNHH EVERCHARGE01', label: 'KHAITN02 - CÔNG TY TNHH EVERCHARGE01' },
  { value: 'CUS-002 - CÔNG TY TNHH GREENMART VIETNAM', label: 'CUS-002 - CÔNG TY TNHH GREENMART VIETNAM' },
  { value: 'HAC - CÔNG TY TNHH HAC RETAIL', label: 'HAC - CÔNG TY TNHH HAC RETAIL' },
  { value: 'AVI - CÔNG TY TNHH AVIATEK', label: 'AVI - CÔNG TY TNHH AVIATEK' },
]

let adjustments: InventoryAdjustment[] = [
  {
    id: 'ia-1',
    code: 'ADJ-260725-01',
    partnerName: 'KHAITN02 - CÔNG TY TNHH EVERCHARGE01',
    direction: 'decrease',
    skuCount: 1,
    itemCount: 2,
    status: 'new',
    createdAt: '2026-07-25T07:00:00',
    createdBy: 'Ops',
    confirmedAt: null,
    confirmedBy: null,
    note: 'Hư hỏng khi nhận',
    lines: [
      {
        id: 'ia-1-l1',
        productId: 'cp-1',
        name: 'Sạc nhanh 20W USB-C',
        partnerSku: 'EVC-CHG-20',
        sku: 'SKU-CHARGER-20W',
        unit: 'Cái',
        imageUrl: seedCatalogProducts.find((p) => p.id === 'cp-1')?.imageUrl,
        qty: 2,
        goodsCondition: 'damaged',
        lotCode: 'LOT-CHG-01',
        lotDate: '2027-01-01',
      },
    ],
  },
  {
    id: 'ia-2',
    code: 'ADJ-260724-08',
    partnerName: 'CUS-002 - CÔNG TY TNHH GREENMART VIETNAM',
    direction: 'increase',
    skuCount: 1,
    itemCount: 3,
    status: 'new',
    createdAt: '2026-07-24T18:30:00',
    createdBy: 'Ops',
    confirmedAt: null,
    confirmedBy: null,
    note: 'Tìm thấy sau kiểm kê',
    lines: [
      {
        id: 'ia-2-l1',
        productId: 'cp-3',
        name: 'Serum dưỡng ẩm 30ml',
        partnerSku: 'GM-SERUM-A',
        sku: 'SKU-SERUM-30ML',
        unit: 'Chai',
        imageUrl: seedCatalogProducts.find((p) => p.id === 'cp-3')?.imageUrl,
        qty: 3,
        lotCode: 'LOT-SR-08',
        lotDate: '2026-12-01',
      },
    ],
  },
]

export function listInventoryAdjustments() {
  return adjustments
}

export function getInventoryAdjustment(id: string) {
  return adjustments.find((r) => r.id === id || r.code === id)
}

export function upsertInventoryAdjustment(row: InventoryAdjustment) {
  const idx = adjustments.findIndex((r) => r.id === row.id)
  if (idx >= 0) {
    adjustments = [...adjustments.slice(0, idx), row, ...adjustments.slice(idx + 1)]
  } else {
    adjustments = [row, ...adjustments]
  }
  return row
}

export function generateAdjustCode(direction: InventoryAdjustDirection) {
  const prefix = direction === 'increase' ? 'ADJI' : 'ADJD'
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${stamp}-${rand}`
}

export function listInventoryStockRows(_partnerName?: string): InventoryStockRow[] {
  const conditions: GoodsCondition[] = ['new', 'used', 'damaged']

  return seedCatalogProducts.flatMap((p, productIndex) =>
    conditions.map((condition, conditionIndex) => {
      const stockQty = 12 + productIndex * 5 + conditionIndex * 2
      const locationStockQty = Math.max(0, stockQty - ((productIndex + conditionIndex) % 4))
      const lotSuffix = String(conditionIndex + 1).padStart(2, '0')
      return {
        id: `stk-${p.id}-${condition}`,
        productId: p.id,
        name: p.name,
        partnerSku: p.partnerSku || '',
        sku: p.sku,
        unit: p.units[0] || 'Cái',
        imageUrl: p.imageUrl,
        goodsCondition: condition,
        productKind: p.productKind === 'bundle' ? 'Bundle' : 'Hàng lẻ',
        lotCode:
          (p.manageByLot || conditionIndex > 0)
            ? `LOT-${p.sku.slice(-4).toUpperCase()}-${lotSuffix}`
            : '—',
        lotDate:
          (p.trackExpiry || conditionIndex > 0)
            ? `2026-${String(10 + conditionIndex).padStart(2, '0')}-15`
            : null,
        stockQty,
        locationStockQty,
      }
    }),
  )
}

export { goodsConditionLabel }
