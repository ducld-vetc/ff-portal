export type WarehouseRoom = {
  id: string
  warehouseId: string
  code: string
  pickPriority: number
}

export type WarehouseLevel = {
  id: string
  warehouseId: string
  code: string
  pickPriority: number
}

export type WarehouseAisle = {
  id: string
  warehouseId: string
  roomId: string
  code: string
  pickPriority: number
}

export type WarehouseRack = {
  id: string
  warehouseId: string
  roomId: string
  aisleId: string
  code: string
  pickPriority: number
}

export type WarehouseBin = {
  id: string
  warehouseId: string
  roomId: string
  levelId: string
  aisleId: string
  rackId: string
  code: string
  pickPriority: number
  maxSku: number
  nonPickable: boolean
  fastMoving: boolean
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  /** Demo: số SKU đang chứa (để preview lộ trình) */
  skuOnHand?: number
  hasPickDemand?: boolean
}

export type LocationSetupSnapshot = {
  rooms: WarehouseRoom[]
  levels: WarehouseLevel[]
  aisles: WarehouseAisle[]
  racks: WarehouseRack[]
  bins: WarehouseBin[]
}

const wh1 = '1'

const seedRooms: WarehouseRoom[] = [
  { id: 'room-p1', warehouseId: wh1, code: 'R1', pickPriority: 1 },
  { id: 'room-p2', warehouseId: wh1, code: 'R2', pickPriority: 2 },
]

const seedLevels: WarehouseLevel[] = [
  { id: 'lv-a', warehouseId: wh1, code: 'A', pickPriority: 1 },
  { id: 'lv-b', warehouseId: wh1, code: 'B', pickPriority: 2 },
]

const seedAisles: WarehouseAisle[] = [
  { id: 'aisle-01', warehouseId: wh1, roomId: 'room-p1', code: '01', pickPriority: 1 },
  { id: 'aisle-02', warehouseId: wh1, roomId: 'room-p1', code: '02', pickPriority: 2 },
]

const seedRacks: WarehouseRack[] = [
  {
    id: 'rack-a01',
    warehouseId: wh1,
    roomId: 'room-p1',
    aisleId: 'aisle-01',
    code: 'A01',
    pickPriority: 1,
  },
  {
    id: 'rack-a02',
    warehouseId: wh1,
    roomId: 'room-p1',
    aisleId: 'aisle-01',
    code: 'A02',
    pickPriority: 1,
  },
]

/** Seed bin theo lộ trình chữ U (HDSD): A01 = 1→6, A02 = A.06→A.01 = 7→12 */
function buildUPathBins(): WarehouseBin[] {
  const bins: WarehouseBin[] = []
  const demandSlots = new Set([2, 5, 10])

  for (let i = 1; i <= 6; i += 1) {
    bins.push({
      id: `bin-a01-${i}`,
      warehouseId: wh1,
      roomId: 'room-p1',
      levelId: 'lv-a',
      aisleId: 'aisle-01',
      rackId: 'rack-a01',
      code: `R1.A01.A.${String(i).padStart(2, '0')}`,
      pickPriority: i,
      maxSku: 7,
      nonPickable: false,
      fastMoving: i === 2,
      lengthCm: 60,
      widthCm: 40,
      heightCm: 30,
      skuOnHand: demandSlots.has(i) ? 3 : 1,
      hasPickDemand: demandSlots.has(i),
    })
  }

  for (let pos = 6; pos >= 1; pos -= 1) {
    const pickPriority = 7 + (6 - pos)
    bins.push({
      id: `bin-a02-${pos}`,
      warehouseId: wh1,
      roomId: 'room-p1',
      levelId: 'lv-a',
      aisleId: 'aisle-01',
      rackId: 'rack-a02',
      code: `R1.A02.A.${String(pos).padStart(2, '0')}`,
      pickPriority,
      maxSku: 7,
      nonPickable: false,
      fastMoving: false,
      lengthCm: 60,
      widthCm: 40,
      heightCm: 30,
      skuOnHand: demandSlots.has(pickPriority) ? 2 : 0,
      hasPickDemand: demandSlots.has(pickPriority),
    })
  }
  return bins
}

let store: LocationSetupSnapshot = {
  rooms: [...seedRooms],
  levels: [...seedLevels],
  aisles: [...seedAisles],
  racks: [...seedRacks],
  bins: buildUPathBins(),
}

export function getLocationSetup(warehouseId: string): LocationSetupSnapshot {
  return {
    rooms: store.rooms.filter((r) => r.warehouseId === warehouseId),
    levels: store.levels.filter((r) => r.warehouseId === warehouseId),
    aisles: store.aisles.filter((r) => r.warehouseId === warehouseId),
    racks: store.racks.filter((r) => r.warehouseId === warehouseId),
    bins: store.bins.filter((r) => r.warehouseId === warehouseId),
  }
}

export function setLocationSetup(warehouseId: string, next: LocationSetupSnapshot) {
  store = {
    rooms: [...store.rooms.filter((r) => r.warehouseId !== warehouseId), ...next.rooms],
    levels: [...store.levels.filter((r) => r.warehouseId !== warehouseId), ...next.levels],
    aisles: [...store.aisles.filter((r) => r.warehouseId !== warehouseId), ...next.aisles],
    racks: [...store.racks.filter((r) => r.warehouseId !== warehouseId), ...next.racks],
    bins: [...store.bins.filter((r) => r.warehouseId !== warehouseId), ...next.bins],
  }
}

export function locationSetupProgress(warehouseId: string) {
  const s = getLocationSetup(warehouseId)
  return {
    rooms: s.rooms.length,
    levels: s.levels.length,
    aisles: s.aisles.length,
    racks: s.racks.length,
    bins: s.bins.length,
    ready: s.rooms.length > 0 && s.levels.length > 0 && s.aisles.length > 0 && s.racks.length > 0 && s.bins.length > 0,
  }
}

export type PickStop = {
  seq: number
  bin: WarehouseBin
  roomCode: string
  aisleCode: string
  rackCode: string
  levelCode: string
  reason: string
}

/**
 * Xây lộ trình picker theo HDSD:
 * Room.priority → Aisle.priority → Rack.priority → Level.priority → Bin.priority
 * FastMoving ưu tiên trong cùng nhóm; loại nonPickable.
 */
export function buildPickerPath(
  warehouseId: string,
  options?: { onlyDemand?: boolean },
): PickStop[] {
  const s = getLocationSetup(warehouseId)
  const roomMap = Object.fromEntries(s.rooms.map((r) => [r.id, r]))
  const levelMap = Object.fromEntries(s.levels.map((r) => [r.id, r]))
  const aisleMap = Object.fromEntries(s.aisles.map((r) => [r.id, r]))
  const rackMap = Object.fromEntries(s.racks.map((r) => [r.id, r]))

  const candidates = s.bins.filter((bin) => {
    if (bin.nonPickable) return false
    if ((bin.skuOnHand ?? 0) <= 0) return false
    if (options?.onlyDemand && !bin.hasPickDemand) return false
    return true
  })

  candidates.sort((a, b) => {
    const roomA = roomMap[a.roomId]?.pickPriority ?? 999
    const roomB = roomMap[b.roomId]?.pickPriority ?? 999
    if (roomA !== roomB) return roomA - roomB

    const aisleA = aisleMap[a.aisleId]?.pickPriority ?? 999
    const aisleB = aisleMap[b.aisleId]?.pickPriority ?? 999
    if (aisleA !== aisleB) return aisleA - aisleB

    const rackA = rackMap[a.rackId]?.pickPriority ?? 999
    const rackB = rackMap[b.rackId]?.pickPriority ?? 999
    if (rackA !== rackB) return rackA - rackB

    const levelA = levelMap[a.levelId]?.pickPriority ?? 999
    const levelB = levelMap[b.levelId]?.pickPriority ?? 999
    if (levelA !== levelB) return levelA - levelB

    if (a.fastMoving !== b.fastMoving) return a.fastMoving ? -1 : 1
    return a.pickPriority - b.pickPriority
  })

  return candidates.map((bin, index) => ({
    seq: index + 1,
    bin,
    roomCode: roomMap[bin.roomId]?.code ?? '—',
    aisleCode: aisleMap[bin.aisleId]?.code ?? '—',
    rackCode: rackMap[bin.rackId]?.code ?? '—',
    levelCode: levelMap[bin.levelId]?.code ?? '—',
    reason: [
      `Room ${roomMap[bin.roomId]?.pickPriority}`,
      `Aisle ${aisleMap[bin.aisleId]?.pickPriority}`,
      `Rack ${rackMap[bin.rackId]?.pickPriority}`,
      `Level ${levelMap[bin.levelId]?.pickPriority}`,
      `Bin ${bin.pickPriority}`,
      bin.fastMoving ? 'FastMoving' : null,
    ]
      .filter(Boolean)
      .join(' → '),
  }))
}

export type WavePickStop = PickStop & {
  lines: { sku: string; productName: string; qty: number; orderCode: string }[]
  totalQty: number
}

/**
 * Lộ trình picker theo từng yêu cầu/wave:
 * chỉ các bin đã được allocate trong lines của wave đó, sort theo priority layout kho.
 */
export function buildPickerPathForWave(
  warehouseId: string,
  lines: {
    binCode: string
    sku: string
    productName: string
    qty: number
    orderCode: string
  }[],
): WavePickStop[] {
  const s = getLocationSetup(warehouseId)
  const roomMap = Object.fromEntries(s.rooms.map((r) => [r.id, r]))
  const levelMap = Object.fromEntries(s.levels.map((r) => [r.id, r]))
  const aisleMap = Object.fromEntries(s.aisles.map((r) => [r.id, r]))
  const rackMap = Object.fromEntries(s.racks.map((r) => [r.id, r]))

  const byBin = new Map<
    string,
    {
      bin: WarehouseBin
      lines: { sku: string; productName: string; qty: number; orderCode: string }[]
    }
  >()

  for (const line of lines) {
    const bin = s.bins.find((b) => b.code === line.binCode)
    if (!bin || bin.nonPickable) continue
    const existing = byBin.get(bin.id)
    if (existing) {
      existing.lines.push(line)
    } else {
      byBin.set(bin.id, { bin, lines: [line] })
    }
  }

  const groups = [...byBin.values()]
  groups.sort((a, b) => {
    const roomA = roomMap[a.bin.roomId]?.pickPriority ?? 999
    const roomB = roomMap[b.bin.roomId]?.pickPriority ?? 999
    if (roomA !== roomB) return roomA - roomB
    const aisleA = aisleMap[a.bin.aisleId]?.pickPriority ?? 999
    const aisleB = aisleMap[b.bin.aisleId]?.pickPriority ?? 999
    if (aisleA !== aisleB) return aisleA - aisleB
    const rackA = rackMap[a.bin.rackId]?.pickPriority ?? 999
    const rackB = rackMap[b.bin.rackId]?.pickPriority ?? 999
    if (rackA !== rackB) return rackA - rackB
    const levelA = levelMap[a.bin.levelId]?.pickPriority ?? 999
    const levelB = levelMap[b.bin.levelId]?.pickPriority ?? 999
    if (levelA !== levelB) return levelA - levelB
    if (a.bin.fastMoving !== b.bin.fastMoving) return a.bin.fastMoving ? -1 : 1
    return a.bin.pickPriority - b.bin.pickPriority
  })

  return groups.map((group, index) => ({
    seq: index + 1,
    bin: group.bin,
    roomCode: roomMap[group.bin.roomId]?.code ?? '—',
    aisleCode: aisleMap[group.bin.aisleId]?.code ?? '—',
    rackCode: rackMap[group.bin.rackId]?.code ?? '—',
    levelCode: levelMap[group.bin.levelId]?.code ?? '—',
    reason: [
      `Room ${roomMap[group.bin.roomId]?.pickPriority}`,
      `Aisle ${aisleMap[group.bin.aisleId]?.pickPriority}`,
      `Rack ${rackMap[group.bin.rackId]?.pickPriority}`,
      `Level ${levelMap[group.bin.levelId]?.pickPriority}`,
      `Bin ${group.bin.pickPriority}`,
      group.bin.fastMoving ? 'FastMoving' : null,
    ]
      .filter(Boolean)
      .join(' → '),
    lines: group.lines,
    totalQty: group.lines.reduce((sum, l) => sum + l.qty, 0),
  }))
}

export function suggestBinCode(parts: {
  roomCode: string
  rackCode: string
  levelCode: string
  seq: number
}) {
  return `${parts.roomCode}.${parts.rackCode}.${parts.levelCode}.${String(parts.seq).padStart(2, '0')}`
}
