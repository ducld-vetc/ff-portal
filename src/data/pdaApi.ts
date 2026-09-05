/**
 * PDA API — mock client layer (Phase 1).
 * Maps to `/api/pda/*` contract in document/pda/api-design.md
 */
import {
  createCarrierHandover,
  findDemoPackage,
  getCarrierHandover,
  isOutboundCancelled,
  listCancelledPackagesInSession,
  upsertCarrierHandover,
  type CarrierHandoverSession,
} from './carrierHandovers'
import {
  getInboundRequest,
  listInboundRequests,
  upsertInboundRequest,
  type InboundRequest,
} from './inboundRequests'
import {
  getPickList,
  listPickLists,
  upsertPickList,
  type PickList,
  type PickListLine,
} from './pickingLists'
import { seedProductLocations, type ProductLocationRow } from './productLocations'

/** Canonical route paths for PDA REST API */
export const PDA_API_ROUTES = {
  auth: {
    login: '/api/pda/auth/login',
    logout: '/api/pda/auth/logout',
    me: '/api/pda/auth/me',
  },
  session: {
    start: '/api/pda/session/start',
    active: '/api/pda/session/active',
  },
  inbound: {
    lookup: '/api/pda/inbound/lookup',
    checkIn: (irId: string) => `/api/pda/inbound/${irId}/check-in`,
    receiveSession: (sessionId: string) => `/api/pda/inbound/sessions/${sessionId}`,
    receiveLine: (sessionId: string) => `/api/pda/inbound/sessions/${sessionId}/receive-line`,
    complete: (sessionId: string) => `/api/pda/inbound/sessions/${sessionId}/complete`,
  },
  putaway: {
    tasks: '/api/pda/putaway/tasks',
    task: (taskId: string) => `/api/pda/putaway/tasks/${taskId}`,
    confirm: (taskId: string) => `/api/pda/putaway/tasks/${taskId}/confirm`,
    complete: (taskId: string) => `/api/pda/putaway/tasks/${taskId}/complete`,
  },
  pick: {
    tasks: '/api/pda/pick/tasks',
    start: (pickListId: string) => `/api/pda/pick/tasks/${pickListId}/start`,
    assignTote: (sessionId: string) => `/api/pda/pick/sessions/${sessionId}/assign-tote`,
    nextLine: (sessionId: string) => `/api/pda/pick/sessions/${sessionId}/next-line`,
    pickLine: (sessionId: string) => `/api/pda/pick/sessions/${sessionId}/pick-line`,
    complete: (sessionId: string) => `/api/pda/pick/sessions/${sessionId}/complete`,
  },
  pack: {
    lookup: '/api/pda/pack/lookup',
    start: '/api/pda/pack/sessions/start',
    scanProduct: (sessionId: string) => `/api/pda/pack/sessions/${sessionId}/scan-product`,
    complete: (sessionId: string) => `/api/pda/pack/sessions/${sessionId}/complete`,
    printLabel: (sessionId: string) => `/api/pda/pack/sessions/${sessionId}/print-label`,
  },
  handover: {
    sessions: '/api/pda/handover/sessions',
    scan: (sessionId: string) => `/api/pda/handover/sessions/${sessionId}/scan`,
    confirm: (sessionId: string) => `/api/pda/handover/sessions/${sessionId}/confirm`,
  },
  inquiry: {
    scan: '/api/pda/inquiry/scan',
    sku: (sku: string) => `/api/pda/inquiry/sku/${sku}`,
    location: (code: string) => `/api/pda/inquiry/location/${code}`,
    package: (code: string) => `/api/pda/inquiry/package/${code}`,
  },
} as const

export type PdaApiErrorCode =
  | 'IR_NOT_FOUND'
  | 'IR_INVALID_STATUS'
  | 'SKU_NOT_ON_IR'
  | 'BIN_MISMATCH'
  | 'SKU_MISMATCH'
  | 'QTY_EXCEEDS'
  | 'PACKAGE_NOT_READY'
  | 'PACKAGE_DUPLICATE'
  | 'PACKAGE_NOT_FOUND'
  | 'TOTE_NOT_FOUND'
  | 'PICK_LIST_NOT_FOUND'
  | 'SESSION_NOT_FOUND'
  | 'SESSION_CLOSED'
  | 'OR_CANCELLED'
  | 'HAS_CANCELLED_OR'
  | 'EMPTY_SESSION'

export type PdaApiResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: { code: PdaApiErrorCode; message: string } }

function ok<T>(data: T): PdaApiResult<T> {
  return { data }
}

function fail<T>(code: PdaApiErrorCode, message: string): PdaApiResult<T> {
  return { error: { code, message } }
}

export type ReceiveSession = {
  id: string
  irId: string
  warehouseCode: string
  operatorId: string
  startedAt: string
  lineReceived: Record<string, number>
}

export type PickSession = {
  id: string
  pickListId: string
  toteCode?: string
  operatorId: string
  startedAt: string
}

export type PackSession = {
  id: string
  toteCode: string
  outboundCode: string
  scannedSkus: Record<string, number>
  operatorId: string
  startedAt: string
}

export type PutawayTask = {
  id: string
  irId: string
  irCode: string
  sku: string
  qtyRemaining: number
  suggestedBin: string
  status: 'open' | 'completed'
}

let receiveSessions: ReceiveSession[] = []
let pickSessions: PickSession[] = []
let packSessions: PackSession[] = []
let putawayTasks: PutawayTask[] = []

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function pdaLookupInbound(code: string): PdaApiResult<InboundRequest> {
  const q = code.trim()
  const hit =
    getInboundRequest(q) || listInboundRequests().find((ir) => ir.partnerIrCode === q)
  if (!hit) return fail('IR_NOT_FOUND', 'Không tìm thấy yêu cầu nhập kho')
  return ok(hit)
}

export function pdaCheckInInbound(
  irId: string,
  warehouseCode: string,
  operatorId: string,
): PdaApiResult<{ ir: InboundRequest; session: ReceiveSession }> {
  const ir = getInboundRequest(irId)
  if (!ir) return fail('IR_NOT_FOUND', 'Không tìm thấy IR')
  if (ir.status !== 'new') return fail('IR_INVALID_STATUS', 'IR không ở trạng thái Mới')
  if (ir.warehouseCode !== warehouseCode) {
    return fail('IR_INVALID_STATUS', 'IR không thuộc kho đang làm việc')
  }
  const nextIr: InboundRequest = {
    ...ir,
    status: 'processing',
    lastCheckInAt: new Date().toISOString(),
  }
  upsertInboundRequest(nextIr)
  const session: ReceiveSession = {
    id: newId('rcv'),
    irId: ir.id,
    warehouseCode,
    operatorId,
    startedAt: new Date().toISOString(),
    lineReceived: {},
  }
  receiveSessions = [session, ...receiveSessions]
  return ok({ ir: nextIr, session })
}

export function pdaReceiveLine(
  sessionId: string,
  input: { sku: string; qty: number },
): PdaApiResult<InboundRequest> {
  const session = receiveSessions.find((s) => s.id === sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên nhận hàng')
  const ir = getInboundRequest(session.irId)
  if (!ir) return fail('IR_NOT_FOUND', 'Không tìm thấy IR')
  const line = ir.lines.find((l) => l.sku === input.sku || l.partnerSku === input.sku)
  if (!line) return fail('SKU_NOT_ON_IR', 'SKU không có trong phiếu nhập')
  const prev = session.lineReceived[line.id] || 0
  if (prev + input.qty > line.qty) {
    return fail('QTY_EXCEEDS', 'Vượt số lượng khai báo trên IR')
  }
  session.lineReceived[line.id] = prev + input.qty
  const receivedQty = Object.values(session.lineReceived).reduce((a, b) => a + b, 0)
  const nextIr: InboundRequest = { ...ir, receivedQty }
  upsertInboundRequest(nextIr)
  return ok(nextIr)
}

export function pdaCompleteInbound(sessionId: string): PdaApiResult<InboundRequest> {
  const session = receiveSessions.find((s) => s.id === sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên nhận hàng')
  const ir = getInboundRequest(session.irId)
  if (!ir) return fail('IR_NOT_FOUND', 'Không tìm thấy IR')
  const nextIr: InboundRequest = {
    ...ir,
    status: 'received',
    receivedQty: ir.productQty,
    receivedAt: new Date().toISOString().slice(0, 10),
  }
  upsertInboundRequest(nextIr)
  receiveSessions = receiveSessions.filter((s) => s.id !== sessionId)
  putawayTasks = [
    ...ir.lines.map((line, i) => ({
      id: newId('put'),
      irId: ir.id,
      irCode: ir.code,
      sku: line.sku,
      qtyRemaining: line.qty,
      suggestedBin: `A-01-0${i + 1}-01`,
      status: 'open' as const,
    })),
    ...putawayTasks,
  ]
  return ok(nextIr)
}

export function pdaListPutawayTasks(_warehouseCode: string) {
  return ok(putawayTasks.filter((t) => t.status === 'open'))
}

export function pdaConfirmPutaway(
  taskId: string,
  input: { binCode: string; sku: string; qty: number },
): PdaApiResult<PutawayTask> {
  const task = putawayTasks.find((t) => t.id === taskId)
  if (!task) return fail('SESSION_NOT_FOUND', 'Không tìm thấy task putaway')
  if (task.sku !== input.sku) return fail('SKU_MISMATCH', 'SKU không khớp task')
  if (input.qty > task.qtyRemaining) return fail('QTY_EXCEEDS', 'Vượt SL cần putaway')
  task.qtyRemaining -= input.qty
  if (task.qtyRemaining <= 0) task.status = 'completed'
  const ir = getInboundRequest(task.irId)
  if (ir) {
    upsertInboundRequest({
      ...ir,
      storedQty: (ir.storedQty || 0) + input.qty,
    })
  }
  return ok(task)
}

export function pdaListPickTasks(assignee: string): PdaApiResult<PickList[]> {
  const q = assignee.trim().toLowerCase()
  const tasks = listPickLists({ b2bOnly: false }).filter((pl) => {
    if (pl.status !== 'ready' && pl.status !== 'picking') return false
    // Phase 1 demo: hiện list chưa gán, hoặc gán đúng người, hoặc ready để test
    if (!pl.assignee) return true
    const a = pl.assignee.toLowerCase()
    if (!q) return true
    return a === q || a.includes(q) || q.includes(a)
  })
  // Fallback demo: nếu không khớp assignee, vẫn trả pick list ready (để test PDA)
  if (tasks.length === 0) {
    return ok(
      listPickLists({ b2bOnly: false }).filter(
        (pl) => pl.status === 'ready' || pl.status === 'picking',
      ),
    )
  }
  return ok(tasks)
}

export function pdaStartPickSession(
  pickListId: string,
  operatorId: string,
): PdaApiResult<{ pickList: PickList; session: PickSession }> {
  const pl = getPickList(pickListId)
  if (!pl) return fail('PICK_LIST_NOT_FOUND', 'Không tìm thấy pick list')
  const nextPl: PickList = { ...pl, status: 'picking', assignee: operatorId }
  upsertPickList(nextPl)
  const session: PickSession = {
    id: newId('pick'),
    pickListId: pl.id,
    operatorId,
    startedAt: new Date().toISOString(),
  }
  pickSessions = [session, ...pickSessions]
  return ok({ pickList: nextPl, session })
}

export function pdaGetPickSession(
  sessionId: string,
): PdaApiResult<{ session: PickSession; pickList: PickList }> {
  const session = pickSessions.find((s) => s.id === sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên lấy hàng')
  const pl = getPickList(session.pickListId)
  if (!pl) return fail('PICK_LIST_NOT_FOUND', 'Không tìm thấy pick list')
  return ok({ session, pickList: pl })
}

export function pdaFindPickSession(
  pickListId: string,
  operatorId?: string,
): PickSession | undefined {
  return pickSessions.find(
    (s) => s.pickListId === pickListId && (!operatorId || s.operatorId === operatorId),
  )
}

export function pdaNextPickLine(sessionId: string): PdaApiResult<PickListLine | null> {
  const session = pickSessions.find((s) => s.id === sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên lấy hàng')
  const pl = getPickList(session.pickListId)
  if (!pl) return fail('PICK_LIST_NOT_FOUND', 'Không tìm thấy pick list')
  const next = pl.lines.find((l) => l.pickedQty < l.qty) ?? null
  return ok(next)
}

export function pdaConfirmPickLine(
  sessionId: string,
  input: { lineId: string; binCode: string; sku: string; qty: number },
): PdaApiResult<PickList> {
  const session = pickSessions.find((s) => s.id === sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên lấy hàng')
  const pl = getPickList(session.pickListId)
  if (!pl) return fail('PICK_LIST_NOT_FOUND', 'Không tìm thấy pick list')
  const line = pl.lines.find((l) => l.id === input.lineId)
  if (!line) return fail('SKU_MISMATCH', 'Không tìm thấy dòng pick')
  if (line.location !== input.binCode) return fail('BIN_MISMATCH', 'Vị trí quét không khớp')
  if (line.sku !== input.sku) return fail('SKU_MISMATCH', 'SKU không khớp')
  if (line.pickedQty + input.qty > line.qty) return fail('QTY_EXCEEDS', 'Vượt SL cần lấy')
  const lines = pl.lines.map((l) =>
    l.id === line.id
      ? { ...l, pickedQty: l.pickedQty + input.qty, pickingDevice: session.toteCode }
      : l,
  )
  const nextPl = upsertPickList({ ...pl, lines })
  return ok(nextPl)
}

export function pdaAssignTote(sessionId: string, toteCode: string): PdaApiResult<PickSession> {
  const session = pickSessions.find((s) => s.id === sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên lấy hàng')
  session.toteCode = toteCode
  return ok(session)
}

export function pdaCompletePickSession(sessionId: string): PdaApiResult<PickList> {
  const session = pickSessions.find((s) => s.id === sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên lấy hàng')
  const pl = getPickList(session.pickListId)
  if (!pl) return fail('PICK_LIST_NOT_FOUND', 'Không tìm thấy pick list')
  const nextPl = upsertPickList({ ...pl, status: 'picked' })
  pickSessions = pickSessions.filter((s) => s.id !== sessionId)
  return ok(nextPl)
}

const demoTotePack: Record<
  string,
  { outboundCode: string; lines: { sku: string; qty: number; name: string }[] }
> = {
  'RNN.052': {
    outboundCode: 'ORHACWBMUP26917',
    lines: [{ sku: 'SKU-CHARGER-20W', qty: 2, name: 'Sạc nhanh 20W USB-C' }],
  },
}

export function pdaLookupTote(toteCode: string): PdaApiResult<{
  toteCode: string
  outboundCode: string
  lines: { sku: string; qty: number; name: string }[]
}> {
  const hit = demoTotePack[toteCode]
  if (!hit) return fail('TOTE_NOT_FOUND', 'Không tìm thấy tote hoặc chưa pick xong')
  return ok({ toteCode, ...hit })
}

export function pdaStartPackSession(toteCode: string, operatorId: string): PdaApiResult<PackSession> {
  const lookup = pdaLookupTote(toteCode)
  if (lookup.error) return lookup as PdaApiResult<PackSession>
  const session: PackSession = {
    id: newId('pack'),
    toteCode,
    outboundCode: lookup.data!.outboundCode,
    scannedSkus: {},
    operatorId,
    startedAt: new Date().toISOString(),
  }
  packSessions = [session, ...packSessions]
  return ok(session)
}

export function pdaCompletePack(
  sessionId: string,
): PdaApiResult<{ packageCode: string; trackingCode: string }> {
  const session = packSessions.find((s) => s.id === sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên đóng gói')
  const suffix = Math.floor(1000 + Math.random() * 9000)
  const packageCode = `PG${session.outboundCode.replace(/^OR/, '')}${suffix}`
  const trackingCode = `TRK${suffix}${Date.now().toString().slice(-6)}`
  packSessions = packSessions.filter((s) => s.id !== sessionId)
  return ok({ packageCode, trackingCode })
}

export function pdaHandoverScan(
  sessionId: string,
  scanValue: string,
  opts?: { returnType?: string; condition?: string },
): PdaApiResult<CarrierHandoverSession> {
  const session = getCarrierHandover(sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên bàn giao')
  if (session.status === 'handed_over' || session.status === 'cancelled') {
    return fail('SESSION_CLOSED', 'Phiên đã đóng — không thêm kiện')
  }
  const pkg = findDemoPackage(scanValue.trim())
  if (!pkg) return fail('PACKAGE_NOT_READY', 'Không tìm thấy kiện / OR / vận đơn')
  if (isOutboundCancelled(pkg.outboundCode)) {
    return fail('OR_CANCELLED', `OR ${pkg.outboundCode} đã hủy — không thêm vào phiên`)
  }
  if (session.packages.some((p) => p.packageCode === pkg.packageCode)) {
    return fail('PACKAGE_DUPLICATE', 'Kiện đã có trong phiên')
  }
  const added = {
    ...pkg,
    id: `pkg-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    ...(session.sessionType === 'receipt'
      ? {
          returnType: opts?.returnType || pkg.returnType || 'Hàng trả',
          condition: opts?.condition || pkg.condition || 'Tốt',
        }
      : {}),
  }
  const packages = [added, ...session.packages]
  const next: CarrierHandoverSession = {
    ...session,
    packages,
    packageCount: packages.length,
    outboundCount: new Set(packages.map((p) => p.outboundCode)).size,
    status: 'processing',
  }
  upsertCarrierHandover(next)
  return ok(next)
}

export function pdaHandoverRemovePackage(
  sessionId: string,
  packageCode: string,
): PdaApiResult<CarrierHandoverSession> {
  const session = getCarrierHandover(sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên bàn giao')
  if (session.status === 'handed_over') {
    return fail('SESSION_CLOSED', 'Phiên đã bàn giao — không sửa kiện')
  }
  const packages = session.packages.filter((p) => p.packageCode !== packageCode)
  if (packages.length === session.packages.length) {
    return fail('PACKAGE_NOT_FOUND', 'Không tìm thấy kiện trong phiên')
  }
  const next: CarrierHandoverSession = {
    ...session,
    packages,
    packageCount: packages.length,
    outboundCount: new Set(packages.map((p) => p.outboundCode)).size,
    status: packages.length === 0 ? 'new' : session.status,
  }
  upsertCarrierHandover(next)
  return ok(next)
}

export function pdaConfirmHandover(
  sessionId: string,
  opts?: { removeCancelled?: boolean },
): PdaApiResult<CarrierHandoverSession> {
  const session = getCarrierHandover(sessionId)
  if (!session) return fail('SESSION_NOT_FOUND', 'Không tìm thấy phiên bàn giao')
  let packages = session.packages
  const cancelled = listCancelledPackagesInSession(packages)
  if (cancelled.length && !opts?.removeCancelled) {
    return fail(
      'HAS_CANCELLED_OR',
      `Còn ${cancelled.length} kiện OR đã hủy — loại khỏi phiên trước khi bàn giao`,
    )
  }
  if (opts?.removeCancelled && cancelled.length) {
    const drop = new Set(cancelled.map((p) => p.packageCode))
    packages = packages.filter((p) => !drop.has(p.packageCode))
  }
  if (packages.length === 0) {
    return fail('EMPTY_SESSION', 'Phiên không còn kiện để bàn giao')
  }
  const next: CarrierHandoverSession = {
    ...session,
    packages,
    packageCount: packages.length,
    outboundCount: new Set(packages.map((p) => p.outboundCode)).size,
    status: 'handed_over',
  }
  upsertCarrierHandover(next)
  return ok(next)
}

export { createCarrierHandover }

export type InquiryScanType = 'sku' | 'location' | 'package' | 'unknown'

export function pdaUniversalScan(value: string): PdaApiResult<{
  type: InquiryScanType
  rows: ProductLocationRow[]
}> {
  const q = value.trim()
  if (q.startsWith('PG')) {
    return ok({ type: 'package', rows: seedProductLocations.filter((r) => r.placeCode === q) })
  }
  const bySku = seedProductLocations.filter(
    (r) => r.sku.toLowerCase() === q.toLowerCase() || r.name.toLowerCase().includes(q.toLowerCase()),
  )
  if (bySku.length) return ok({ type: 'sku', rows: bySku })
  const byLoc = seedProductLocations.filter((r) => r.placeCode === q && r.kind === 'location')
  if (byLoc.length) return ok({ type: 'location', rows: byLoc })
  return ok({ type: 'unknown', rows: [] })
}

export function pdaGetActiveSessions(operatorId: string) {
  return {
    receive: receiveSessions.filter((s) => s.operatorId === operatorId),
    pick: pickSessions.filter((s) => s.operatorId === operatorId),
    pack: packSessions.filter((s) => s.operatorId === operatorId),
  }
}
