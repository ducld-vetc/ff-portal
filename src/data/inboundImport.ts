import { seedCatalogProducts } from './productCatalog'
import {
  generateInboundCode,
  inboundWarehouseOptions,
  upsertInboundRequest,
  type GoodsCondition,
  type InboundLine,
  type InboundRequest,
  type InboundType,
} from './inboundRequests'

/** Cột template — thứ tự cố định khi tải mẫu */
export const inboundImportColumns = [
  { key: 'partner_ir_code', header: 'Ma_IR_doi_tac', required: true, hint: 'Gom các dòng cùng mã thành 1 phiếu' },
  { key: 'warehouse_code', header: 'Ma_kho', required: true, hint: 'VD: KBL, WH-HCM-01' },
  { key: 'type', header: 'Loai', required: true, hint: 'inbound | return | transfer' },
  { key: 'goods_condition', header: 'TTHH', required: true, hint: 'new | used | damaged' },
  { key: 'supplier', header: 'Nha_cung_cap', required: false, hint: '' },
  { key: 'expected_at', header: 'Ngay_du_kien', required: true, hint: 'YYYY-MM-DD hoặc DD/MM/YYYY' },
  { key: 'reference_code', header: 'Ma_tham_chieu', required: false, hint: 'PO / OR…' },
  { key: 'partner_name', header: 'Doi_tac', required: false, hint: '' },
  { key: 'driver', header: 'Tai_xe', required: false, hint: '' },
  { key: 'vehicle_no', header: 'So_xe', required: false, hint: '' },
  { key: 'container_no', header: 'So_container', required: false, hint: '' },
  { key: 'note', header: 'Ghi_chu', required: false, hint: '' },
  { key: 'sku', header: 'SKU', required: false, hint: 'Bắt buộc nếu thiếu SKU_doi_tac' },
  { key: 'partner_sku', header: 'SKU_doi_tac', required: false, hint: 'Bắt buộc nếu thiếu SKU' },
  { key: 'qty', header: 'So_luong', required: true, hint: 'Số nguyên > 0' },
  { key: 'unit_price', header: 'Don_gia', required: false, hint: 'Mặc định 0' },
  { key: 'unit', header: 'DVT', required: false, hint: 'Mặc định theo catalog' },
  { key: 'serials', header: 'Serial', required: false, hint: 'Nhiều serial cách nhau bởi |' },
] as const

export type InboundImportColumnKey = (typeof inboundImportColumns)[number]['key']

const headerAlias: Record<string, InboundImportColumnKey> = {
  ma_ir_doi_tac: 'partner_ir_code',
  partner_ir_code: 'partner_ir_code',
  partnerircode: 'partner_ir_code',
  ma_kho: 'warehouse_code',
  warehouse_code: 'warehouse_code',
  warehousecode: 'warehouse_code',
  loai: 'type',
  type: 'type',
  tthh: 'goods_condition',
  goods_condition: 'goods_condition',
  goodscondition: 'goods_condition',
  tinh_trang_hang_hoa: 'goods_condition',
  nha_cung_cap: 'supplier',
  supplier: 'supplier',
  ngay_du_kien: 'expected_at',
  expected_at: 'expected_at',
  expectedat: 'expected_at',
  ma_tham_chieu: 'reference_code',
  reference_code: 'reference_code',
  referencecode: 'reference_code',
  doi_tac: 'partner_name',
  partner_name: 'partner_name',
  partnername: 'partner_name',
  tai_xe: 'driver',
  driver: 'driver',
  so_xe: 'vehicle_no',
  vehicle_no: 'vehicle_no',
  vehicleno: 'vehicle_no',
  so_container: 'container_no',
  container_no: 'container_no',
  containerno: 'container_no',
  ghi_chu: 'note',
  note: 'note',
  sku: 'sku',
  sku_doi_tac: 'partner_sku',
  partner_sku: 'partner_sku',
  partnersku: 'partner_sku',
  so_luong: 'qty',
  qty: 'qty',
  quantity: 'qty',
  don_gia: 'unit_price',
  unit_price: 'unit_price',
  unitprice: 'unit_price',
  dvt: 'unit',
  unit: 'unit',
  serial: 'serials',
  serials: 'serials',
}

function normalizeHeader(raw: string): string {
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

/** Mẫu CSV (UTF-8 BOM) — mở được bằng Excel */
export function buildInboundImportTemplateCsv() {
  const headers = inboundImportColumns.map((c) => c.header)
  const sampleRows: string[][] = [
    [
      'IMP-2026-001',
      'WH-HCM-01',
      'inbound',
      'new',
      'EverCharge Supplier',
      '2026-09-10',
      'PO-EC-9001',
      'EVC - CÔNG TY TNHH EVERCHARGE',
      '',
      '',
      '',
      'Import mẫu phiếu 1',
      'SKU-CHARGER-20W',
      'EVC-CHG-20',
      '50',
      '85000',
      'Cái',
      '',
    ],
    [
      'IMP-2026-001',
      'WH-HCM-01',
      'inbound',
      'new',
      'EverCharge Supplier',
      '2026-09-10',
      'PO-EC-9001',
      'EVC - CÔNG TY TNHH EVERCHARGE',
      '',
      '',
      '',
      'Import mẫu phiếu 1',
      'SKU-CABLE-C-C-1M',
      'EVC-CABLE-01',
      '30',
      '45000',
      'Cái',
      '',
    ],
    [
      'IMP-2026-002',
      'KBL',
      'inbound',
      'new',
      'SHEIN',
      '10/09/2026',
      'PO-SHEIN-IMP',
      'BLN - CÔNG TY TNHH BELLA ĐÀ LẠT',
      'Nguyen Van A',
      '51A-12345',
      '',
      'Import mẫu phiếu 2',
      'SKU-SERUM-30ML',
      'GM-SERUM-A',
      '5',
      '120000',
      'Cái',
      '',
    ],
  ]
  const lines = [headers.map(escapeCsv).join(','), ...sampleRows.map((row) => row.map(escapeCsv).join(','))]
  return `\uFEFF${lines.join('\n')}`
}

export function downloadInboundImportTemplate() {
  const csv = buildInboundImportTemplateCsv()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mau-yeu-cau-nhap-kho.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export type InboundImportRowError = {
  row: number
  message: string
}

export type InboundImportPreview = {
  partnerIrCode: string
  warehouseCode: string
  warehouseName: string
  type: InboundType
  goodsCondition: GoodsCondition
  supplier: string
  expectedAt: string
  lineCount: number
  productQty: number
  request: InboundRequest
}

export type InboundImportParseResult = {
  previews: InboundImportPreview[]
  errors: InboundImportRowError[]
  skippedRows: number
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

function parseDate(raw: string): string | null {
  const v = raw.trim()
  if (!v) return null
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(v)
  if (dmy) {
    const dd = dmy[1].padStart(2, '0')
    const mm = dmy[2].padStart(2, '0')
    return `${dmy[3]}-${mm}-${dd}`
  }
  return null
}

function parseType(raw: string): InboundType | null {
  const v = normalizeHeader(raw)
  if (v === 'inbound' || v === 'nhap_kho' || v === 'nhap') return 'inbound'
  if (v === 'return' || v === 'hang_tra' || v === 'tra_hang') return 'return'
  if (v === 'transfer' || v === 'nhap_dieu_chuyen' || v === 'dieu_chuyen') return 'transfer'
  return null
}

function parseCondition(raw: string): GoodsCondition | null {
  const v = normalizeHeader(raw)
  if (v === 'new' || v === 'moi') return 'new'
  if (v === 'used' || v === 'da_qua_su_dung' || v === 'cu') return 'used'
  if (v === 'damaged' || v === 'hu_hong' || v === 'hong') return 'damaged'
  return null
}

function resolveProduct(sku: string, partnerSku: string) {
  const skuQ = sku.trim().toLowerCase()
  const partnerQ = partnerSku.trim().toLowerCase()
  return seedCatalogProducts.find((p) => {
    if (skuQ && p.sku.toLowerCase() === skuQ) return true
    if (partnerQ && (p.partnerSku || '').toLowerCase() === partnerQ) return true
    return false
  })
}

type DraftLine = {
  row: number
  partnerIrCode: string
  warehouseCode: string
  type: InboundType
  goodsCondition: GoodsCondition
  supplier: string
  expectedAt: string
  referenceCode: string
  partnerName: string
  driver: string
  vehicleNo: string
  containerNo: string
  note: string
  line: InboundLine
}

export function parseInboundImportCsv(text: string): InboundImportParseResult {
  const table = parseCsv(text)
  if (table.length < 2) {
    return { previews: [], errors: [{ row: 1, message: 'File trống hoặc thiếu dòng dữ liệu' }], skippedRows: 0 }
  }

  const headerCells = table[0].map(normalizeHeader)
  const colIndex = new Map<InboundImportColumnKey, number>()
  headerCells.forEach((h, i) => {
    const key = headerAlias[h]
    if (key) colIndex.set(key, i)
  })

  const missingRequiredHeaders = inboundImportColumns
    .filter((c) => c.required && !colIndex.has(c.key))
    .map((c) => c.header)
  if (missingRequiredHeaders.length) {
    return {
      previews: [],
      errors: [
        {
          row: 1,
          message: `Thiếu cột bắt buộc: ${missingRequiredHeaders.join(', ')}`,
        },
      ],
      skippedRows: 0,
    }
  }
  if (!colIndex.has('sku') && !colIndex.has('partner_sku')) {
    return {
      previews: [],
      errors: [{ row: 1, message: 'Cần có cột SKU hoặc SKU_doi_tac' }],
      skippedRows: 0,
    }
  }

  const get = (cells: string[], key: InboundImportColumnKey) => {
    const idx = colIndex.get(key)
    if (idx == null) return ''
    return (cells[idx] ?? '').trim()
  }

  const errors: InboundImportRowError[] = []
  const drafts: DraftLine[] = []
  let skippedRows = 0

  for (let r = 1; r < table.length; r += 1) {
    const cells = table[r]
    const rowNo = r + 1
    const partnerIrCode = get(cells, 'partner_ir_code')
    const warehouseCode = get(cells, 'warehouse_code')
    const typeRaw = get(cells, 'type')
    const conditionRaw = get(cells, 'goods_condition')
    const expectedRaw = get(cells, 'expected_at')
    const sku = get(cells, 'sku')
    const partnerSku = get(cells, 'partner_sku')
    const qtyRaw = get(cells, 'qty')

    if (!partnerIrCode && !warehouseCode && !sku && !partnerSku && !qtyRaw) {
      skippedRows += 1
      continue
    }

    const rowErrors: string[] = []
    if (!partnerIrCode) rowErrors.push('Thiếu Ma_IR_doi_tac')
    if (!warehouseCode) rowErrors.push('Thiếu Ma_kho')
    const type = parseType(typeRaw)
    if (!type) rowErrors.push('Loai không hợp lệ (inbound|return|transfer)')
    const goodsCondition = parseCondition(conditionRaw)
    if (!goodsCondition) rowErrors.push('TTHH không hợp lệ (new|used|damaged)')
    const expectedAt = parseDate(expectedRaw)
    if (!expectedAt) rowErrors.push('Ngay_du_kien không hợp lệ')
    const qty = Number(qtyRaw)
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
      rowErrors.push('So_luong phải là số nguyên > 0')
    }
    if (!sku && !partnerSku) rowErrors.push('Thiếu SKU hoặc SKU_doi_tac')

    const wh = inboundWarehouseOptions.find((w) => w.value === warehouseCode)
    if (warehouseCode && !wh) rowErrors.push(`Mã kho không hỗ trợ: ${warehouseCode}`)

    const product = resolveProduct(sku, partnerSku)
    if (!product && (sku || partnerSku)) {
      rowErrors.push(`Không tìm thấy SP trong catalog (SKU=${sku || '—'}, SKU ĐT=${partnerSku || '—'})`)
    }

    const unitPriceRaw = get(cells, 'unit_price')
    const unitPrice = unitPriceRaw ? Number(unitPriceRaw) : 0
    if (unitPriceRaw && !Number.isFinite(unitPrice)) rowErrors.push('Don_gia không hợp lệ')

    const serialsRaw = get(cells, 'serials')
    const serials = serialsRaw
      ? serialsRaw
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined
    if (serials && serials.length !== qty && Number.isInteger(qty) && qty > 0) {
      rowErrors.push(`Số serial (${serials.length}) phải khớp So_luong (${qty})`)
    }

    if (rowErrors.length || !type || !goodsCondition || !expectedAt || !product || !wh) {
      errors.push({ row: rowNo, message: rowErrors.join('; ') || 'Dòng không hợp lệ' })
      continue
    }

    drafts.push({
      row: rowNo,
      partnerIrCode,
      warehouseCode: wh.value,
      type,
      goodsCondition,
      supplier: get(cells, 'supplier'),
      expectedAt,
      referenceCode: get(cells, 'reference_code'),
      partnerName: get(cells, 'partner_name'),
      driver: get(cells, 'driver'),
      vehicleNo: get(cells, 'vehicle_no'),
      containerNo: get(cells, 'container_no'),
      note: get(cells, 'note'),
      line: {
        id: `imp-line-${rowNo}`,
        productId: product.id,
        name: product.name,
        partnerSku: product.partnerSku || partnerSku,
        sku: product.sku,
        unit: get(cells, 'unit') || product.units[0] || 'PCS',
        imageUrl: product.imageUrl,
        qty,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        serials,
      },
    })
  }

  const groups = new Map<string, DraftLine[]>()
  for (const draft of drafts) {
    const key = `${draft.partnerIrCode}||${draft.warehouseCode}`
    const list = groups.get(key) || []
    list.push(draft)
    groups.set(key, list)
  }

  const previews: InboundImportPreview[] = []
  for (const [, group] of groups) {
    const head = group[0]
    const headerMismatch = group.find(
      (g) =>
        g.type !== head.type ||
        g.goodsCondition !== head.goodsCondition ||
        g.expectedAt !== head.expectedAt,
    )
    if (headerMismatch) {
      errors.push({
        row: headerMismatch.row,
        message: `Dòng lệch thông tin phiếu so với nhóm ${head.partnerIrCode} (Loai/TTHH/Ngày dự kiến phải giống nhau)`,
      })
      continue
    }

    const productIds = new Set<string>()
    for (const g of group) {
      if (productIds.has(g.line.productId)) {
        errors.push({
          row: g.row,
          message: `Trùng sản phẩm ${g.line.sku} trong cùng phiếu ${head.partnerIrCode}`,
        })
      }
      productIds.add(g.line.productId)
    }

    const lines = group.map((g, index) => ({
      ...g.line,
      id: `imp-${Date.now()}-${head.partnerIrCode}-${index + 1}`,
    }))
    const productQty = lines.reduce((s, l) => s + l.qty, 0)
    const wh = inboundWarehouseOptions.find((w) => w.value === head.warehouseCode)!
    const request: InboundRequest = {
      id: `ir-imp-${Date.now()}-${previews.length + 1}`,
      code: generateInboundCode(),
      partnerIrCode: head.partnerIrCode,
      partnerName: head.partnerName || undefined,
      country: 'VN',
      warehouseCode: head.warehouseCode,
      warehouseName: wh.label,
      status: 'new',
      skuCount: lines.length,
      productQty,
      receivedQty: 0,
      storedQty: 0,
      goodsCondition: head.goodsCondition,
      supplier: head.supplier,
      type: head.type,
      expectedAt: head.expectedAt,
      receivedAt: null,
      createdAt: new Date().toISOString(),
      referenceCode: head.referenceCode || undefined,
      driver: head.driver || undefined,
      vehicleNo: head.vehicleNo || undefined,
      containerNo: head.containerNo || undefined,
      note: head.note || undefined,
      ownerName: 'Import',
      ownerPhone: '—',
      lines,
    }
    previews.push({
      partnerIrCode: head.partnerIrCode,
      warehouseCode: head.warehouseCode,
      warehouseName: wh.label,
      type: head.type,
      goodsCondition: head.goodsCondition,
      supplier: head.supplier,
      expectedAt: head.expectedAt,
      lineCount: lines.length,
      productQty,
      request,
    })
  }

  return { previews, errors, skippedRows }
}

export function commitInboundImport(previews: InboundImportPreview[]) {
  const created: InboundRequest[] = []
  for (const preview of previews) {
    const next: InboundRequest = {
      ...preview.request,
      id: `ir-imp-${Date.now()}-${created.length + 1}`,
      code: generateInboundCode(),
      createdAt: new Date().toISOString(),
    }
    upsertInboundRequest(next)
    created.push(next)
  }
  return created
}
