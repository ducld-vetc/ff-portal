import { seedCatalogProducts } from './productCatalog'
import { shippingPackageOptions } from './outboundRequests'

export type WaybillStatus = 'new' | 'ready' | 'handed_over' | 'in_transit' | 'delivered' | 'cancelled'

export type WaybillLine = {
  id: string
  productId: string
  name: string
  sku: string
  partnerSku?: string
  imageUrl?: string
  unitLabel?: string
  goodsCondition: 'new' | 'used' | 'damaged'
  qty: number
  unitPrice: number
}

export type Waybill = {
  id: string
  code: string
  partnerWaybillCode: string
  partnerCode: string
  pickupAddressCode: string
  contactName: string
  contactPhone: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  cod: number | null
  orderValue: number | null
  status: WaybillStatus
  createdAt: string
  internalCode?: string
  shippingPackage?: string
  weightKg: number
  note?: string
  declaredValue: number
  pickupPartner?: string
  pickupAddress?: string
  pickupPerson?: string
  pickupPhone?: string
  pickupEmail?: string
  deliveryPartner?: string
  deliveryAddress?: string
  deliveryPerson?: string
  deliveryPhone?: string
  deliveryEmail?: string
  lines: WaybillLine[]
}

export const waybillStatusLabel: Record<WaybillStatus, string> = {
  new: 'Mới',
  ready: 'Sẵn sàng lấy',
  handed_over: 'Đã bàn giao',
  in_transit: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

export const waybillStatusColor: Record<WaybillStatus, string> = {
  new: 'green',
  ready: 'blue',
  handed_over: 'cyan',
  in_transit: 'processing',
  delivered: 'success',
  cancelled: 'default',
}

export const waybillPartnerOptions = [
  { value: 'TGDD', label: 'TGDD · Thế Giới Di Động' },
  { value: 'AVO', label: 'AVO · AVOGROUP' },
  { value: 'EC', label: 'EC · EverCharge' },
  { value: 'KHACH', label: 'Khách lẻ / Cá nhân' },
]

export const pickupAddressOptions = [
  { value: 'CHM567028', label: 'CHM567028 · 12 Nguyễn Văn Linh, Q.7, TP.HCM' },
  { value: 'WH-HCM-01', label: 'WH-HCM-01 · Kho HCM Quận 7' },
  { value: 'KQ2', label: 'KQ2 · Kho Cảng Quận 2' },
]

export const deliveryAddressOptions = [
  {
    value: 'addr-1',
    label: '542 Cách Mạng Tháng 8, Phường 11, Quận 3, Thành phố Hồ Chí Minh',
  },
  {
    value: 'addr-2',
    label: '88 Xuân Thủy, Thảo Điền, TP. Thủ Đức, TP.HCM',
  },
  {
    value: 'addr-3',
    label: '15 Duy Tân, Cầu Giấy, Hà Nội',
  },
]

export { shippingPackageOptions }

const seedWaybills: Waybill[] = [
  {
    id: 'wb-1',
    code: 'SOCHMVFGIEIU954',
    partnerWaybillCode: 'Trans2203',
    partnerCode: 'TGDD',
    pickupAddressCode: 'CHM567028',
    contactName: 'Puma',
    contactPhone: '0817779950',
    recipientName: 'Ms. Jenny',
    recipientPhone: '0931313516',
    recipientAddress: '542 Cách Mạng Tháng 8, Phường 11, Quận 3, Thành phố Hồ Chí Minh',
    cod: null,
    orderValue: null,
    status: 'new',
    createdAt: '2023-03-22T10:00:00',
    shippingPackage: 'Standard',
    weightKg: 1.2,
    declaredValue: 0,
    pickupPartner: 'TGDD',
    pickupAddress: 'CHM567028',
    pickupPerson: 'Puma',
    pickupPhone: '0817779950',
    deliveryPerson: 'Ms. Jenny',
    deliveryPhone: '0931313516',
    deliveryAddress: 'addr-1',
    lines: [
      {
        id: 'wbl-1',
        productId: 'cp-1',
        name: seedCatalogProducts[0]?.name || 'Sạc nhanh 20W USB-C',
        sku: 'SKU-CHARGER-20W',
        partnerSku: 'EVC-CHG-20',
        imageUrl: seedCatalogProducts[0]?.imageUrl,
        unitLabel: 'Cái',
        goodsCondition: 'new',
        qty: 2,
        unitPrice: 0,
      },
    ],
  },
]

let waybillStore: Waybill[] = [...seedWaybills]

export function listWaybills() {
  return waybillStore
}

export function getWaybill(idOrCode: string) {
  return waybillStore.find((item) => item.id === idOrCode || item.code === idOrCode)
}

export function upsertWaybill(next: Waybill) {
  const idx = waybillStore.findIndex((item) => item.id === next.id)
  if (idx >= 0) {
    waybillStore = [...waybillStore.slice(0, idx), next, ...waybillStore.slice(idx + 1)]
  } else {
    waybillStore = [next, ...waybillStore]
  }
  return next
}

export function updateWaybillStatuses(ids: string[], status: WaybillStatus) {
  waybillStore = waybillStore.map((item) =>
    ids.includes(item.id) ? { ...item, status } : item,
  )
}

export function generateWaybillCode() {
  const suffix = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `SO${suffix}${Math.floor(100 + Math.random() * 900)}`
}

export function waybillLineAmount(line: WaybillLine) {
  return line.qty * line.unitPrice
}

export function waybillTotal(lines: WaybillLine[]) {
  return lines.reduce((sum, line) => sum + waybillLineAmount(line), 0)
}
