export type PdaTileId =
  | 'receiving'
  | 'putaway'
  | 'picking'
  | 'packing'
  | 'handover'
  | 'inventory'
  | 'assigned-bills'
  | 'location'
  | 'product-lookup'
  | 'transfer'
  | 'return-note'
  | 'return-receipt'
  | 'conversion'
  | 'repack'
  | 'cycle-count'

export type PdaSubOption = {
  title: string
  subtitle: string
  to: string
}

export type PdaHomeTile = {
  id: PdaTileId
  title: string
  icon: string
  color: string
  to?: string
  comingSoon?: boolean
  subOptions?: PdaSubOption[]
}

/** Home FunctionTile map — khớp APK ops_fulfillment */
export const pdaHomeTiles: PdaHomeTile[] = [
  { id: 'receiving', title: 'Nhận hàng', icon: 'inbox', color: '#00897B', to: '/pda/receiving' },
  { id: 'putaway', title: 'Lưu kho', icon: 'database', color: '#EF6C00', to: '/pda/putaway' },
  { id: 'picking', title: 'Lấy hàng', icon: 'shopping', color: '#1565C0', to: '/pda/picking' },
  { id: 'packing', title: 'Đóng gói', icon: 'gift', color: '#6A1B9A', to: '/pda/packing' },
  {
    id: 'handover',
    title: 'Bàn giao 3PL',
    icon: 'car',
    color: '#283593',
    subOptions: [
      {
        title: 'Phiên giao',
        subtitle: 'Bàn giao kiện cho ĐVVC / 3PL',
        to: '/pda/handover/delivery',
      },
      {
        title: 'Phiên nhận',
        subtitle: 'Nhận hàng trả từ ĐVVC / 3PL',
        to: '/pda/handover/receipt',
      },
    ],
  },
  { id: 'inventory', title: 'Tồn kho', icon: 'stock', color: '#00838F', to: '/pda/inventory' },
  {
    id: 'assigned-bills',
    title: 'Phiếu gán',
    icon: 'profile',
    color: '#558B2F',
    to: '/pda/inventory/assigned-bills',
  },
  { id: 'location', title: 'Vị trí', icon: 'location', color: '#2E7D32', to: '/pda/location' },
  {
    id: 'product-lookup',
    title: 'Tra cứu SP',
    icon: 'search',
    color: '#455A64',
    to: '/pda/product-lookup',
  },
  { id: 'transfer', title: 'Chuyển kho', icon: 'swap', color: '#F9A825', to: '/pda/transfer' },
  { id: 'return-note', title: 'Phiếu trả', icon: 'rollback', color: '#C62828', to: '/pda/return-note' },
  {
    id: 'return-receipt',
    title: 'Nhận trả',
    icon: 'import',
    color: '#AD1457',
    to: '/pda/return-receipt',
  },
  {
    id: 'conversion',
    title: 'Đổi ĐVT',
    icon: 'retweet',
    color: '#5D4037',
    subOptions: [
      {
        title: 'Đổi đơn vị tính',
        subtitle: 'Conversion · UoM',
        to: '/pda/conversion/uom',
      },
      {
        title: 'Đổi tình trạng',
        subtitle: 'GOOD ↔ BROKEN',
        to: '/pda/conversion/condition',
      },
    ],
  },
  {
    id: 'repack',
    title: 'Tách / Gom',
    icon: 'scissor',
    color: '#E65100',
    subOptions: [
      {
        title: 'Tách hàng (break)',
        subtitle: 'Bóc kiện / pallet → SKU',
        to: '/pda/repack?mode=break',
      },
      {
        title: 'Gom hàng (consolidate)',
        subtitle: 'Gộp SKU vào container',
        to: '/pda/repack?mode=consolidate',
      },
    ],
  },
  {
    id: 'cycle-count',
    title: 'Kiểm kê',
    icon: 'audit',
    color: '#78909C',
    comingSoon: true,
    to: '/pda/coming-soon?feature=CYCLE_COUNT',
  },
]

export const pdaScreenTitle: Record<string, string> = {
  '/pda/home': 'WAREHOUSE OPS',
  '/pda/receiving': 'Nhận hàng',
  '/pda/putaway': 'Lưu kho',
  '/pda/picking': 'Lấy hàng',
  '/pda/packing': 'Đóng gói',
  '/pda/handover': 'Bàn giao 3PL',
  '/pda/handover/delivery': 'Bàn giao 3PL · Giao',
  '/pda/handover/receipt': 'Bàn giao 3PL · Nhận',
  '/pda/inventory': 'Tồn kho',
  '/pda/inventory/assigned-bills': 'Phiếu gán',
  '/pda/location': 'Vị trí',
  '/pda/product-lookup': 'Tra cứu SP',
  '/pda/transfer': 'Chuyển kho',
  '/pda/return-note': 'Phiếu trả',
  '/pda/return-receipt': 'Nhận trả',
  '/pda/conversion/uom': 'Đổi ĐVT',
  '/pda/conversion/condition': 'Đổi tình trạng',
  '/pda/repack': 'Tách / Gom',
  '/pda/coming-soon': 'Coming soon',
}
