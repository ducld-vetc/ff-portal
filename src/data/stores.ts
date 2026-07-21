export type StoreStatus = 'active' | 'expired_connection' | 'error_orders' | 'disconnected'

export type SalesStore = {
  id: string
  partnerName: string
  channel: string
  shopId: string
  shopCode: string
  shopName: string
  status: StoreStatus
  connectedAt: string
  expiredAt: string | null
  daysRemaining: number | null
  errorOrders: number
  syncProducts: boolean
  syncOrders: boolean
  syncInventory: boolean
  lastSyncProductsAt?: string | null
  lastSyncOrdersAt?: string | null
  lastSyncInventoryAt?: string | null
  warehouseLinked: boolean
  linkedWarehouseCode?: string
}

export const storeStatusLabel: Record<StoreStatus, string> = {
  active: 'Đã kết nối',
  expired_connection: 'Hết hạn kết nối',
  error_orders: 'Đơn lỗi',
  disconnected: 'Đã ngắt kết nối',
}

export const storeStatusColor: Record<StoreStatus, string> = {
  active: 'green',
  expired_connection: 'orange',
  error_orders: 'red',
  disconnected: 'default',
}

export const salesChannelOptions = [
  { value: 'all', label: 'Tất cả kênh' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'lazada', label: 'Lazada' },
  { value: 'tiki', label: 'Tiki' },
  { value: 'sendo', label: 'Sendo' },
  { value: 'facebook', label: 'Facebook Shop' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website / API' },
]

function channelProductImage(label: string, color: string) {
  const safe = encodeURIComponent(label.slice(0, 8))
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="16" fill="${color}"/><text x="80" y="86" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="16" font-weight="700">${safe}</text></svg>`,
  )}`
}

export const connectableChannels = [
  { value: 'Shopee', label: 'Shopee', color: '#ee4d2d', group: 'Sàn TMĐT' },
  { value: 'TikTok', label: 'TikTok Shop', color: '#111111', group: 'Sàn TMĐT' },
  { value: 'Lazada', label: 'Lazada', color: '#0f146d', group: 'Sàn TMĐT' },
  { value: 'Tiki', label: 'Tiki', color: '#1a94ff', group: 'Sàn TMĐT' },
  { value: 'Sendo', label: 'Sendo', color: '#e53935', group: 'Sàn TMĐT' },
  { value: 'Facebook', label: 'Facebook Shop', color: '#1877f2', group: 'Social commerce' },
  { value: 'Instagram', label: 'Instagram Shopping', color: '#e1306c', group: 'Social commerce' },
  { value: 'Website', label: 'Website / API', color: '#0f766e', group: 'Khác' },
]

export type StoreProductLink = {
  id: string
  storeId: string
  channelSku: string
  channelName: string
  channelImageUrl?: string
  omsSku?: string
  omsName?: string
  omsImageUrl?: string
  linked: boolean
  /** Kết quả lần liên kết tự động gần nhất */
  autoLinkStatus?: 'success' | 'failed' | 'pending'
  autoLinkNote?: string
  syncRatio: number
  threshold: number
  initialSyncQty?: number
}

export type HungOrder = {
  id: string
  storeId: string
  orderCode: string
  reason: string
  createdAt: string
  status: 'hung' | 'retried' | 'resolved'
}

export const storeRows: SalesStore[] = [
  {
    id: 'store-1',
    partnerName: 'DVH - Hộ kinh doanh Đinh Văn Hùng',
    channel: 'Shopee',
    shopId: '393016570',
    shopCode: 'SHOSHP826',
    shopName: 'Giàn phơi thông minh AVOGROUP',
    status: 'active',
    connectedAt: '2026-07-14T08:57:48',
    expiredAt: '2027-07-14T08:57:46',
    daysRemaining: 358,
    errorOrders: 0,
    syncProducts: true,
    syncOrders: true,
    syncInventory: false,
    lastSyncProductsAt: '2026-07-20T08:15:00',
    lastSyncOrdersAt: '2026-07-20T18:20:00',
    lastSyncInventoryAt: null,
    warehouseLinked: true,
    linkedWarehouseCode: 'WH-HCM-01',
  },
  {
    id: 'store-2',
    partnerName: 'DVH - Hộ kinh doanh Đinh Văn Hùng',
    channel: 'Shopee',
    shopId: '397873794',
    shopCode: 'SHOSHP606',
    shopName: 'Thiết Bị Phi INOX',
    status: 'active',
    connectedAt: '2026-07-06T18:00:40',
    expiredAt: '2027-07-06T18:00:39',
    daysRemaining: 351,
    errorOrders: 5,
    syncProducts: true,
    syncOrders: true,
    syncInventory: true,
    lastSyncProductsAt: '2026-07-20T09:00:00',
    lastSyncOrdersAt: '2026-07-20T17:40:00',
    lastSyncInventoryAt: '2026-07-20T17:05:00',
    warehouseLinked: true,
    linkedWarehouseCode: 'WH-HCM-01',
  },
  {
    id: 'store-3',
    partnerName: 'DVH - Hộ kinh doanh Đinh Văn Hùng',
    channel: 'Shopee',
    shopId: '773087236',
    shopCode: 'SHOSHP350',
    shopName: 'Gia dụng thông minh GREENHOUSE',
    status: 'active',
    connectedAt: '2026-07-06T07:55:20',
    expiredAt: '2027-07-06T07:55:18',
    daysRemaining: 350,
    errorOrders: 3,
    syncProducts: false,
    syncOrders: true,
    syncInventory: false,
    lastSyncProductsAt: null,
    lastSyncOrdersAt: '2026-07-19T12:00:00',
    lastSyncInventoryAt: null,
    warehouseLinked: false,
  },
  {
    id: 'store-4',
    partnerName: '3AM - Hộ kinh doanh 3A MALL',
    channel: 'TikTok',
    shopId: '7494951464559348183',
    shopCode: 'TIKSHP643',
    shopName: '3A Mall',
    status: 'active',
    connectedAt: '2026-07-05T14:16:27',
    expiredAt: '2125-06-11T14:16:13',
    daysRemaining: 36119,
    errorOrders: 0,
    syncProducts: true,
    syncOrders: true,
    syncInventory: true,
    lastSyncProductsAt: '2026-07-20T10:10:00',
    lastSyncOrdersAt: '2026-07-20T16:30:00',
    lastSyncInventoryAt: '2026-07-20T16:00:00',
    warehouseLinked: true,
    linkedWarehouseCode: 'WH-HN-01',
  },
  {
    id: 'store-5',
    partnerName: 'NQA - Hộ kinh doanh Ngô Quỳnh Anh',
    channel: 'Shopee',
    shopId: '1579652385',
    shopCode: 'SHOSHP537',
    shopName: 'Bột điện giải AddOn',
    status: 'active',
    connectedAt: '2026-07-02T16:12:32',
    expiredAt: '2027-07-02T16:12:31',
    daysRemaining: 346,
    errorOrders: 0,
    syncProducts: true,
    syncOrders: false,
    syncInventory: false,
    lastSyncProductsAt: '2026-07-18T14:22:00',
    lastSyncOrdersAt: null,
    lastSyncInventoryAt: null,
    warehouseLinked: true,
    linkedWarehouseCode: 'WH-HCM-01',
  },
  {
    id: 'store-6',
    partnerName: 'NQA - Hộ kinh doanh Ngô Quỳnh Anh',
    channel: 'TikTok',
    shopId: '7494777458134715273',
    shopCode: 'TIKSHP470',
    shopName: 'ADDON Nước Uống Thể Thao',
    status: 'error_orders',
    connectedAt: '2026-07-02T16:04:38',
    expiredAt: '2125-06-08T16:04:08',
    daysRemaining: 36116,
    errorOrders: 12,
    syncProducts: true,
    syncOrders: true,
    syncInventory: true,
    lastSyncProductsAt: '2026-07-20T11:00:00',
    lastSyncOrdersAt: '2026-07-20T15:10:00',
    lastSyncInventoryAt: '2026-07-20T15:00:00',
    warehouseLinked: true,
    linkedWarehouseCode: 'WH-HCM-01',
  },
  {
    id: 'store-7',
    partnerName: 'AVI - Công ty TNHH Aviatek',
    channel: 'Shopee',
    shopId: '1264446953',
    shopCode: 'SHOSHP889',
    shopName: 'Bristik Store Hàn Quốc',
    status: 'expired_connection',
    connectedAt: '2026-07-02T08:40:14',
    expiredAt: '2027-07-02T08:40:13',
    daysRemaining: -2,
    errorOrders: 1,
    syncProducts: false,
    syncOrders: false,
    syncInventory: false,
    lastSyncProductsAt: null,
    lastSyncOrdersAt: null,
    lastSyncInventoryAt: null,
    warehouseLinked: false,
  },
]

export const seedStoreProductLinks: StoreProductLink[] = [
  {
    id: 'spl-1',
    storeId: 'store-1',
    channelSku: 'SKU-CHARGER-20W',
    channelName: 'Giàn phơi AVO 4 thanh',
    channelImageUrl: channelProductImage('AVO-4', '#ee4d2d'),
    omsSku: 'SKU-CHARGER-20W',
    omsName: 'Sạc nhanh 20W USB-C',
    omsImageUrl: channelProductImage('CHG', '#2563eb'),
    linked: true,
    autoLinkStatus: 'success',
    autoLinkNote: 'Khớp SKU kênh với SKU OMS',
    syncRatio: 80,
    threshold: 5,
    initialSyncQty: 50,
  },
  {
    id: 'spl-2',
    storeId: 'store-1',
    channelSku: 'AVO-GP-02',
    channelName: 'Giàn phơi AVO 6 thanh',
    channelImageUrl: channelProductImage('AVO-6', '#f97316'),
    linked: false,
    autoLinkStatus: 'failed',
    autoLinkNote: 'Không tìm thấy SKU/Barcode tương ứng trên OMS',
    syncRatio: 100,
    threshold: 0,
  },
  {
    id: 'spl-2b',
    storeId: 'store-1',
    channelSku: 'AVO-GP-03',
    channelName: 'Giàn phơi AVO kèm remote',
    channelImageUrl: channelProductImage('AVO-R', '#0ea5e9'),
    linked: false,
    autoLinkStatus: 'pending',
    syncRatio: 100,
    threshold: 0,
  },
  {
    id: 'spl-3',
    storeId: 'store-2',
    channelSku: 'SKU-CABLE-C-C-1M',
    channelName: 'Kệ inox nhà bếp',
    channelImageUrl: channelProductImage('INOX', '#64748b'),
    omsSku: 'SKU-CABLE-C-C-1M',
    omsName: 'Cáp USB-C to C 1m',
    omsImageUrl: channelProductImage('CABLE', '#0ea5e9'),
    linked: true,
    autoLinkStatus: 'success',
    autoLinkNote: 'Khớp Barcode / SKU đối tác',
    syncRatio: 100,
    threshold: 2,
    initialSyncQty: 20,
  },
]

export const seedHungOrders: HungOrder[] = [
  {
    id: 'ho-1',
    storeId: 'store-2',
    orderCode: 'SO-SHOPEE-99102',
    reason: 'Sản phẩm chưa liên kết OMS',
    createdAt: '2026-07-20T10:12:00',
    status: 'hung',
  },
  {
    id: 'ho-2',
    storeId: 'store-2',
    orderCode: 'SO-SHOPEE-99188',
    reason: 'Thiếu tồn kho',
    createdAt: '2026-07-20T11:40:00',
    status: 'hung',
  },
  {
    id: 'ho-3',
    storeId: 'store-6',
    orderCode: 'SO-TIKTOK-2201',
    reason: 'Địa chỉ không hợp lệ',
    createdAt: '2026-07-19T16:05:00',
    status: 'hung',
  },
]
