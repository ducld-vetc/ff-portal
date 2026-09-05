import { listInboundRequests, type InboundRequest } from './inboundRequests'
import {
  demoScanPackages,
  findDemoPackage,
  isOutboundCancelled,
  type HandoverPackage,
  type HandoverSessionType,
} from './carrierHandovers'
import { getOutboundRequest, listOutboundRequests, type OutboundRequest } from './outboundRequests'

/** Cột template import phiên bàn giao */
export const handoverImportColumns = [
  { key: 'code', header: 'Ma', required: true, hint: 'Mã OR / OR đối tác / vận đơn / kiện / IR' },
  { key: 'outbound_code', header: 'Ma_OR', required: false, hint: 'Ưu tiên nếu có' },
  { key: 'partner_or_code', header: 'Ma_OR_doi_tac', required: false, hint: '' },
  { key: 'tracking_code', header: 'Ma_van_don', required: false, hint: '' },
  { key: 'package_code', header: 'Ma_kien', required: false, hint: '' },
  { key: 'product_qty', header: 'SL_san_pham', required: false, hint: 'Mặc định theo OR/IR' },
  { key: 'partner_name', header: 'Doi_tac', required: false, hint: '' },
  { key: 'return_type', header: 'Loai_tra_hang', required: false, hint: 'Chỉ phiên nhận' },
  { key: 'condition', header: 'Tinh_trang', required: false, hint: 'Chỉ phiên nhận' },
] as const

type ColKey = (typeof handoverImportColumns)[number]['key']

const headerAlias: Record<string, ColKey> = {
  ma: 'code',
  code: 'code',
  ma_or: 'outbound_code',
  outbound_code: 'outbound_code',
  outboundcode: 'outbound_code',
  ma_or_doi_tac: 'partner_or_code',
  partner_or_code: 'partner_or_code',
  partnerorcode: 'partner_or_code',
  ma_van_don: 'tracking_code',
  tracking_code: 'tracking_code',
  trackingcode: 'tracking_code',
  ma_kien: 'package_code',
  package_code: 'package_code',
  packagecode: 'package_code',
  sl_san_pham: 'product_qty',
  product_qty: 'product_qty',
  qty: 'product_qty',
  doi_tac: 'partner_name',
  partner_name: 'partner_name',
  loai_tra_hang: 'return_type',
  return_type: 'return_type',
  tinh_trang: 'condition',
  condition: 'condition',
  ma_ir: 'code',
  ir: 'code',
}

function normalizeHeader(raw: string) {
  return raw
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function escapeCsv(value: string | number) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function buildHandoverImportTemplateCsv(sessionType: HandoverSessionType = 'delivery') {
  const headers = handoverImportColumns.map((c) => c.header)
  const samples =
    sessionType === 'receipt'
      ? [
          ['ORHACWBMUP26917', 'ORHACWBMUP26917', 'HAC-WBM-UP-26917', '802789820795', 'PGHACWBMUP269170001', '2', 'HAC - CÔNG TY TNHH HAC RETAIL', 'Hàng trả', 'Tốt'],
          ['IRDDBQUB8864', '', '', '', '', '', '', 'Hàng trả', 'Tốt'],
        ]
      : [
          ['ORHACWBMUP26917', 'ORHACWBMUP26917', 'HAC-WBM-UP-26917', '802789820795', 'PGHACWBMUP269170001', '2', 'HAC - CÔNG TY TNHH HAC RETAIL', '', ''],
          ['ORAZB6FB5XRW785', '', 'SHOPEE-99100', '', '', '', '', '', ''],
          ['JT889900112', '', '', 'JT889900112', '', '', '', '', ''],
          ['PGORHN01C88300001', '', '', '', 'PGORHN01C88300001', '', '', '', ''],
        ]
  const lines = [headers.map(escapeCsv).join(','), ...samples.map((r) => r.map(escapeCsv).join(','))]
  return `\uFEFF${lines.join('\n')}`
}

export function downloadHandoverImportTemplate(sessionType: HandoverSessionType = 'delivery') {
  const csv = buildHandoverImportTemplateCsv(sessionType)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download =
    sessionType === 'receipt'
      ? 'mau-import-phien-nhan-OR-IR.csv'
      : 'mau-import-phien-giao-OR.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const input = text.replace(/^\uFEFF/, '')

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]
    const next = input[i + 1]
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i += 1
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      row.push(cell)
      cell = ''
      continue
    }
    if (ch === '\n') {
      row.push(cell)
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
      cell = ''
      continue
    }
    if (ch === '\r') continue
    cell += ch
  }
  row.push(cell)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

export type HandoverImportRowError = { row: number; message: string }

export type HandoverImportPreview = {
  package: HandoverPackage
  source: 'demo' | 'outbound' | 'inbound' | 'row'
}

export type HandoverImportParseResult = {
  previews: HandoverImportPreview[]
  errors: HandoverImportRowError[]
  skippedRows: number
}

function packageFromOutbound(
  or: OutboundRequest,
  overrides?: Partial<HandoverPackage>,
): HandoverPackage {
  const productQty = or.lines.reduce((s, l) => s + l.qty, 0) || 1
  return {
    id: `imp-or-${or.code}-${Date.now()}`,
    partnerName: or.partnerName || or.storeName || or.warehouseName,
    outboundCode: or.code,
    partnerOrCode: or.partnerOrCode,
    trackingCode: or.trackingCode || overrides?.trackingCode || '',
    packageCode:
      overrides?.packageCode ||
      `PG${or.code.replace(/^OR/, '')}0001`,
    productQty: overrides?.productQty ?? productQty,
    ...overrides,
  }
}

function packageFromInbound(
  ir: InboundRequest,
  overrides?: Partial<HandoverPackage>,
): HandoverPackage {
  const productQty = ir.productQty || ir.lines.reduce((s, l) => s + l.qty, 0) || 1
  return {
    id: `imp-ir-${ir.code}-${Date.now()}`,
    partnerName: ir.partnerName || ir.ownerName || ir.supplier || '—',
    outboundCode: ir.referenceCode || ir.code,
    partnerOrCode: ir.partnerIrCode || ir.code,
    trackingCode: overrides?.trackingCode || '',
    packageCode: overrides?.packageCode || `PG${ir.code.replace(/^IR/, 'IR')}0001`,
    productQty: overrides?.productQty ?? productQty,
    returnType: overrides?.returnType || 'Hàng trả',
    condition: overrides?.condition || 'Tốt',
    ...overrides,
  }
}

function resolveCode(
  code: string,
  sessionType: HandoverSessionType,
  extras?: Partial<HandoverPackage>,
): { ok: true; preview: HandoverImportPreview } | { ok: false; message: string } {
  const q = code.trim()
  if (!q) return { ok: false, message: 'Thiếu mã' }

  const demo = findDemoPackage(q)
  if (demo) {
    if (isOutboundCancelled(demo.outboundCode)) {
      return { ok: false, message: `OR ${demo.outboundCode} đã hủy` }
    }
    return {
      ok: true,
      preview: {
        source: 'demo',
        package: {
          ...demo,
          id: `imp-${Date.now()}-${demo.packageCode}`,
          ...extras,
        },
      },
    }
  }

  const or =
    getOutboundRequest(q) ||
    listOutboundRequests().find(
      (r) =>
        r.code.toLowerCase() === q.toLowerCase() ||
        r.partnerOrCode.toLowerCase() === q.toLowerCase() ||
        (r.trackingCode || '').toLowerCase() === q.toLowerCase(),
    )
  if (or) {
    if (or.status === 'cancelled') {
      return { ok: false, message: `OR ${or.code} đã hủy` }
    }
    return {
      ok: true,
      preview: { source: 'outbound', package: packageFromOutbound(or, extras) },
    }
  }

  if (sessionType === 'receipt') {
    const ir =
      listInboundRequests().find(
        (r) =>
          r.code.toLowerCase() === q.toLowerCase() ||
          r.partnerIrCode.toLowerCase() === q.toLowerCase() ||
          (r.referenceCode || '').toLowerCase() === q.toLowerCase(),
      ) || undefined
    if (ir) {
      return {
        ok: true,
        preview: { source: 'inbound', package: packageFromInbound(ir, extras) },
      }
    }
  }

  return {
    ok: false,
    message: `Không tìm thấy OR/kiện/vận đơn${sessionType === 'receipt' ? '/IR' : ''}: ${q}`,
  }
}

export function parseHandoverImportCsv(
  text: string,
  sessionType: HandoverSessionType,
): HandoverImportParseResult {
  const table = parseCsv(text)
  if (table.length < 2) {
    return {
      previews: [],
      errors: [{ row: 1, message: 'File trống hoặc thiếu dòng dữ liệu' }],
      skippedRows: 0,
    }
  }

  const headerCells = table[0].map(normalizeHeader)
  const colIndex = new Map<ColKey, number>()
  headerCells.forEach((h, i) => {
    const key = headerAlias[h]
    if (key) colIndex.set(key, i)
  })

  // Cho phép file 1 cột không header: mỗi dòng 1 mã
  const looksLikeDataFirst =
    !colIndex.has('code') &&
    !colIndex.has('outbound_code') &&
    !colIndex.has('package_code') &&
    !colIndex.has('tracking_code') &&
    !colIndex.has('partner_or_code')

  const get = (cells: string[], key: ColKey) => {
    const idx = colIndex.get(key)
    if (idx == null) return ''
    return (cells[idx] ?? '').trim()
  }

  const errors: HandoverImportRowError[] = []
  const previews: HandoverImportPreview[] = []
  const seenPackage = new Set<string>()
  let skippedRows = 0

  const startRow = looksLikeDataFirst ? 0 : 1
  if (looksLikeDataFirst) {
    // treat entire file as codes
  } else if (
    !colIndex.has('code') &&
    !colIndex.has('outbound_code') &&
    !colIndex.has('package_code') &&
    !colIndex.has('tracking_code') &&
    !colIndex.has('partner_or_code')
  ) {
    return {
      previews: [],
      errors: [{ row: 1, message: 'Thiếu cột Ma / Ma_OR / Ma_kien / Ma_van_don / Ma_OR_doi_tac' }],
      skippedRows: 0,
    }
  }

  for (let r = startRow; r < table.length; r += 1) {
    const cells = table[r]
    const rowNo = r + 1

    if (looksLikeDataFirst) {
      const code = (cells[0] || '').trim()
      if (!code || normalizeHeader(code) === 'ma') {
        skippedRows += 1
        continue
      }
      const resolved = resolveCode(code, sessionType)
      if (!resolved.ok) {
        errors.push({ row: rowNo, message: resolved.message })
        continue
      }
      if (seenPackage.has(resolved.preview.package.packageCode)) {
        errors.push({
          row: rowNo,
          message: `Trùng mã kiện ${resolved.preview.package.packageCode}`,
        })
        continue
      }
      seenPackage.add(resolved.preview.package.packageCode)
      previews.push(resolved.preview)
      continue
    }

    const code =
      get(cells, 'code') ||
      get(cells, 'package_code') ||
      get(cells, 'tracking_code') ||
      get(cells, 'outbound_code') ||
      get(cells, 'partner_or_code')

    if (!code) {
      skippedRows += 1
      continue
    }

    const qtyRaw = get(cells, 'product_qty')
    const qty = qtyRaw ? Number(qtyRaw) : undefined
    const extras: Partial<HandoverPackage> = {
      outboundCode: get(cells, 'outbound_code') || undefined,
      partnerOrCode: get(cells, 'partner_or_code') || undefined,
      trackingCode: get(cells, 'tracking_code') || undefined,
      packageCode: get(cells, 'package_code') || undefined,
      partnerName: get(cells, 'partner_name') || undefined,
      productQty: qty && Number.isFinite(qty) && qty > 0 ? qty : undefined,
      returnType: get(cells, 'return_type') || undefined,
      condition: get(cells, 'condition') || undefined,
    }

    const resolved = resolveCode(code, sessionType, extras)
    if (!resolved.ok) {
      errors.push({ row: rowNo, message: resolved.message })
      continue
    }

    const pkg = {
      ...resolved.preview.package,
      ...Object.fromEntries(
        Object.entries(extras).filter(([, v]) => v !== undefined && v !== ''),
      ),
      id: `imp-${Date.now()}-${rowNo}`,
    } as HandoverPackage

    if (seenPackage.has(pkg.packageCode)) {
      errors.push({ row: rowNo, message: `Trùng mã kiện ${pkg.packageCode}` })
      continue
    }
    seenPackage.add(pkg.packageCode)
    previews.push({ ...resolved.preview, package: pkg })
  }

  return { previews, errors, skippedRows }
}

export function mergeImportedPackages(
  existing: HandoverPackage[],
  incoming: HandoverPackage[],
) {
  const seen = new Set(existing.map((p) => p.packageCode.toUpperCase()))
  const added: HandoverPackage[] = []
  for (const pkg of incoming) {
    const key = pkg.packageCode.toUpperCase()
    if (seen.has(key)) continue
    seen.add(key)
    added.push(pkg)
  }
  return { next: [...added, ...existing], addedCount: added.length, skippedDup: incoming.length - added.length }
}

export const handoverImportDemoHints = demoScanPackages.slice(0, 4).map((p) => p.outboundCode)
