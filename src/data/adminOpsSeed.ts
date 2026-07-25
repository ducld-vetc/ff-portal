/** Seed data cho các màn Vận hành kho (admin) chưa có store riêng */

export type PackedOrderRow = {
  id: string
  packedAt: string
  partnerName: string
  outboundCode: string
  partnerOrCode: string
  trackingCode?: string
  deviceCode: string
}

/** Đơn đã đóng gói — màn Đóng gói sản phẩm */
export const packingSeed: PackedOrderRow[] = [
  {
    id: 'pk-1',
    packedAt: '2026-07-24T17:41:31',
    partnerName: 'HAC-CONG TY TNHH HAC RETAIL',
    outboundCode: 'ORHACWBMUP26917',
    partnerOrCode: 'HAC-WBM-UP-26917',
    trackingCode: '802789820795',
    deviceCode: 'RNN.052',
  },
  {
    id: 'pk-2',
    packedAt: '2026-07-24T16:12:08',
    partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
    outboundCode: 'ORAZB6FB5XRW785',
    partnerOrCode: 'SHOPEE-99100',
    trackingCode: 'JT889900112',
    deviceCode: 'RNN.041',
  },
  {
    id: 'pk-3',
    packedAt: '2026-07-24T15:03:44',
    partnerName: 'AVI - CÔNG TY TNHH AVIATEK',
    outboundCode: 'ORHN01C8830',
    partnerOrCode: 'TT-1002',
    deviceCode: 'RNN.033',
  },
]

/** Đơn đã đóng gói — màn Đóng gói theo nhãn */
export const packingByLabelSeed: PackedOrderRow[] = [
  {
    id: 'pbl-1',
    packedAt: '2026-07-24T14:22:10',
    partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
    outboundCode: 'ORAZB6FB5XRW785',
    partnerOrCode: 'SHOPEE-99100',
    trackingCode: 'JT889921',
    deviceCode: 'LBL-JT-889921',
  },
  {
    id: 'pbl-2',
    packedAt: '2026-07-18T10:20:00',
    partnerName: 'AVI - CÔNG TY TNHH AVIATEK',
    outboundCode: 'ORHN01C8830',
    partnerOrCode: 'TT-1002',
    deviceCode: 'LBL-GHN-120033',
  },
]

export const outboundUpdateSeed = [
  {
    id: 'ou-1',
    outboundCode: 'ORAZB6FB5XRW785',
    fromStatus: 'Mới',
    toStatus: 'Đang lấy hàng',
    source: 'Manual',
    updatedBy: 'ops',
    updatedAt: '2026-07-25T08:59:23',
  },
  {
    id: 'ou-2',
    outboundCode: 'ORHN01C8830',
    fromStatus: 'Đã đóng gói',
    toStatus: 'Đã bàn giao',
    source: 'Webhook ĐVVC',
    updatedBy: 'system',
    updatedAt: '2026-07-18T14:05:00',
  },
]

export const printLabelSeed = [
  {
    id: 'pr-1',
    labelType: 'Nhãn vận đơn',
    relatedCode: 'ORAZB6FB5XRW785',
    copies: 1,
    printer: 'Zebra-01',
    status: 'Đã in',
    printedAt: '2026-07-25T09:05:00',
  },
  {
    id: 'pr-2',
    labelType: 'Nhãn vị trí',
    relatedCode: 'R4.A1.T1.002',
    copies: 2,
    printer: 'Zebra-02',
    status: 'Chờ in',
    printedAt: null as string | null,
  },
]

