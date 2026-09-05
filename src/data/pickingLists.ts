export type PickListStatus = 'ready' | 'picking' | 'picked' | 'cancelled'
export type PickListType =
  | 'PTO'
  | 'MIO'
  | 'PTS'
  | 'PTD'
  | 'Cluster'
  | 'SIO'
  | 'SSO'
  | 'SMO'
  | 'MSMQ'

/** Nhóm hành vi đóng gói theo phương thức lấy hàng */
export type PackFlowKind = 'single_order' | 'sio' | 'sso' | 'smo'

export function resolvePackFlowKind(type: PickListType): PackFlowKind {
  if (type === 'SIO') return 'sio'
  if (type === 'SSO') return 'sso'
  if (type === 'SMO' || type === 'MSMQ') return 'smo'
  // PTO / MIO / PTS (+ Cluster/PTD fallback): 1 tote = 1 đơn
  return 'single_order'
}

export const pickListTypeLabel: Record<PickListType, string> = {
  PTO: 'PTO — Lấy theo đơn',
  MIO: 'MIO — Đơn nhiều SP',
  PTS: 'PTS — Lấy & phân loại',
  PTD: 'PTD — Lấy & bàn giao',
  Cluster: 'Cluster — Gom đơn',
  SIO: 'SIO — Đơn 1 SP',
  SSO: 'SSO — Cùng 1 SKU',
  SMO: 'SMO — Cùng bộ SKU/SL',
  MSMQ: 'MSMQ — Nhiều SP giống nhau (SL khác)',
}
export type PickPriority = 'normal' | 'high' | 'urgent'
export type PickSlaState = 'on_time' | 'late'

export type PickListLine = {
  id: string
  location: string
  group: number
  assignee?: string
  productName: string
  sku: string
  qty: number
  pickedQty: number
  unit: string
  pickingDevice?: string
  packingDevice?: string
  outboundCode: string
  lotNo?: string
  mfgDate?: string
  expDate?: string
}

export type PickList = {
  id: string
  code: string
  status: PickListStatus
  priority: PickPriority
  slaState: PickSlaState
  type: PickListType
  orderQty: number
  productQty: number
  sizeGroup: string
  pickingDevice?: string
  assignee?: string
  assignedAt?: string | null
  createdBy: string
  createdAt: string
  note?: string
  isB2b?: boolean
  lines: PickListLine[]
}

export const pickListStatusLabel: Record<PickListStatus, string> = {
  ready: 'Sẵn sàng lấy hàng',
  picking: 'Đang lấy hàng',
  picked: 'Đã lấy hàng',
  cancelled: 'Đã hủy',
}

export const pickListStatusColor: Record<PickListStatus, string> = {
  ready: 'orange',
  picking: 'processing',
  picked: 'success',
  cancelled: 'error',
}

export const pickPriorityLabel: Record<PickPriority, string> = {
  normal: 'Bình thường',
  high: 'Cao',
  urgent: 'Khẩn cấp',
}

export const pickPriorityColor: Record<PickPriority, string> = {
  normal: 'default',
  high: 'orange',
  urgent: 'red',
}

const seedPickLists: PickList[] = [
  {
    id: 'pl-1',
    code: 'PL2607253M6H2_PTO_002',
    status: 'ready',
    priority: 'high',
    slaState: 'on_time',
    type: 'PTO',
    orderQty: 1,
    productQty: 1,
    sizeGroup: 'XS',
    pickingDevice: 'RNN.052',
    assignee: 'Hien - Nguyễn Thị Hiền',
    assignedAt: '2026-07-25T08:20:00',
    createdBy: 'ops - Ops',
    createdAt: '2026-07-25T08:15:31',
    lines: [
      {
        id: 'pll-1',
        location: 'R4.A1.T1.002',
        group: 1,
        productName: 'Lotion gội khô nước hoa Chirimola 100ml',
        sku: '292490068011',
        qty: 1,
        pickedQty: 0,
        unit: 'TUÝP',
        pickingDevice: 'RNN.052',
        outboundCode: 'ORNQATCNL49O942',
        lotNo: '260226',
        mfgDate: '2026-02-26',
        expDate: '2028-02-25',
      },
    ],
  },
  {
    id: 'pl-2',
    code: 'PL260725Q4QER_PTO_001',
    status: 'picked',
    priority: 'high',
    slaState: 'on_time',
    type: 'PTO',
    orderQty: 1,
    productQty: 1,
    sizeGroup: 'XS',
    pickingDevice: 'RNN.052',
    assignee: 'Hien - Nguyễn Thị Hiền',
    assignedAt: '2026-07-25T08:18:00',
    createdBy: 'ops - Ops',
    createdAt: '2026-07-25T08:15:31',
    lines: [
      {
        id: 'pll-2',
        location: 'R4.A1.T1.002',
        group: 1,
        productName: 'Lotion gội khô nước hoa Chirimola 100ml',
        sku: '292490068011',
        qty: 1,
        pickedQty: 1,
        unit: 'TUÝP',
        pickingDevice: 'RNN.052',
        packingDevice: 'RNN.052',
        outboundCode: 'ORNQATCNL49O942',
        lotNo: '260226',
        mfgDate: '2026-02-26',
        expDate: '2028-02-25',
      },
    ],
  },
  {
    id: 'pl-3',
    code: 'PL260725B2B_CLUSTER_01',
    status: 'ready',
    priority: 'urgent',
    slaState: 'on_time',
    type: 'Cluster',
    orderQty: 6,
    productQty: 6,
    sizeGroup: 'M',
    pickingDevice: 'ROGAP.008',
    createdBy: 'ops - Ops',
    createdAt: '2026-07-25T07:40:00',
    isB2b: true,
    note: 'Đơn B2B gom cụm',
    lines: [
      {
        id: 'pll-3',
        location: 'R2.B3.T2.011',
        group: 1,
        productName: 'Sạc nhanh 20W USB-C',
        sku: 'SKU-CHARGER-20W',
        qty: 6,
        pickedQty: 0,
        unit: 'Cái',
        outboundCode: 'ORHCMQ7B2201',
      },
    ],
  },
  {
    id: 'pl-4',
    code: 'PL260724CANCEL_001',
    status: 'cancelled',
    priority: 'normal',
    slaState: 'late',
    type: 'SIO',
    orderQty: 0,
    productQty: 0,
    sizeGroup: 'XS',
    createdBy: 'ops - Ops',
    createdAt: '2026-07-24T16:00:00',
    lines: [],
  },
  {
    id: 'pl-5',
    code: 'PL260725PDA_DEMO_001',
    status: 'ready',
    priority: 'high',
    slaState: 'on_time',
    type: 'PTO',
    orderQty: 1,
    productQty: 2,
    sizeGroup: 'S',
    createdBy: 'ops - Ops',
    createdAt: '2026-08-23T10:00:00',
    note: 'Pick list demo PDA — chưa gán picker',
    lines: [
      {
        id: 'pll-5a',
        location: 'R4.A1.T1.002',
        group: 1,
        productName: 'Lotion gội khô nước hoa Chirimola 100ml',
        sku: '292490068011',
        qty: 1,
        pickedQty: 0,
        unit: 'TUÝP',
        outboundCode: 'ORNQAPDADEMO001',
        lotNo: '260226',
        mfgDate: '2026-02-26',
        expDate: '2028-02-25',
      },
      {
        id: 'pll-5b',
        location: 'A-01-02-03',
        group: 2,
        productName: 'Sạc nhanh 20W USB-C',
        sku: 'SKU-CHARGER-20W',
        qty: 1,
        pickedQty: 0,
        unit: 'Cái',
        outboundCode: 'ORNQAPDADEMO001',
      },
    ],
  },
]

let pickListStore: PickList[] = [...seedPickLists]

export function listPickLists(opts?: { b2bOnly?: boolean }) {
  if (opts?.b2bOnly === true) return pickListStore.filter((p) => p.isB2b)
  if (opts?.b2bOnly === false) return pickListStore.filter((p) => !p.isB2b)
  return pickListStore
}

export function getPickList(idOrCode: string) {
  return pickListStore.find((p) => p.id === idOrCode || p.code === idOrCode)
}

export function upsertPickList(next: PickList) {
  const idx = pickListStore.findIndex((p) => p.id === next.id)
  if (idx >= 0) {
    pickListStore = [...pickListStore.slice(0, idx), next, ...pickListStore.slice(idx + 1)]
  } else {
    pickListStore = [next, ...pickListStore]
  }
  return next
}
