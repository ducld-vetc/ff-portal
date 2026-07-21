export type ProductLocationStatus =
  | 'pickable'
  | 'ready_storage'
  | 'ready_handover'

export type ProductCondition = 'new' | 'damaged' | 'expired'

export type ProductLocationRow = {
  id: string
  sku: string
  name: string
  imageUrl?: string
  /** Location code or package code depending on kind */
  placeCode: string
  kind: 'location' | 'package'
  status: ProductLocationStatus
  qty: number
  unit: string
  pendingOut: number
  condition: ProductCondition
  expiryDate: string | null
  partnerCode: string
  partnerName: string
}

export type ProductLocationHistoryRow = {
  id: string
  sku: string
  productName: string
  storageType: string
  productType: string
  ioType: string
  updatedAt: string
  updatedBy: string
  ioCode: string
  ioDate: string
  lot: string
  dateInfo: string
  session: string
  unit: string
  qtyOrSerial: string
  condition: ProductCondition
  sourceLocation: string
  destLocation: string
  partnerCode: string
  partnerName: string
}

export const locationStatusLabels: Record<ProductLocationStatus, string> = {
  pickable: 'Có thể lấy hàng',
  ready_storage: 'Sẵn sàng lưu kho',
  ready_handover: 'Sẵn sàng bàn giao',
}

export const conditionLabels: Record<ProductCondition, string> = {
  new: 'Mới',
  damaged: 'Hư hỏng',
  expired: 'Hết hạn sử dụng',
}

export const workSessionOptions = [
  { value: 'packing', label: 'Phiên đóng gói' },
  { value: 'picking', label: 'Phiên lấy hàng' },
  { value: 'receiving', label: 'Phiên nhận hàng' },
  { value: 'putaway', label: 'Phiên lưu kho' },
]

const partnerHac = {
  partnerCode: 'HAC',
  partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
}

const productSaccoc2 =
  'SACCOC2 - Sạc điện có dây (bộ chuyển đổi nguồn điện), model: SH-MTZC, hiệu: DK Pro, IP: 100-240V/50/60Hz; OP: 21V-2A, sạc pin cho các máy cơ khí cầm tay, nsx: Nantong Rongyisheng Electronic Technology Co., Ltd. Mới 100%'

export const seedProductLocations: ProductLocationRow[] = [
  {
    id: 'pl-1',
    sku: 'SACCOC2',
    name: productSaccoc2,
    placeCode: 'PL HANG HONG',
    kind: 'location',
    status: 'pickable',
    qty: 9,
    unit: 'Cái',
    pendingOut: 0,
    condition: 'damaged',
    expiryDate: null,
    ...partnerHac,
  },
  {
    id: 'pl-2',
    sku: 'SACCOC2',
    name: productSaccoc2,
    placeCode: 'RNN.015',
    kind: 'location',
    status: 'pickable',
    qty: 1,
    unit: 'Cái',
    pendingOut: 0,
    condition: 'expired',
    expiryDate: null,
    ...partnerHac,
  },
  {
    id: 'pl-3',
    sku: 'SACCOC2',
    name: productSaccoc2,
    placeCode: 'R5.II.T1.001',
    kind: 'location',
    status: 'ready_storage',
    qty: 86,
    unit: 'Cái',
    pendingOut: 0,
    condition: 'new',
    expiryDate: null,
    ...partnerHac,
  },
  {
    id: 'pl-4',
    sku: 'SACCOC2',
    name: productSaccoc2,
    placeCode: 'PGHACW0ITXJB8760001',
    kind: 'package',
    status: 'ready_handover',
    qty: 1,
    unit: 'Cái',
    pendingOut: 0,
    condition: 'new',
    expiryDate: null,
    ...partnerHac,
  },
  {
    id: 'pl-5',
    sku: 'SACCOC2',
    name: productSaccoc2,
    placeCode: 'PGHACW0ITXJB8760002',
    kind: 'package',
    status: 'ready_handover',
    qty: 1,
    unit: 'Cái',
    pendingOut: 0,
    condition: 'new',
    expiryDate: null,
    ...partnerHac,
  },
  {
    id: 'pl-6',
    sku: 'SKU-CHARGER-20W',
    name: 'SKU-CHARGER-20W - Sạc nhanh 20W USB-C',
    placeCode: 'A-01-02-03',
    kind: 'location',
    status: 'pickable',
    qty: 42,
    unit: 'Cái',
    pendingOut: 3,
    condition: 'new',
    expiryDate: null,
    partnerCode: 'KHAITN02',
    partnerName: 'KHAITN02 - CÔNG TY TNHH EVERCHARGE01',
  },
  {
    id: 'pl-7',
    sku: 'SKU-CABLE-C-C-1M',
    name: 'SKU-CABLE-C-C-1M - Cáp USB-C 1m',
    placeCode: 'B-02-01-05',
    kind: 'location',
    status: 'ready_storage',
    qty: 120,
    unit: 'Cái',
    pendingOut: 0,
    condition: 'new',
    expiryDate: null,
    partnerCode: 'CUS-002',
    partnerName: 'CUS-002 - CÔNG TY TNHH GREENMART VIETNAM',
  },
]

export const seedProductLocationHistory: ProductLocationHistoryRow[] = [
  {
    id: 'ph-1',
    sku: 'SACCOC2',
    productName: productSaccoc2.replace(/^SACCOC2 - /, ''),
    storageType: 'Hàng quản lý theo số lượng',
    productType: 'Hàng lẻ',
    ioType: 'NotDefined',
    updatedAt: '2026-07-20T18:16:26',
    updatedBy: 'tuan',
    ioCode: 'ORHACGYHQDEH382',
    ioDate: '2026-07-20',
    lot: '',
    dateInfo: '',
    session: 'Phiên đóng gói',
    unit: 'Cái',
    qtyOrSerial: '1',
    condition: 'new',
    sourceLocation: 'RNH.005',
    destLocation: 'PACK.01',
    ...partnerHac,
  },
  {
    id: 'ph-2',
    sku: 'SACCOC2',
    productName: productSaccoc2.replace(/^SACCOC2 - /, ''),
    storageType: 'Hàng quản lý theo số lượng',
    productType: 'Hàng lẻ',
    ioType: 'NotDefined',
    updatedAt: '2026-07-20T18:16:18',
    updatedBy: 'tuan',
    ioCode: 'ORHACGYHQDEH382',
    ioDate: '2026-07-20',
    lot: '',
    dateInfo: '',
    session: 'Phiên đóng gói',
    unit: 'Cái',
    qtyOrSerial: '1',
    condition: 'new',
    sourceLocation: 'RN019',
    destLocation: 'PACK.01',
    ...partnerHac,
  },
  {
    id: 'ph-3',
    sku: 'SACCOC2',
    productName: productSaccoc2.replace(/^SACCOC2 - /, ''),
    storageType: 'Hàng quản lý theo số lượng',
    productType: 'Hàng lẻ',
    ioType: 'NotDefined',
    updatedAt: '2026-07-20T17:59:41',
    updatedBy: 'Hieu',
    ioCode: 'ORHACHYHQDEH380',
    ioDate: '2026-07-20',
    lot: '',
    dateInfo: '',
    session: 'Phiên lấy hàng',
    unit: 'Cái',
    qtyOrSerial: '1',
    condition: 'new',
    sourceLocation: 'ROGAP.003',
    destLocation: 'PICK.STAGE',
    ...partnerHac,
  },
  {
    id: 'ph-4',
    sku: 'SACCOC2',
    productName: productSaccoc2.replace(/^SACCOC2 - /, ''),
    storageType: 'Hàng quản lý theo số lượng',
    productType: 'Hàng lẻ',
    ioType: 'NotDefined',
    updatedAt: '2026-07-20T17:59:32',
    updatedBy: 'Hieu',
    ioCode: 'ORHACHYHQDEH380',
    ioDate: '2026-07-20',
    lot: '',
    dateInfo: '',
    session: 'Phiên lấy hàng',
    unit: 'Cái',
    qtyOrSerial: '1',
    condition: 'new',
    sourceLocation: 'R5.II.T1.001',
    destLocation: 'PICK.STAGE',
    ...partnerHac,
  },
  {
    id: 'ph-5',
    sku: 'SACCOC2',
    productName: productSaccoc2.replace(/^SACCOC2 - /, ''),
    storageType: 'Hàng quản lý theo số lượng',
    productType: 'Hàng lẻ',
    ioType: 'NotDefined',
    updatedAt: '2026-07-20T17:59:24',
    updatedBy: 'ops',
    ioCode: 'ORHACHYHQDEH380',
    ioDate: '2026-07-20',
    lot: '',
    dateInfo: '',
    session: 'Phiên lấy hàng',
    unit: 'Cái',
    qtyOrSerial: '1',
    condition: 'new',
    sourceLocation: 'R5.II.T1.001',
    destLocation: 'PICK.STAGE',
    ...partnerHac,
  },
  {
    id: 'ph-6',
    sku: 'SKU-CHARGER-20W',
    productName: 'Sạc nhanh 20W USB-C',
    storageType: 'Hàng quản lý theo số lượng',
    productType: 'Hàng lẻ',
    ioType: 'Inbound',
    updatedAt: '2026-07-18T09:12:00',
    updatedBy: 'admin',
    ioCode: 'IN-EC-00122',
    ioDate: '2026-07-18',
    lot: 'LOT-0726',
    dateInfo: '',
    session: 'Phiên nhận hàng',
    unit: 'Cái',
    qtyOrSerial: '50',
    condition: 'new',
    sourceLocation: 'DOCK.IN',
    destLocation: 'A-01-02-03',
    partnerCode: 'KHAITN02',
    partnerName: 'KHAITN02 - CÔNG TY TNHH EVERCHARGE01',
  },
]
