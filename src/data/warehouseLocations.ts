/** Cấu trúc vị trí kho tối giản: Zone → Thiết bị → Ô kệ */

export type WarehouseZone = {
  id: string
  warehouseId: string
  code: string
  name?: string
  pickPriority: number
}

export type WarehouseDevice = {
  id: string
  warehouseId: string
  zoneId: string
  code: string
  name?: string
  pickPriority: number
}

export type WarehouseBin = {
  id: string
  warehouseId: string
  zoneId: string
  deviceId: string
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
  zones: WarehouseZone[]
  devices: WarehouseDevice[]
  bins: WarehouseBin[]
}

const wh1 = '1'

const seedZones: WarehouseZone[] = [
  { id: 'zone-z1', warehouseId: wh1, code: 'Z1', name: 'Khu picking nhanh', pickPriority: 1 },
  { id: 'zone-z2', warehouseId: wh1, code: 'Z2', name: 'Khu lưu trữ', pickPriority: 2 },
]

const seedDevices: WarehouseDevice[] = [
  {
    id: 'dev-ke01',
    warehouseId: wh1,
    zoneId: 'zone-z1',
    code: 'KE01',
    name: 'Kệ A — hàng đi',
    pickPriority: 1,
  },
  {
    id: 'dev-ke02',
    warehouseId: wh1,
    zoneId: 'zone-z1',
    code: 'KE02',
    name: 'Kệ A — hàng về',
    pickPriority: 1,
  },
]

/** Seed ô kệ theo lộ trình chữ U: KE01 = 1→6, KE02 = 6→1 = bước 7→12 */
function buildUPathBins(): WarehouseBin[] {
  const bins: WarehouseBin[] = []
  const demandSlots = new Set([2, 5, 10])

  for (let i = 1; i <= 6; i += 1) {
    bins.push({
      id: `bin-ke01-${i}`,
      warehouseId: wh1,
      zoneId: 'zone-z1',
      deviceId: 'dev-ke01',
      code: `Z1.KE01.${String(i).padStart(2, '0')}`,
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
      id: `bin-ke02-${pos}`,
      warehouseId: wh1,
      zoneId: 'zone-z1',
      deviceId: 'dev-ke02',
      code: `Z1.KE02.${String(pos).padStart(2, '0')}`,
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
  zones: [...seedZones],
  devices: [...seedDevices],
  bins: buildUPathBins(),
}

export function getLocationSetup(warehouseId: string): LocationSetupSnapshot {
  return {
    zones: store.zones.filter((r) => r.warehouseId === warehouseId),
    devices: store.devices.filter((r) => r.warehouseId === warehouseId),
    bins: store.bins.filter((r) => r.warehouseId === warehouseId),
  }
}

export function setLocationSetup(warehouseId: string, next: LocationSetupSnapshot) {
  store = {
    zones: [...store.zones.filter((r) => r.warehouseId !== warehouseId), ...next.zones],
    devices: [...store.devices.filter((r) => r.warehouseId !== warehouseId), ...next.devices],
    bins: [...store.bins.filter((r) => r.warehouseId !== warehouseId), ...next.bins],
  }
}

export function locationSetupProgress(warehouseId: string) {
  const s = getLocationSetup(warehouseId)
  return {
    zones: s.zones.length,
    devices: s.devices.length,
    bins: s.bins.length,
    ready: s.zones.length > 0 && s.devices.length > 0 && s.bins.length > 0,
  }
}

export type PickStop = {
  seq: number
  bin: WarehouseBin
  zoneCode: string
  deviceCode: string
  reason: string
}

/**
 * Lộ trình picker: Zone.priority → Device.priority → Bin.priority
 * FastMoving ưu tiên trong cùng nhóm; loại nonPickable.
 */
export function buildPickerPath(
  warehouseId: string,
  options?: { onlyDemand?: boolean },
): PickStop[] {
  const s = getLocationSetup(warehouseId)
  const zoneMap = Object.fromEntries(s.zones.map((r) => [r.id, r]))
  const deviceMap = Object.fromEntries(s.devices.map((r) => [r.id, r]))

  const candidates = s.bins.filter((bin) => {
    if (bin.nonPickable) return false
    if ((bin.skuOnHand ?? 0) <= 0) return false
    if (options?.onlyDemand && !bin.hasPickDemand) return false
    return true
  })

  candidates.sort((a, b) => {
    const zoneA = zoneMap[a.zoneId]?.pickPriority ?? 999
    const zoneB = zoneMap[b.zoneId]?.pickPriority ?? 999
    if (zoneA !== zoneB) return zoneA - zoneB

    const deviceA = deviceMap[a.deviceId]?.pickPriority ?? 999
    const deviceB = deviceMap[b.deviceId]?.pickPriority ?? 999
    if (deviceA !== deviceB) return deviceA - deviceB

    if (a.fastMoving !== b.fastMoving) return a.fastMoving ? -1 : 1
    return a.pickPriority - b.pickPriority
  })

  return candidates.map((bin, index) => ({
    seq: index + 1,
    bin,
    zoneCode: zoneMap[bin.zoneId]?.code ?? '—',
    deviceCode: deviceMap[bin.deviceId]?.code ?? '—',
    reason: [
      `Zone ${zoneMap[bin.zoneId]?.pickPriority}`,
      `Device ${deviceMap[bin.deviceId]?.pickPriority}`,
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
 * Lộ trình picker theo wave: chỉ ô kệ đã allocate, sort Zone → Device → Bin.
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
  const zoneMap = Object.fromEntries(s.zones.map((r) => [r.id, r]))
  const deviceMap = Object.fromEntries(s.devices.map((r) => [r.id, r]))

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
    const zoneA = zoneMap[a.bin.zoneId]?.pickPriority ?? 999
    const zoneB = zoneMap[b.bin.zoneId]?.pickPriority ?? 999
    if (zoneA !== zoneB) return zoneA - zoneB
    const deviceA = deviceMap[a.bin.deviceId]?.pickPriority ?? 999
    const deviceB = deviceMap[b.bin.deviceId]?.pickPriority ?? 999
    if (deviceA !== deviceB) return deviceA - deviceB
    if (a.bin.fastMoving !== b.bin.fastMoving) return a.bin.fastMoving ? -1 : 1
    return a.bin.pickPriority - b.bin.pickPriority
  })

  return groups.map((group, index) => ({
    seq: index + 1,
    bin: group.bin,
    zoneCode: zoneMap[group.bin.zoneId]?.code ?? '—',
    deviceCode: deviceMap[group.bin.deviceId]?.code ?? '—',
    reason: [
      `Zone ${zoneMap[group.bin.zoneId]?.pickPriority}`,
      `Device ${deviceMap[group.bin.deviceId]?.pickPriority}`,
      `Bin ${group.bin.pickPriority}`,
      group.bin.fastMoving ? 'FastMoving' : null,
    ]
      .filter(Boolean)
      .join(' → '),
    lines: group.lines,
    totalQty: group.lines.reduce((sum, l) => sum + l.qty, 0),
  }))
}

export function suggestBinCode(parts: { zoneCode: string; deviceCode: string; seq: number }) {
  return `${parts.zoneCode}.${parts.deviceCode}.${String(parts.seq).padStart(2, '0')}`
}
