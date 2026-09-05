export type HandoverSessionType = 'receipt' | 'delivery'
export type HandoverStatus = 'new' | 'processing' | 'handed_over' | 'cancelled'

export type HandoverPackage = {
  id: string
  partnerName: string
  outboundCode: string
  partnerOrCode: string
  trackingCode: string
  packageCode: string
  productQty: number
  returnType?: string
  condition?: string
}

export type CarrierHandoverSession = {
  id: string
  code: string
  carrierCode: string
  carrierName: string
  sessionType: HandoverSessionType
  status: HandoverStatus
  packageCount: number
  outboundCount: number
  createdAt: string
  createdBy: string
  note?: string
  packages: HandoverPackage[]
}

export const handoverSessionTypeLabel: Record<HandoverSessionType, string> = {
  receipt: 'Phiên nhận',
  delivery: 'Phiên giao',
}

export const handoverStatusLabel: Record<HandoverStatus, string> = {
  new: 'Mới',
  processing: 'Đang xử lý',
  handed_over: 'Đã bàn giao',
  cancelled: 'Đã hủy',
}

export const handoverStatusColor: Record<HandoverStatus, string> = {
  new: 'blue',
  processing: 'processing',
  handed_over: 'success',
  cancelled: 'default',
}

export const handoverCarrierOptions = [
  { value: 'GHN', label: 'Giao Hàng Nhanh' },
  { value: 'GHTK', label: 'Giao Hàng Tiết Kiệm' },
  { value: 'VTP', label: 'Viettel Post' },
  { value: 'SPX', label: 'Shopee Express VietNam' },
  { value: 'JT', label: 'J&T Express VietNam' },
]

export const returnTypeOptions = [
  { value: 'Hàng trả', label: 'Hàng trả' },
  { value: 'Hàng đổi', label: 'Hàng đổi' },
  { value: 'Hàng hoàn', label: 'Hàng hoàn' },
]

export const packageConditionOptions = [
  { value: 'Tốt', label: 'Tốt' },
  { value: 'Hư hỏng', label: 'Hư hỏng' },
  { value: 'Thiếu hàng', label: 'Thiếu hàng' },
]

/** Kiểu quét demo để thêm vào phiên */
export const demoScanPackages: HandoverPackage[] = [
  {
    id: 'pkg-demo-1',
    partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
    outboundCode: 'ORHACWBMUP26917',
    partnerOrCode: 'HAC-WBM-UP-26917',
    trackingCode: '802789820795',
    packageCode: 'PGHACWBMUP269170001',
    productQty: 2,
  },
  {
    id: 'pkg-demo-2',
    partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
    outboundCode: 'ORAZB6FB5XRW785',
    partnerOrCode: 'SHOPEE-99100',
    trackingCode: 'JT889900112',
    packageCode: 'PGORAZB6FB5XRW785001',
    productQty: 1,
  },
  {
    id: 'pkg-demo-3',
    partnerName: 'AVI - CÔNG TY TNHH AVIATEK',
    outboundCode: 'ORHN01C8830',
    partnerOrCode: 'TT-1002',
    trackingCode: 'GHN99881234',
    packageCode: 'PGORHN01C88300001',
    productQty: 3,
  },
  {
    id: 'pkg-demo-4',
    partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
    outboundCode: 'ORHACBQVW0K1252',
    partnerOrCode: '1328948433_18953',
    trackingCode: 'GYXVHNLM',
    packageCode: 'PGHACBQVW0K12520001',
    productQty: 1,
  },
]

function makeSessionCode(carrierCode: string) {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `${carrierCode}${rand}`
}

let sessions: CarrierHandoverSession[] = [
  {
    id: 'ho-1',
    code: 'GHNGLWD1W2MT',
    carrierCode: 'GHN',
    carrierName: 'Giao Hàng Nhanh',
    sessionType: 'delivery',
    status: 'new',
    packageCount: 3,
    outboundCount: 3,
    createdAt: '2026-06-30T10:20:00',
    createdBy: 'tuan - Ngô Minh Tuấn',
    note: '',
    packages: [
      { ...demoScanPackages[3], id: 'ho-1-p1' },
      {
        id: 'ho-1-p2',
        partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
        outboundCode: 'ORHACBQVW0K1253',
        partnerOrCode: '1328948433_18954',
        trackingCode: 'GYXVHNLN',
        packageCode: 'PGHACBQVW0K12530001',
        productQty: 3,
      },
      {
        id: 'ho-1-p3',
        partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
        outboundCode: 'ORAZB6FB5XRW785',
        partnerOrCode: 'SHOPEE-99100',
        trackingCode: 'JT889900112',
        packageCode: 'PGORAZB6FB5XRW785001',
        productQty: 1,
      },
    ],
  },
  {
    id: 'ho-2',
    code: 'GHTK88AX2Q9P',
    carrierCode: 'GHTK',
    carrierName: 'Giao Hàng Tiết Kiệm',
    sessionType: 'delivery',
    status: 'new',
    packageCount: 2,
    outboundCount: 2,
    createdAt: '2026-07-10T09:00:00',
    createdBy: 'ops - Ops Warehouse',
    packages: [
      { ...demoScanPackages[1], id: 'ho-2-p1' },
      { ...demoScanPackages[2], id: 'ho-2-p2' },
    ],
  },
  {
    id: 'ho-3',
    code: 'VTPK9M2L1N0X',
    carrierCode: 'VTP',
    carrierName: 'Viettel Post',
    sessionType: 'delivery',
    status: 'processing',
    packageCount: 5,
    outboundCount: 4,
    createdAt: '2026-07-18T14:30:00',
    createdBy: 'tuan - Ngô Minh Tuấn',
    packages: Array.from({ length: 5 }, (_, i) => ({
      id: `ho-3-p${i + 1}`,
      partnerName: 'AVI - CÔNG TY TNHH AVIATEK',
      outboundCode: `ORHN01C883${i}`,
      partnerOrCode: `TT-100${i}`,
      trackingCode: `VTP9988${1000 + i}`,
      packageCode: `PGORHN01C883${i}0001`,
      productQty: 1 + (i % 3),
    })),
  },
  {
    id: 'ho-4',
    code: 'SPXAA11BB22',
    carrierCode: 'SPX',
    carrierName: 'Shopee Express VietNam',
    sessionType: 'delivery',
    status: 'new',
    packageCount: 1,
    outboundCount: 1,
    createdAt: '2026-07-20T08:15:00',
    createdBy: 'ops - Ops Warehouse',
    packages: [{ ...demoScanPackages[0], id: 'ho-4-p1' }],
  },
  {
    id: 'ho-5',
    code: 'JTRECV01A2B3',
    carrierCode: 'JT',
    carrierName: 'J&T Express VietNam',
    sessionType: 'receipt',
    status: 'new',
    packageCount: 1,
    outboundCount: 1,
    createdAt: '2026-07-22T11:00:00',
    createdBy: 'ops - Ops Warehouse',
    note: 'Nhận hàng trả từ ĐVVC',
    packages: [
      {
        ...demoScanPackages[0],
        id: 'ho-5-p1',
        returnType: 'Hàng trả',
        condition: 'Tốt',
      },
    ],
  },
]

export function listCarrierHandovers() {
  return sessions
}

export function getCarrierHandover(id: string) {
  return sessions.find((s) => s.id === id || s.code === id)
}

export function upsertCarrierHandover(row: CarrierHandoverSession) {
  const idx = sessions.findIndex((s) => s.id === row.id)
  if (idx >= 0) {
    sessions = [...sessions.slice(0, idx), row, ...sessions.slice(idx + 1)]
  } else {
    sessions = [row, ...sessions]
  }
  return row
}

export function createCarrierHandover(input: {
  sessionType: HandoverSessionType
  carrierCode: string
  carrierName: string
  note?: string
  packages: HandoverPackage[]
  createdBy?: string
}) {
  const outboundCodes = new Set(input.packages.map((p) => p.outboundCode))
  const row: CarrierHandoverSession = {
    id: `ho-${Date.now()}`,
    code: makeSessionCode(input.carrierCode),
    carrierCode: input.carrierCode,
    carrierName: input.carrierName,
    sessionType: input.sessionType,
    status: 'new',
    packageCount: input.packages.length,
    outboundCount: outboundCodes.size,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy || 'ops - Ops Warehouse',
    note: input.note,
    packages: input.packages,
  }
  return upsertCarrierHandover(row)
}

export function findDemoPackage(scan: string): HandoverPackage | undefined {
  const q = scan.trim().toLowerCase()
  if (!q) return undefined
  return demoScanPackages.find(
    (p) =>
      p.packageCode.toLowerCase() === q ||
      p.trackingCode.toLowerCase() === q ||
      p.outboundCode.toLowerCase() === q ||
      p.partnerOrCode.toLowerCase() === q,
  )
}

import { getOutboundRequest } from './outboundRequests'

export function isOutboundCancelled(outboundCode: string) {
  return getOutboundRequest(outboundCode)?.status === 'cancelled'
}

export function listCancelledPackagesInSession(packages: HandoverPackage[]) {
  return packages.filter((p) => isOutboundCancelled(p.outboundCode))
}

export function buildOutboundSummaries(packages: HandoverPackage[]) {
  const map = new Map<
    string,
    { outboundCode: string; sessionPackages: number; totalPackages: number }
  >()
  for (const pkg of packages) {
    const cur = map.get(pkg.outboundCode) || {
      outboundCode: pkg.outboundCode,
      sessionPackages: 0,
      totalPackages: 1,
    }
    cur.sessionPackages += 1
    cur.totalPackages = Math.max(cur.totalPackages, cur.sessionPackages)
    map.set(pkg.outboundCode, cur)
  }
  return Array.from(map.values()).map((row) => {
    const cancelled = isOutboundCancelled(row.outboundCode)
    return {
      outboundCode: row.outboundCode,
      remainingPackages: Math.max(0, row.totalPackages - row.sessionPackages),
      sessionPackages: row.sessionPackages,
      totalPackages: row.totalPackages,
      processingStatus: cancelled ? ('Đã hủy' as const) : ('Bình thường' as const),
      cancelled,
    }
  })
}

export function removePackagesFromSession(
  session: CarrierHandoverSession,
  predicate: (pkg: HandoverPackage) => boolean,
) {
  const packages = session.packages.filter((p) => !predicate(p))
  const outboundCodes = new Set(packages.map((p) => p.outboundCode))
  return {
    ...session,
    packages,
    packageCount: packages.length,
    outboundCount: outboundCodes.size,
  }
}
