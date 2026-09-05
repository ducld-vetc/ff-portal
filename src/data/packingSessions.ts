import { packingSeed, type PackedOrderRow } from './adminOpsSeed'
import { updateContainerDeviceStatus } from './containerDevices'
import {
  resolvePackFlowKind,
  type PackFlowKind,
  type PickListType,
} from './pickingLists'
import { seedCatalogProducts } from './productCatalog'

function skuPlaceholder(label: string, color: string) {
  const safe = encodeURIComponent(label.slice(0, 8))
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="16" fill="${color}"/><text x="80" y="86" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="18" font-weight="700">${safe}</text></svg>`,
  )}`
}

/** Meta ảnh + ghi chú SP theo SKU (catalog trước, fallback demo) */
const packSkuExtra: Record<string, { imageUrl: string; note: string }> = {
  '292490068011': {
    imageUrl: skuPlaceholder('LOTION', '#c026d3'),
    note: 'Mỹ phẩm — tránh nhiệt/nắng; kiểm tra nắp kín trước khi đóng hộp.',
  },
}

export function resolvePackSkuMeta(sku: string): { imageUrl?: string; note?: string } {
  const catalog = seedCatalogProducts.find((p) => p.sku === sku)
  if (catalog) {
    return {
      imageUrl: catalog.imageUrl,
      note: catalog.packingNote,
    }
  }
  return packSkuExtra[sku] || {}
}

function enrichPackLine(line: PackOrderLine): PackOrderLine {
  const meta = resolvePackSkuMeta(line.sku)
  return {
    ...line,
    imageUrl: line.imageUrl || meta.imageUrl,
    note: line.note || meta.note,
  }
}

export type PackLineStatus = 'pending' | 'scanned' | 'shortage' | 'skipped'

export type PackOrderLine = {
  id: string
  sku: string
  name: string
  qty: number
  scannedQty: number
  unit: string
  status: PackLineStatus
  /** Ảnh SKU (catalog / ASN) */
  imageUrl?: string
  /** Ghi chú đóng gói theo dòng SP */
  note?: string
}

export type PackOrder = {
  id: string
  outboundCode: string
  partnerOrCode: string
  partnerName: string
  trackingCode?: string
  packingNote?: string
  packageCode?: string
  packedAt?: string
  lines: PackOrderLine[]
  /** true khi đã tạo kiện (đủ hoặc đóng gói thiếu) */
  completed: boolean
  partial: boolean
}

export type PackSessionStatus = 'active' | 'paused' | 'pick_shortage' | 'done'

export type PackVasCode = 'seal_tape' | 'dunnage' | 'pe_wrap' | 'gift_wrap' | 'fragile_sticker'

export const packVasOptions: Array<{ value: PackVasCode; label: string }> = [
  { value: 'seal_tape', label: 'Dán băng keo niêm phong' },
  { value: 'dunnage', label: 'Chèn lót chống sốc (dunnage)' },
  { value: 'pe_wrap', label: 'Bọc PE' },
  { value: 'gift_wrap', label: 'Gói quà' },
  { value: 'fragile_sticker', label: 'Dán tem dễ vỡ' },
]

export type PackToteSession = {
  id: string
  toteCode: string
  pickType: PickListType
  flowKind: PackFlowKind
  pickListCode: string
  status: PackSessionStatus
  orders: PackOrder[]
  /** Index đơn đang xử lý (SSO/SMO); PTO dùng 0; SIO không dùng */
  currentOrderIndex: number
  vasCodes: PackVasCode[]
  pausedAt?: string | null
  startedAt: string
  lastSkuScanned?: string | null
}

export type PackScanResult =
  | { ok: true; session: PackToteSession; completedOrder?: PackOrder; message: string }
  | { ok: false; message: string }

const PARTIAL_PACK_PIN = '123456'

export function getPartialPackPin() {
  return PARTIAL_PACK_PIN
}

function cloneOrders(orders: PackOrder[]): PackOrder[] {
  return orders.map((o) => ({
    ...o,
    lines: o.lines.map((l) => ({ ...l })),
  }))
}

function makePackageCode(outboundCode: string) {
  const suffix = String(Math.floor(1000 + Math.random() * 9000))
  return `PG${outboundCode.replace(/^OR/, '')}${suffix}`
}

function makeTrackingCode() {
  return String(800000000000 + Math.floor(Math.random() * 999999999))
}

function linePending(line: PackOrderLine) {
  return line.scannedQty < line.qty && line.status !== 'shortage' && line.status !== 'skipped'
}

function orderFullyScanned(order: PackOrder) {
  return order.lines.every((l) => l.scannedQty >= l.qty || l.status === 'skipped')
}

function completeOrderInPlace(order: PackOrder, partial: boolean) {
  order.completed = true
  order.partial = partial
  order.packageCode = makePackageCode(order.outboundCode)
  order.trackingCode = order.trackingCode || makeTrackingCode()
  order.packedAt = new Date().toISOString()
  if (partial) {
    for (const line of order.lines) {
      if (line.scannedQty < line.qty && line.status !== 'shortage') {
        line.status = 'skipped'
      }
    }
  }
}

/** Seed tote demo theo từng loại DSLH */
type PackToteSeed = {
  toteCode: string
  pickType: PickListType
  pickListCode: string
  orders: Omit<PackOrder, 'completed' | 'partial' | 'packageCode' | 'packedAt'>[]
}

const packToteSeeds: PackToteSeed[] = [
  {
    toteCode: 'TOTE-PTO-01',
    pickType: 'PTO',
    pickListCode: 'PL2607253M6H2_PTO_002',
    orders: [
      {
        id: 'po-pto-1',
        outboundCode: 'ORNQATCNL49O942',
        partnerOrCode: 'NQA-TCNL-49',
        partnerName: 'NQA - HỘ KINH DOANH NGÔ QUỲNH ANH',
        packingNote: 'Bọc chống sốc; không xếp chồng. Kèm gift note nếu có.',
        lines: [
          {
            id: 'pol-pto-1a',
            sku: '292490068011',
            name: 'Lotion gội khô nước hoa Chirimola 100ml',
            qty: 1,
            scannedQty: 0,
            unit: 'TUÝP',
            status: 'pending',
          },
          {
            id: 'pol-pto-1b',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
    ],
  },
  {
    toteCode: 'TOTE-MIO-01',
    pickType: 'MIO',
    pickListCode: 'PL260725_MIO_001',
    orders: [
      {
        id: 'po-mio-1',
        outboundCode: 'ORMIOMULTI8801',
        partnerOrCode: 'EVC-MIO-8801',
        partnerName: 'EVC - CÔNG TY TNHH EVERCHARGE',
        packingNote: 'Đơn nhiều SKU — kiểm tra đủ trước khi dán nhãn.',
        lines: [
          {
            id: 'pol-mio-1a',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 2,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
          {
            id: 'pol-mio-1b',
            sku: 'SKU-CABLE-C-C-1M',
            name: 'Cáp USB-C to C 1m',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
          {
            id: 'pol-mio-1c',
            sku: 'SKU-SERUM-30ML',
            name: 'Serum dưỡng ẩm 30ml',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
    ],
  },
  {
    toteCode: 'TOTE-PTS-01',
    pickType: 'PTS',
    pickListCode: 'PL260725_PTS_001',
    orders: [
      {
        id: 'po-pts-1',
        outboundCode: 'ORPTSSORT4402',
        partnerOrCode: 'HAC-PTS-4402',
        partnerName: 'HAC-CONG TY TNHH HAC RETAIL',
        packingNote: 'PTS — đã phân loại theo đơn trong tote.',
        lines: [
          {
            id: 'pol-pts-1a',
            sku: 'SKU-PHONE-X1',
            name: 'Điện thoại demo X1',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
          {
            id: 'pol-pts-1b',
            sku: 'SKU-CABLE-C-C-1M',
            name: 'Cáp USB-C to C 1m',
            qty: 2,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
    ],
  },
  {
    toteCode: 'TOTE-SIO-01',
    pickType: 'SIO',
    pickListCode: 'PL260725_SIO_001',
    orders: [
      {
        id: 'po-sio-1',
        outboundCode: 'ORSIOSINGLE01',
        partnerOrCode: 'SIO-001',
        partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
        lines: [
          {
            id: 'pol-sio-1',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
      {
        id: 'po-sio-2',
        outboundCode: 'ORSIOSINGLE02',
        partnerOrCode: 'SIO-002',
        partnerName: 'AVI - CÔNG TY TNHH AVIATEK',
        lines: [
          {
            id: 'pol-sio-2',
            sku: 'SKU-CABLE-C-C-1M',
            name: 'Cáp USB-C to C 1m',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
      {
        id: 'po-sio-3',
        outboundCode: 'ORSIOSINGLE03',
        partnerOrCode: 'SIO-003',
        partnerName: 'NQA - HỘ KINH DOANH NGÔ QUỲNH ANH',
        lines: [
          {
            id: 'pol-sio-3',
            sku: 'SKU-SERUM-30ML',
            name: 'Serum dưỡng ẩm 30ml',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
      {
        id: 'po-sio-4',
        outboundCode: 'ORSIOSINGLE04',
        partnerOrCode: 'SIO-004',
        partnerName: 'EVC - CÔNG TY TNHH EVERCHARGE',
        lines: [
          {
            id: 'pol-sio-4',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
    ],
  },
  {
    toteCode: 'TOTE-SSO-01',
    pickType: 'SSO',
    pickListCode: 'PL260725_SSO_001',
    orders: [
      {
        id: 'po-sso-1',
        outboundCode: 'ORSSOSAME01',
        partnerOrCode: 'SSO-01',
        partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
        lines: [
          {
            id: 'pol-sso-1',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
      {
        id: 'po-sso-2',
        outboundCode: 'ORSSOSAME02',
        partnerOrCode: 'SSO-02',
        partnerName: 'AVI - CÔNG TY TNHH AVIATEK',
        lines: [
          {
            id: 'pol-sso-2',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 2,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
      {
        id: 'po-sso-3',
        outboundCode: 'ORSSOSAME03',
        partnerOrCode: 'SSO-03',
        partnerName: 'HAC-CONG TY TNHH HAC RETAIL',
        lines: [
          {
            id: 'pol-sso-3',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 3,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
    ],
  },
  {
    toteCode: 'TOTE-SMO-01',
    pickType: 'SMO',
    pickListCode: 'PL260725_SMO_001',
    orders: [
      {
        id: 'po-smo-1',
        outboundCode: 'ORSMOPAT01',
        partnerOrCode: 'SMO-01',
        partnerName: 'EVC - CÔNG TY TNHH EVERCHARGE',
        packingNote: 'Pattern: 1 sạc + 1 cáp — lặp cho mỗi đơn.',
        lines: [
          {
            id: 'pol-smo-1a',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
          {
            id: 'pol-smo-1b',
            sku: 'SKU-CABLE-C-C-1M',
            name: 'Cáp USB-C to C 1m',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
      {
        id: 'po-smo-2',
        outboundCode: 'ORSMOPAT02',
        partnerOrCode: 'SMO-02',
        partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
        lines: [
          {
            id: 'pol-smo-2a',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
          {
            id: 'pol-smo-2b',
            sku: 'SKU-CABLE-C-C-1M',
            name: 'Cáp USB-C to C 1m',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
      {
        id: 'po-smo-3',
        outboundCode: 'ORSMOPAT03',
        partnerOrCode: 'SMO-03',
        partnerName: 'NQA - HỘ KINH DOANH NGÔ QUỲNH ANH',
        lines: [
          {
            id: 'pol-smo-3a',
            sku: 'SKU-CHARGER-20W',
            name: 'Sạc nhanh 20W USB-C',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
          {
            id: 'pol-smo-3b',
            sku: 'SKU-CABLE-C-C-1M',
            name: 'Cáp USB-C to C 1m',
            qty: 1,
            scannedQty: 0,
            unit: 'Cái',
            status: 'pending',
          },
        ],
      },
    ],
  },
]

/** Legacy device codes map → PTO-style single order (tương thích demo cũ) */
const legacyDeviceMap: Record<string, string> = {
  'RNN.052': 'TOTE-PTO-01',
  'RNN.041': 'TOTE-SIO-01',
  'RNN.033': 'TOTE-PTS-01',
  'RNN.018': 'TOTE-MIO-01',
}

export const packDemoToteHints = packToteSeeds.map((s) => ({
  code: s.toteCode,
  pickType: s.pickType,
}))

let sessionStore: PackToteSession[] = []
let packedHistory: PackedOrderRow[] = packingSeed.map((r) => ({
  ...r,
  packageCode: `PG${r.outboundCode.replace(/^OR/, '')}0001`,
  pickType: 'PTO' as PickListType,
}))

export type PackedHistoryRow = PackedOrderRow & {
  packageCode?: string
  pickType?: PickListType
}

function findSeed(toteCode: string) {
  const normalized = toteCode.trim().toUpperCase()
  const mapped = legacyDeviceMap[normalized] || normalized
  return packToteSeeds.find((s) => s.toteCode.toUpperCase() === mapped)
}

export function lookupPackTote(toteCode: string) {
  const seed = findSeed(toteCode)
  if (!seed) return null
  return {
    toteCode: seed.toteCode,
    pickType: seed.pickType,
    flowKind: resolvePackFlowKind(seed.pickType),
    pickListCode: seed.pickListCode,
    orderCount: seed.orders.length,
    productQty: seed.orders.reduce(
      (s, o) => s + o.lines.reduce((a, l) => a + l.qty, 0),
      0,
    ),
  }
}

export function getPackSession(sessionId: string) {
  return sessionStore.find((s) => s.id === sessionId)
}

export function getActivePackSessionByTote(toteCode: string) {
  const code = findSeed(toteCode)?.toteCode || toteCode.trim().toUpperCase()
  return sessionStore.find(
    (s) =>
      s.toteCode.toUpperCase() === code.toUpperCase() &&
      (s.status === 'active' || s.status === 'paused' || s.status === 'pick_shortage'),
  )
}

export function startOrResumePackSession(toteCode: string): PackScanResult {
  const seed = findSeed(toteCode)
  if (!seed) {
    return { ok: false, message: `Không tìm thấy tote ${toteCode.trim()} sẵn sàng đóng gói` }
  }

  const existing = getActivePackSessionByTote(seed.toteCode)
  if (existing) {
    if (existing.status === 'done') {
      return { ok: false, message: `Tote ${seed.toteCode} đã đóng gói xong` }
    }
    existing.status = existing.status === 'pick_shortage' ? 'pick_shortage' : 'active'
    existing.pausedAt = null
    sessionStore = sessionStore.map((s) => (s.id === existing.id ? { ...existing } : s))
    return {
      ok: true,
      session: existing,
      message:
        existing.status === 'pick_shortage'
          ? `Tote ${seed.toteCode} đang thiếu hàng — có thể tạm dừng để lấy lại`
          : `Tiếp tục phiên đóng gói tote ${seed.toteCode}`,
    }
  }

  const done = sessionStore.find((s) => s.toteCode === seed.toteCode && s.status === 'done')
  if (done) {
    return { ok: false, message: `Tote ${seed.toteCode} đã đóng gói xong trong phiên này` }
  }

  const session: PackToteSession = {
    id: `ps-${Date.now()}`,
    toteCode: seed.toteCode,
    pickType: seed.pickType,
    flowKind: resolvePackFlowKind(seed.pickType),
    pickListCode: seed.pickListCode,
    status: 'active',
    orders: cloneOrders(
      seed.orders.map((o) => ({
        ...o,
        completed: false,
        partial: false,
        lines: o.lines.map((l) =>
          enrichPackLine({ ...l, scannedQty: 0, status: 'pending' as const }),
        ),
      })),
    ),
    currentOrderIndex: 0,
    vasCodes: [],
    pausedAt: null,
    startedAt: new Date().toISOString(),
    lastSkuScanned: null,
  }
  sessionStore = [session, ...sessionStore]
  updateContainerDeviceStatus(session.toteCode, 'packing')
  return { ok: true, session, message: `Bắt đầu đóng gói ${seed.pickType} · ${seed.toteCode}` }
}

function persistSession(session: PackToteSession) {
  sessionStore = sessionStore.map((s) => (s.id === session.id ? session : s))
  return session
}

function pushHistory(session: PackToteSession, order: PackOrder) {
  const row: PackedHistoryRow = {
    id: `pk-${Date.now()}-${order.id}`,
    packedAt: order.packedAt || new Date().toISOString(),
    partnerName: order.partnerName,
    outboundCode: order.outboundCode,
    partnerOrCode: order.partnerOrCode,
    trackingCode: order.trackingCode,
    deviceCode: session.toteCode,
    packageCode: order.packageCode,
    pickType: session.pickType,
  }
  packedHistory = [row, ...packedHistory]
}

function advanceCurrentIndex(session: PackToteSession) {
  const next = session.orders.findIndex((o, i) => i >= session.currentOrderIndex && !o.completed)
  if (next >= 0) {
    session.currentOrderIndex = next
    return
  }
  const anyOpen = session.orders.findIndex((o) => !o.completed)
  session.currentOrderIndex = anyOpen >= 0 ? anyOpen : session.orders.length - 1
}

function maybeFinishSession(session: PackToteSession) {
  if (session.orders.every((o) => o.completed)) {
    session.status = 'done'
    updateContainerDeviceStatus(session.toteCode, 'ready')
  }
}

function finalizeCompletedOrder(session: PackToteSession, order: PackOrder): PackOrder {
  pushHistory(session, order)
  advanceCurrentIndex(session)
  maybeFinishSession(session)
  return order
}

/** Quét SKU trong phiên đang mở */
export function scanPackProduct(sessionId: string, skuRaw: string): PackScanResult {
  const session = getPackSession(sessionId)
  if (!session) return { ok: false, message: 'Không tìm thấy phiên đóng gói' }
  if (session.status === 'done') return { ok: false, message: 'Phiên đã hoàn tất' }
  if (session.status === 'paused') return { ok: false, message: 'Phiên đang tạm dừng — quét lại tote để tiếp tục' }

  const sku = skuRaw.trim()
  if (!sku) return { ok: false, message: 'Quét hoặc nhập mã sản phẩm' }

  const matchSku = (line: PackOrderLine) =>
    line.sku.toLowerCase() === sku.toLowerCase() || line.sku.replace(/[^a-z0-9]/gi, '') === sku.replace(/[^a-z0-9]/gi, '').toLowerCase()

  let completedOrder: PackOrder | undefined

  if (session.flowKind === 'sio') {
    const order = session.orders.find(
      (o) => !o.completed && o.lines.some((l) => matchSku(l) && linePending(l)),
    )
    if (!order) {
      return { ok: false, message: `SKU ${sku} không khớp đơn còn lại trong tote` }
    }
    const line = order.lines.find((l) => matchSku(l))!
    line.scannedQty = Math.min(line.qty, line.scannedQty + 1)
    line.status = line.scannedQty >= line.qty ? 'scanned' : 'pending'
    session.lastSkuScanned = line.sku
    if (orderFullyScanned(order)) {
      completeOrderInPlace(order, false)
      completedOrder = finalizeCompletedOrder(session, order)
    }
    persistSession(session)
    return {
      ok: true,
      session: { ...session, orders: cloneOrders(session.orders) },
      completedOrder,
      message: completedOrder
        ? `Đã đóng gói ${order.outboundCode} · kiện ${order.packageCode}`
        : `Đã quét ${line.sku} cho ${order.outboundCode}`,
    }
  }

  // single_order / sso / smo — làm việc trên đơn hiện tại
  advanceCurrentIndex(session)
  const order = session.orders[session.currentOrderIndex]
  if (!order || order.completed) {
    return { ok: false, message: 'Không còn đơn cần đóng gói trong tote' }
  }

  const line = order.lines.find((l) => matchSku(l) && linePending(l))
  if (!line) {
    const exists = order.lines.some((l) => matchSku(l))
    return {
      ok: false,
      message: exists
        ? `Đã quét đủ ${sku} cho đơn hiện tại`
        : `SKU ${sku} không thuộc đơn đang đóng gói (${order.outboundCode})`,
    }
  }

  line.scannedQty = Math.min(line.qty, line.scannedQty + 1)
  line.status = line.scannedQty >= line.qty ? 'scanned' : 'pending'
  session.lastSkuScanned = line.sku

  if (orderFullyScanned(order)) {
    completeOrderInPlace(order, false)
    completedOrder = finalizeCompletedOrder(session, order)
  }

  persistSession(session)
  return {
    ok: true,
    session: { ...session, orders: cloneOrders(session.orders) },
    completedOrder,
    message: completedOrder
      ? `Đã đóng gói ${order.outboundCode} · kiện ${order.packageCode}`
      : `${line.sku}: ${line.scannedQty}/${line.qty}`,
  }
}

export function pausePackSession(sessionId: string): PackScanResult {
  const session = getPackSession(sessionId)
  if (!session) return { ok: false, message: 'Không tìm thấy phiên' }
  if (session.status === 'done') return { ok: false, message: 'Phiên đã hoàn tất' }
  session.status = 'paused'
  session.pausedAt = new Date().toISOString()
  persistSession(session)
  return {
    ok: true,
    session: { ...session, orders: cloneOrders(session.orders) },
    message: `Đã tạm dừng · quét lại ${session.toteCode} để tiếp tục`,
  }
}

export function markPackShortage(sessionId: string): PackScanResult {
  const session = getPackSession(sessionId)
  if (!session) return { ok: false, message: 'Không tìm thấy phiên' }
  if (session.status === 'done') return { ok: false, message: 'Phiên đã hoàn tất' }

  let marked = 0
  const targets =
    session.flowKind === 'sio'
      ? session.orders.filter((o) => !o.completed)
      : [session.orders[session.currentOrderIndex]].filter(Boolean)

  for (const order of targets) {
    if (order.completed) continue
    for (const line of order.lines) {
      if (linePending(line)) {
        line.status = 'shortage'
        marked += 1
      }
    }
  }

  if (marked === 0) {
    return { ok: false, message: 'Không còn sản phẩm chưa quét để báo thiếu' }
  }

  session.status = 'pick_shortage'
  updateContainerDeviceStatus(session.toteCode, 'pick_shortage')
  persistSession(session)
  return {
    ok: true,
    session: { ...session, orders: cloneOrders(session.orders) },
    message: `Đã đánh dấu ${marked} dòng thiếu · tote → lấy hàng bị thiếu. Tạm dừng và chuyển khu lấy lại.`,
  }
}

export function partialPackWithPin(sessionId: string, pin: string): PackScanResult {
  if (pin !== PARTIAL_PACK_PIN) {
    return { ok: false, message: 'Mật khẩu không đúng' }
  }
  const session = getPackSession(sessionId)
  if (!session) return { ok: false, message: 'Không tìm thấy phiên' }
  if (session.status === 'done') return { ok: false, message: 'Phiên đã hoàn tất' }

  advanceCurrentIndex(session)
  const order =
    session.flowKind === 'sio'
      ? session.orders.find((o) => !o.completed && o.lines.some((l) => l.scannedQty > 0))
      : session.orders[session.currentOrderIndex]

  if (!order || order.completed) {
    return { ok: false, message: 'Không có đơn phù hợp để đóng gói thiếu' }
  }
  const hasScanned = order.lines.some((l) => l.scannedQty > 0)
  if (!hasScanned) {
    return { ok: false, message: 'Cần quét ít nhất 1 sản phẩm trước khi đóng gói thiếu' }
  }
  if (orderFullyScanned(order)) {
    return { ok: false, message: 'Đơn đã quét đủ — dùng luồng đóng gói thường' }
  }

  completeOrderInPlace(order, true)
  const completedOrder = finalizeCompletedOrder(session, order)
  persistSession(session)
  return {
    ok: true,
    session: { ...session, orders: cloneOrders(session.orders) },
    completedOrder,
    message: `Đóng gói thiếu ${order.outboundCode} · kiện ${order.packageCode}`,
  }
}

export function addPackVas(sessionId: string, codes: PackVasCode[]): PackScanResult {
  const session = getPackSession(sessionId)
  if (!session) return { ok: false, message: 'Không tìm thấy phiên' }
  session.vasCodes = [...new Set([...session.vasCodes, ...codes])]
  persistSession(session)
  return {
    ok: true,
    session: { ...session, orders: cloneOrders(session.orders) },
    message: `Đã gắn ${session.vasCodes.length} dịch vụ cộng thêm`,
  }
}

export function listPackedHistory(): PackedHistoryRow[] {
  return packedHistory
}

export function getCurrentPackOrder(session: PackToteSession): PackOrder | null {
  if (session.flowKind === 'sio') return null
  return session.orders[session.currentOrderIndex] ?? null
}

export function sessionProgress(session: PackToteSession) {
  const done = session.orders.filter((o) => o.completed).length
  return { done, total: session.orders.length }
}
