export type FulfillmentKpi = {
  key: string
  label: string
  value: number
  percent?: number
  tone: 'default' | 'orange' | 'blue' | 'green' | 'red' | 'brown'
}

export type DonutSegment = {
  label: string
  percent: number
  color: string
}

export type AreaPoint = {
  label: string
  value: number
}

export type ChannelRow = {
  channel: string
  processing: number
  fast: number
  onTime: number
  late: number
  cancelled: number
  total: number
}

export const fulfillmentKpis: FulfillmentKpi[] = [
  { key: 'total', label: 'Tổng đơn hàng', value: 9492, tone: 'default' },
  { key: 'processing', label: 'Đang xử lý', value: 892, percent: 9.4, tone: 'orange' },
  { key: 'shipped', label: 'Đã xuất kho', value: 2656, percent: 28, tone: 'blue' },
  { key: 'delivered', label: 'Giao thành công', value: 5340, percent: 56.3, tone: 'green' },
  { key: 'returned', label: 'Trả hàng', value: 71, percent: 0.7, tone: 'brown' },
  { key: 'cancelled', label: 'Hủy', value: 533, percent: 5.6, tone: 'red' },
]

export const processingSpeedSegments: DonutSegment[] = [
  { label: 'Đang xử lý', percent: 9.4, color: '#f59e0b' },
  { label: 'Xử lý nhanh', percent: 63.9, color: '#38bdf8' },
  { label: 'Xử lý đúng hạn', percent: 20.7, color: '#22c55e' },
  { label: 'Xử lý trễ', percent: 0.3, color: '#1d4ed8' },
  { label: 'Hủy', percent: 5.6, color: '#ef4444' },
]

export const processingRate = {
  percent: 90,
  shipped: 8067,
  total: 8959,
}

export const completionRate = {
  percent: 59.8,
  delivered: 5354,
  total: 8959,
}

export const needsProcessingCount = 97

export const avgProcessingTime: AreaPoint[] = [
  { label: '0', value: 420 },
  { label: '1', value: 5200 },
  { label: '2', value: 2500 },
  { label: '3', value: 2100 },
  { label: '4+', value: 780 },
]

export const avgDeliveryTime: AreaPoint[] = [
  { label: '0', value: 120 },
  { label: '1', value: 3000 },
  { label: '2', value: 1200 },
  { label: '3', value: 900 },
  { label: '4', value: 700 },
  { label: '5', value: 520 },
  { label: '6', value: 430 },
  { label: '7', value: 360 },
  { label: '8', value: 300 },
  { label: '9', value: 240 },
  { label: '10', value: 180 },
  { label: '11+', value: 120 },
]

export const channelBreakdown: ChannelRow[] = [
  {
    channel: 'Shopee',
    processing: 312,
    fast: 1840,
    onTime: 620,
    late: 8,
    cancelled: 96,
    total: 2876,
  },
  {
    channel: 'TikTok Shop',
    processing: 248,
    fast: 1520,
    onTime: 510,
    late: 6,
    cancelled: 84,
    total: 2368,
  },
  {
    channel: 'Lazada',
    processing: 186,
    fast: 1180,
    onTime: 390,
    late: 4,
    cancelled: 62,
    total: 1822,
  },
  {
    channel: 'Website',
    processing: 96,
    fast: 640,
    onTime: 210,
    late: 2,
    cancelled: 38,
    total: 986,
  },
  {
    channel: 'Khác',
    processing: 50,
    fast: 320,
    onTime: 110,
    late: 1,
    cancelled: 19,
    total: 500,
  },
]

export const salesChannelOptions = [
  { value: 'all', label: 'Tất cả kênh' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'tiktok', label: 'TikTok Shop' },
  { value: 'lazada', label: 'Lazada' },
  { value: 'website', label: 'Website' },
]

export const partnerFilterOptions = [
  { value: 'all', label: 'Tất cả đối tác' },
  { value: 'HAC', label: 'HAC - CÔNG TY TNHH HAC RETAIL' },
  { value: 'KHAITN02', label: 'KHAITN02 - CÔNG TY TNHH EVERCHARGE01' },
  { value: 'CUS-002', label: 'CUS-002 - CÔNG TY TNHH GREENMART VIETNAM' },
]
