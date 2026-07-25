export type ContainerDeviceStatus =
  | 'ready'
  | 'ready_putaway'
  | 'ready_packing'
  | 'packing'
  | 'pick_shortage'
  | 'ready_cancelled_putaway'

export type AgeBucket = 'n0' | 'n1' | 'n2' | 'n3' | 'n4' | 'n5plus'

export type ContainerDeviceRow = {
  id: string
  code: string
  deviceType: string
  status: ContainerDeviceStatus
  ageBucket: AgeBucket
  locationCode?: string
  skuCount: number
  productQty: number
  operator: string
  tab: 'devices' | 'cancelled'
}

export const containerDeviceStatusLabel: Record<ContainerDeviceStatus, string> = {
  ready: 'Sẵn sàng',
  ready_putaway: 'Sẵn sàng lưu kho',
  ready_packing: 'Sẵn sàng đóng gói',
  packing: 'Đang đóng gói',
  pick_shortage: 'Lấy hàng bị thiếu',
  ready_cancelled_putaway: 'Sẵn sàng lưu kho hàng hủy',
}

export const ageBucketLabel: Record<AgeBucket, string> = {
  n0: 'N+0',
  n1: 'N+1',
  n2: 'N+2',
  n3: 'N+3',
  n4: 'N+4',
  n5plus: 'N5+',
}

export const ageBucketOrder: AgeBucket[] = ['n0', 'n1', 'n2', 'n3', 'n4', 'n5plus']

export const containerDeviceStatusOrder: ContainerDeviceStatus[] = [
  'ready',
  'ready_putaway',
  'ready_packing',
  'packing',
  'pick_shortage',
  'ready_cancelled_putaway',
]

export const containerDeviceTypeOptions = [
  { value: 'Tote', label: 'Tote' },
  { value: 'Pallet', label: 'Pallet' },
  { value: 'Cart', label: 'Cart' },
]

const operators = [
  'Cuong - Vương Quốc Cường',
  'tuan - Ngô Minh Tuấn',
  'ops - Ops Warehouse',
  'hang - Nguyễn Thị Hằng',
]

/** Seed matrix theo UI demo */
const matrixSeed: Array<{
  status: ContainerDeviceStatus
  counts: Array<[number, number] | null>
}> = [
  {
    status: 'ready',
    counts: [
      [95, 0],
      [15, 0],
      [19, 0],
      [4, 0],
      [12, 0],
      [86, 0],
    ],
  },
  {
    status: 'ready_putaway',
    counts: [
      [16, 252],
      [2, 17],
      [4, 15],
      [2, 3],
      null,
      [9, 33],
    ],
  },
  {
    status: 'ready_packing',
    counts: [[19, 70], null, null, null, null, null],
  },
  {
    status: 'packing',
    counts: [[5, 45], [1, 1], null, null, null, [2, 0]],
  },
  {
    status: 'pick_shortage',
    counts: [[1, 2], null, null, null, null, null],
  },
  {
    status: 'ready_cancelled_putaway',
    counts: [
      [2, 5],
      [1, 4],
      [4, 6],
      [3, 6],
      [1, 2],
      [7, 8],
    ],
  },
]

function buildDevices(): ContainerDeviceRow[] {
  const rows: ContainerDeviceRow[] = []
  let seq = 1

  for (const block of matrixSeed) {
    block.counts.forEach((cell, bucketIndex) => {
      if (!cell) return
      const [deviceCount, productQtyTotal] = cell
      const bucket = ageBucketOrder[bucketIndex]
      for (let i = 0; i < deviceCount; i += 1) {
        const codeNum = String(seq).padStart(3, '0')
        const prefix = seq % 3 === 0 ? 'RV' : 'RN'
        const productQty =
          deviceCount > 0 ? Math.floor(productQtyTotal / deviceCount) + (i < productQtyTotal % deviceCount ? 1 : 0) : 0
        rows.push({
          id: `cd-${block.status}-${bucket}-${i + 1}`,
          code: `${prefix}${codeNum}`,
          deviceType: 'Tote',
          status: block.status,
          ageBucket: bucket,
          locationCode: i % 4 === 0 ? `R${(i % 5) + 1}.A${(i % 3) + 1}` : undefined,
          skuCount: productQty > 0 ? Math.min(productQty, 1 + (i % 3)) : 0,
          productQty,
          operator: operators[i % operators.length],
          tab: block.status === 'ready_cancelled_putaway' ? 'cancelled' : 'devices',
        })
        seq += 1
      }
    })
  }

  // Thêm vài pallet demo
  rows.push(
    {
      id: 'cd-pallet-1',
      code: 'PL001',
      deviceType: 'Pallet',
      status: 'ready',
      ageBucket: 'n0',
      skuCount: 0,
      productQty: 0,
      operator: operators[0],
      tab: 'devices',
    },
    {
      id: 'cd-pallet-2',
      code: 'PL002',
      deviceType: 'Pallet',
      status: 'ready_putaway',
      ageBucket: 'n1',
      locationCode: 'R2.B1',
      skuCount: 2,
      productQty: 8,
      operator: operators[1],
      tab: 'devices',
    },
  )

  return rows
}

export const seedContainerDevices: ContainerDeviceRow[] = buildDevices()

export type CancelledPackageStatus = 'ready_cancelled_putaway' | 'putaway_cancelled' | 'completed'

export type CancelledPackageRow = {
  id: string
  outboundCode: string
  packageCode: string
  status: CancelledPackageStatus
  returnDaysLabel: string
  skuCount: number
  productQty: number
  operator?: string
}

export const cancelledPackageStatusLabel: Record<CancelledPackageStatus, string> = {
  ready_cancelled_putaway: 'Sẵn sàng lưu kho hàng hủy',
  putaway_cancelled: 'Đã lưu kho hàng hủy',
  completed: 'Hoàn tất',
}

export const cancelledPackageStatusOptions = Object.entries(cancelledPackageStatusLabel).map(
  ([value, label]) => ({ value, label }),
)

const cancelledSeedMeta: Array<{
  outboundCode: string
  returnDaysLabel: string
  skuCount: number
  productQty: number
}> = [
  { outboundCode: 'ORLABPPFISH3633', returnDaysLabel: 'N+0', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3610', returnDaysLabel: 'N+0', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3609', returnDaysLabel: 'N+1', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3606', returnDaysLabel: 'N+1', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3604', returnDaysLabel: 'N+1', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3600', returnDaysLabel: 'N+1', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3599', returnDaysLabel: 'N+1', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3598', returnDaysLabel: 'N+1', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3597', returnDaysLabel: 'N+1', skuCount: 2, productQty: 2 },
  { outboundCode: 'ORLABPPFISH3510', returnDaysLabel: 'N+2', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3401', returnDaysLabel: 'N+5', skuCount: 1, productQty: 2 },
  { outboundCode: 'ORLABPPFISH3302', returnDaysLabel: 'N+9', skuCount: 2, productQty: 2 },
  { outboundCode: 'ORLABPPFISH3208', returnDaysLabel: 'N+12', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3105', returnDaysLabel: 'N+18', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORLABPPFISH3001', returnDaysLabel: 'N+25', skuCount: 2, productQty: 2 },
  { outboundCode: 'ORAVORETCANCEL01', returnDaysLabel: 'N+3', skuCount: 1, productQty: 1 },
  { outboundCode: 'ORHACRETURNPKG02', returnDaysLabel: 'N+4', skuCount: 1, productQty: 3 },
  { outboundCode: 'ORAVICANCELPKG03', returnDaysLabel: 'N+7', skuCount: 2, productQty: 2 },
]

export const seedCancelledPackages: CancelledPackageRow[] = cancelledSeedMeta.map((item, index) => ({
  id: `cpkg-${index + 1}`,
  outboundCode: item.outboundCode,
  packageCode: `PG${item.outboundCode.replace(/^OR/, '')}0001`,
  status: 'ready_cancelled_putaway',
  returnDaysLabel: item.returnDaysLabel,
  skuCount: item.skuCount,
  productQty: item.productQty,
  operator: undefined,
}))

export function listContainerDevices(deviceType?: string) {
  if (!deviceType) return seedContainerDevices
  return seedContainerDevices.filter((r) => r.deviceType === deviceType)
}

export function listCancelledPackages() {
  return seedCancelledPackages
}

export function getMaxDelayDays(rows: ContainerDeviceRow[]) {
  // Demo: N5+ tương ứng trễ cao
  const hasN5 = rows.some((r) => r.ageBucket === 'n5plus')
  return hasN5 ? 235 : 12
}

export type MatrixCell = {
  deviceCount: number
  productQty: number
} | null

export function buildStatusMatrix(
  rows: ContainerDeviceRow[],
): Array<{ status: ContainerDeviceStatus; label: string; cells: MatrixCell[] }> {
  const statuses = containerDeviceStatusOrder.filter((s) => s !== 'ready_cancelled_putaway')

  return statuses.map((status) => ({
    status,
    label: containerDeviceStatusLabel[status],
    cells: ageBucketOrder.map((bucket) => {
      const matched = rows.filter((r) => r.status === status && r.ageBucket === bucket)
      if (matched.length === 0) return null
      return {
        deviceCount: matched.length,
        productQty: matched.reduce((s, r) => s + r.productQty, 0),
      }
    }),
  }))
}
