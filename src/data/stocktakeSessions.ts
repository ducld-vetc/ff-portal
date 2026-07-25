export type StocktakeRequestType = 'internal' | 'partner'
export type StocktakeKind =
  | 'full'
  | 'count_by_product'
  | 'count_by_location'
  | 'daily_by_location'
  | 'daily_by_product'
  | 'daily_by_change'
  | 'sku_bin'

export type StocktakeStatus = 'counting' | 'completed' | 'cancelled'

export type StocktakeLine = {
  id: string
  locationCode: string
  sku: string
  productName: string
  unit: string
  goodsCondition: string
  systemQty: number
  count1?: number | null
  count2?: number | null
  count3?: number | null
}

export type StocktakeSession = {
  id: string
  code: string
  requestType: StocktakeRequestType
  kind: StocktakeKind
  partnerName?: string
  skuCount: number
  productQty: number
  locationCount: number
  countedLocations: number
  countedProducts: number
  status: StocktakeStatus
  variancePct: number
  createdAt: string
  startedAt?: string | null
  endedAt?: string | null
  confirmedAt?: string | null
  createdBy: string
  confirmedBy?: string | null
  note?: string
  lines: StocktakeLine[]
}

export const stocktakeRequestTypeLabel: Record<StocktakeRequestType, string> = {
  internal: 'Nội bộ',
  partner: 'Đối tác yêu cầu',
}

export const stocktakeKindLabel: Record<StocktakeKind, string> = {
  full: 'Kiểm kê',
  count_by_product: 'Kiểm đếm theo sản phẩm',
  count_by_location: 'Kiểm đếm theo vị trí',
  daily_by_location: 'Kiểm đếm thường nhật - theo vị trí',
  daily_by_product: 'Kiểm đếm thường nhật - theo sản phẩm',
  daily_by_change: 'Kiểm đếm thường nhật - tồn thay đổi',
  sku_bin: 'Kiểm kê theo SKU, BIN',
}

export const stocktakeStatusLabel: Record<StocktakeStatus, string> = {
  counting: 'Đang kiểm đếm',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

export const stocktakePartnerOptions = [
  { value: 'LAB - CÔNG TY TNHH MỘT THÀNH VIÊN KHỎE ĐẸP BỀN VỮNG', label: 'LAB - CÔNG TY TNHH MỘT THÀNH VIÊN KHỎE ĐẸP BỀN VỮNG' },
  { value: 'GRS - GRS', label: 'GRS - GRS' },
  { value: 'KHAITN02 - CÔNG TY TNHH EVERCHARGE01', label: 'KHAITN02 - CÔNG TY TNHH EVERCHARGE01' },
  { value: 'CUS-002 - CÔNG TY TNHH GREENMART VIETNAM', label: 'CUS-002 - CÔNG TY TNHH GREENMART VIETNAM' },
]

export const binTypeOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pickable', label: 'Có thể lấy hàng' },
  { value: 'non_pickable', label: 'Không thể lấy hàng' },
]

export const changeTimeOptions = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: '7d', label: '7 ngày gần nhất' },
  { value: '30d', label: '30 ngày gần nhất' },
]

function makeCode(prefix = 'CCS') {
  const d = new Date()
  const stamp = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}${stamp}${rand}`
}

const demoLines: StocktakeLine[] = [
  {
    id: 'stl-1',
    locationCode: 'PL hang hong',
    sku: '4976782024612',
    productName: 'Orihiro Glucosamine 900 viên',
    unit: 'HỘP',
    goodsCondition: 'Hư hỏng',
    systemQty: 2,
    count1: 2,
    count2: null,
    count3: null,
  },
  {
    id: 'stl-2',
    locationCode: 'R1.D1.T1.001',
    sku: '4962213540011',
    productName: 'Orihiro Collagen bột',
    unit: 'TÚI',
    goodsCondition: 'Mới',
    systemQty: 5,
    count1: 5,
    count2: null,
    count3: null,
  },
  {
    id: 'stl-3',
    locationCode: 'R1.D1.T1.002',
    sku: '4987243100019',
    productName: 'DHC Vitamin C cứng 90 ngày',
    unit: 'LỌ',
    goodsCondition: 'Mới',
    systemQty: 8,
    count1: 7,
    count2: null,
    count3: null,
  },
  {
    id: 'stl-4',
    locationCode: 'R2.A1.T2.003',
    sku: '4901417610012',
    productName: 'Suntory DHA&EPA+Sesamin EX',
    unit: 'HỘP',
    goodsCondition: 'Quá hạn xuất kho',
    systemQty: 3,
    count1: 3,
    count2: null,
    count3: null,
  },
]

let sessions: StocktakeSession[] = [
  {
    id: 'ss-1',
    code: 'CCS23072026MZ49540',
    requestType: 'internal',
    kind: 'full',
    partnerName: 'LAB - CÔNG TY TNHH MỘT THÀNH VIÊN KHỎE ĐẸP BỀN VỮNG',
    skuCount: 67,
    productQty: 221,
    locationCount: 120,
    countedLocations: 1,
    countedProducts: 1,
    status: 'counting',
    variancePct: 0,
    createdAt: '2026-07-23T10:57:28',
    startedAt: '2026-07-23T10:58:31',
    endedAt: null,
    confirmedAt: null,
    createdBy: 'alex - Phí Đức Dũng',
    confirmedBy: null,
    lines: demoLines,
  },
  {
    id: 'ss-2',
    code: 'CCS22072026AB11220',
    requestType: 'internal',
    kind: 'count_by_product',
    partnerName: '',
    skuCount: 11,
    productQty: 48,
    locationCount: 11,
    countedLocations: 11,
    countedProducts: 11,
    status: 'completed',
    variancePct: 8.14,
    createdAt: '2026-07-22T09:12:00',
    startedAt: '2026-07-22T09:20:00',
    endedAt: '2026-07-22T15:40:00',
    confirmedAt: '2026-07-22T15:45:00',
    createdBy: 'ops - Ops Warehouse',
    confirmedBy: 'ops - Ops Warehouse',
    lines: demoLines.slice(0, 2),
  },
  {
    id: 'ss-3',
    code: 'CCS21072026CD33441',
    requestType: 'partner',
    kind: 'count_by_location',
    partnerName: 'GRS - GRS',
    skuCount: 992,
    productQty: 1584,
    locationCount: 200,
    countedLocations: 200,
    countedProducts: 992,
    status: 'completed',
    variancePct: 102.22,
    createdAt: '2026-07-21T08:00:00',
    startedAt: '2026-07-21T08:10:00',
    endedAt: '2026-07-21T18:00:00',
    confirmedAt: '2026-07-21T18:05:00',
    createdBy: 'tuan - Ngô Minh Tuấn',
    confirmedBy: 'tuan - Ngô Minh Tuấn',
    lines: demoLines,
  },
  {
    id: 'ss-4',
    code: 'CCS20072026EF55662',
    requestType: 'internal',
    kind: 'daily_by_location',
    partnerName: '',
    skuCount: 40,
    productQty: 120,
    locationCount: 40,
    countedLocations: 12,
    countedProducts: 12,
    status: 'counting',
    variancePct: 0,
    createdAt: '2026-07-20T07:30:00',
    startedAt: '2026-07-20T07:35:00',
    endedAt: null,
    createdBy: 'ops - Ops Warehouse',
    lines: demoLines.slice(1),
  },
  {
    id: 'ss-5',
    code: 'CCS18072026GH77883',
    requestType: 'internal',
    kind: 'full',
    partnerName: '',
    skuCount: 15,
    productQty: 60,
    locationCount: 20,
    countedLocations: 0,
    countedProducts: 0,
    status: 'cancelled',
    variancePct: 0,
    createdAt: '2026-07-18T11:00:00',
    startedAt: null,
    endedAt: null,
    createdBy: 'alex - Phí Đức Dũng',
    lines: [],
  },
]

export function listStocktakeSessions() {
  return sessions
}

export function getStocktakeSession(id: string) {
  return sessions.find((s) => s.id === id || s.code === id)
}

export function upsertStocktakeSession(row: StocktakeSession) {
  const idx = sessions.findIndex((s) => s.id === row.id)
  if (idx >= 0) sessions = [...sessions.slice(0, idx), row, ...sessions.slice(idx + 1)]
  else sessions = [row, ...sessions]
  return row
}

export function createStocktakeSession(input: {
  requestType: StocktakeRequestType
  kind: StocktakeKind
  partnerName?: string
  note?: string
  skuCount?: number
  productQty?: number
  locationCount?: number
}) {
  const now = new Date().toISOString()
  const row: StocktakeSession = {
    id: `ss-${Date.now()}`,
    code: makeCode(),
    requestType: input.requestType,
    kind: input.kind,
    partnerName: input.partnerName || '',
    skuCount: input.skuCount ?? 0,
    productQty: input.productQty ?? 0,
    locationCount: input.locationCount ?? 0,
    countedLocations: 0,
    countedProducts: 0,
    status: 'counting',
    variancePct: 0,
    createdAt: now,
    startedAt: now,
    endedAt: null,
    confirmedAt: null,
    createdBy: 'ops - Ops Warehouse',
    confirmedBy: null,
    note: input.note,
    lines: demoLines.map((l, i) => ({ ...l, id: `stl-new-${Date.now()}-${i}` })),
  }
  return upsertStocktakeSession(row)
}

export function estimateDailyStats(tab: 'location' | 'product' | 'change', binType?: string, partner?: string) {
  if (tab === 'location') {
    if (binType === 'pickable') return { locations: 2644, skus: 1621, products: 69663 }
    if (binType === 'non_pickable') return { locations: 812, skus: 420, products: 9800 }
    return { locations: 3456, skus: 2041, products: 79463 }
  }
  if (tab === 'product') {
    return partner ? { locations: 81, skus: 703, products: 703 } : { locations: 0, skus: 0, products: 0 }
  }
  return partner ? { locations: 19, skus: 79, products: 79 } : { locations: 0, skus: 0, products: 0 }
}

export function lineVariance(line: StocktakeLine) {
  const counted = line.count3 ?? line.count2 ?? line.count1
  if (counted == null) return 0
  return counted - line.systemQty
}
