import dayjs from 'dayjs'
import type { CarrierHandoverSession, HandoverPackage } from './carrierHandovers'
import {
  formatAddress,
  getOutboundRequest,
  goodsConditionLabel,
  type OutboundRequest,
} from './outboundRequests'

/** Cột Excel theo TPLSession_Detail_OR_*.xlsx */
export const handoverExcelHeaders = [
  '#',
  'Mã OR',
  'Mã OR của đối tác',
  'Mã vận đơn',
  'Mã kiện hàng',
  'COD',
  'SKU',
  'Đơn vị',
  'Tình trạng hàng hoá',
  'Số lượng',
  'Đơn giá',
  'Tổng tiền',
  'Địa chỉ giao',
  'Tên khách hàng',
  'Số điện thoại',
  'Loại trả hàng',
  'Tình trạng',
] as const

function maskName(name: string) {
  if (!name) return ''
  if (name.length <= 2) return name
  return `${name[0]}${'*'.repeat(Math.min(6, name.length - 2))}${name[name.length - 1]}`
}

function maskPhone(phone: string) {
  if (!phone) return ''
  if (phone.length < 4) return phone
  return `${'*'.repeat(Math.max(0, phone.length - 2))}${phone.slice(-2)}`
}

function maskAddress(address: string) {
  if (!address) return ''
  if (address.length <= 8) return `******${address}`
  return `******${address.slice(-Math.min(64, address.length))}`
}

function formatBuyerAddress(or: OutboundRequest) {
  return formatAddress(or)
}

function money(n: number) {
  return n.toFixed(2)
}

type ExcelRow = Record<(typeof handoverExcelHeaders)[number], string | number>

function buildRowsForPackage(pkg: HandoverPackage): ExcelRow[] {
  const or = getOutboundRequest(pkg.outboundCode)
  const buyerName = or ? maskName(or.buyerName) : ''
  const buyerPhone = or ? maskPhone(or.buyerPhone) : ''
  const address = or ? maskAddress(formatBuyerAddress(or)) : ''
  const cod = or ? money(or.cod) : '0.00'
  const returnType = pkg.returnType || ''
  const condition = pkg.condition || ''

  const lines = or?.lines?.length
    ? or.lines
    : [
        {
          id: 'fallback',
          sku: '—',
          qty: pkg.productQty,
          unitPrice: 0,
          goodsCondition: 'new' as const,
          name: '',
          productId: '',
          availableQty: 0,
          assignedQty: 0,
          discount: 0,
        },
      ]

  return lines.map((line) => ({
    '#': 0, // filled later
    'Mã OR': pkg.outboundCode,
    'Mã OR của đối tác': pkg.partnerOrCode,
    'Mã vận đơn': pkg.trackingCode,
    'Mã kiện hàng': pkg.packageCode,
    COD: cod,
    SKU: line.sku,
    'Đơn vị': 'Cái',
    'Tình trạng hàng hoá': goodsConditionLabel[line.goodsCondition] || 'Mới',
    'Số lượng': line.qty,
    'Đơn giá': money(line.unitPrice),
    'Tổng tiền': money(line.qty * line.unitPrice),
    'Địa chỉ giao': address,
    'Tên khách hàng': buyerName,
    'Số điện thoại': buyerPhone,
    'Loại trả hàng': returnType,
    'Tình trạng': condition,
  }))
}

export function buildHandoverExcelRows(session: CarrierHandoverSession): ExcelRow[] {
  const rows: ExcelRow[] = []
  for (const pkg of session.packages) {
    rows.push(...buildRowsForPackage(pkg))
  }
  return rows.map((row, index) => ({ ...row, '#': index + 1 }))
}

function escapeCsv(value: string | number) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

/** Xuất CSV UTF-8 BOM (mở được bằng Excel), cột khớp TPLSession_Detail_OR */
export function downloadHandoverSessionExcel(session: CarrierHandoverSession) {
  const rows = buildHandoverExcelRows(session)
  const lines = [
    handoverExcelHeaders.join(','),
    ...rows.map((row) => handoverExcelHeaders.map((h) => escapeCsv(row[h])).join(',')),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `TPLSession_Detail_OR_${session.code}_${dayjs().format('YYYYMMDDHHmmss')}.csv`
  a.click()
  URL.revokeObjectURL(url)
  return rows.length
}
