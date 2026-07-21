export type StorageType = 'serial' | 'non_serial'
export type ProductKind = 'single' | 'bundle'
export type BundleKind = 'physical' | 'virtual'
export type OutboundRule = 'fefo' | 'lefo' | 'none'
export type WarehouseKind = 'normal' | 'cold' | 'frozen' | 'hazard'

export type CatalogProduct = {
  id: string
  customerId: string
  customerCode: string
  customerName: string
  sku: string
  partnerSku?: string
  name: string
  /** URL hoặc data URL hình ảnh sản phẩm */
  imageUrl?: string
  storageType: StorageType
  productKind: ProductKind
  bundleKind?: BundleKind
  trackSerialOnOutbound: boolean
  manageByLot: boolean
  hasBarcodeList: boolean
  isPrivate: boolean
  trackExpiry: boolean
  units: string[]
  categories: string[]
  outboundRule: OutboundRule
  shelfLifeMonths?: number
  shipBeforeExpiryDays?: number
  expiryNotifyDays?: number
  minInboundShelfLifePercent?: number
  minOutboundShelfLifePercent?: number
  warehouseKind: WarehouseKind
  hsCode?: string
  originCountry?: string
  color?: string
  size?: string
  description?: string
  packingNote?: string
  status: 'active' | 'inactive'
  createdAt: string
}

function productPlaceholder(label: string, color: string) {
  const safe = encodeURIComponent(label.slice(0, 8))
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="16" fill="${color}"/><text x="80" y="86" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="18" font-weight="700">${safe}</text></svg>`,
  )}`
}

export const storageTypeOptions = [
  { value: 'serial', label: 'Serial (có số seri/iMei/ISBN/VAN)' },
  { value: 'non_serial', label: 'Non-serial (quản lý theo số lượng)' },
]

export const productKindOptions = [
  { value: 'single', label: 'Hàng lẻ' },
  { value: 'bundle', label: 'Bundle' },
]

export const bundleKindOptions = [
  { value: 'physical', label: 'Bundle vật lý' },
  { value: 'virtual', label: 'Bundle ảo' },
]

export const outboundRuleOptions = [
  { value: 'fefo', label: 'FEFO — hạn gần xuất trước' },
  { value: 'lefo', label: 'LEFO — hạn xa xuất trước' },
  { value: 'none', label: 'Không định nghĩa' },
]

export const warehouseKindOptions = [
  { value: 'normal', label: 'Kho thường' },
  { value: 'cold', label: 'Kho mát' },
  { value: 'frozen', label: 'Kho đông' },
  { value: 'hazard', label: 'Kho hàng nguy hiểm' },
]

export const unitOptions = [
  'Cái',
  'Bộ',
  'Chai',
  'Hộp',
  'Thùng',
  'Kg',
  'Gói',
  'Cuộn',
].map((value) => ({ value, label: value }))

export const categoryOptions = [
  'Mỹ phẩm',
  'Thực phẩm',
  'Tiêu dùng',
  'Điện tử',
  'Giày dép',
  'Thời trang',
  'Gia dụng',
  'Khác',
].map((value) => ({ value, label: value }))

export const countryOptions = [
  { value: 'VN', label: 'VN — Việt Nam' },
  { value: 'CN', label: 'CN — Trung Quốc' },
  { value: 'JP', label: 'JP — Nhật Bản' },
  { value: 'KR', label: 'KR — Hàn Quốc' },
  { value: 'US', label: 'US — Hoa Kỳ' },
  { value: 'TH', label: 'TH — Thái Lan' },
  { value: 'TW', label: 'TW — Đài Loan' },
]

export const storageTypeLabel: Record<StorageType, string> = {
  serial: 'Serial',
  non_serial: 'Non-serial',
}

export const productKindLabel: Record<ProductKind, string> = {
  single: 'Hàng lẻ',
  bundle: 'Bundle',
}

export const outboundRuleLabel: Record<OutboundRule, string> = {
  fefo: 'FEFO',
  lefo: 'LEFO',
  none: 'Không định nghĩa',
}

export const warehouseKindLabel: Record<WarehouseKind, string> = {
  normal: 'Kho thường',
  cold: 'Kho mát',
  frozen: 'Kho đông',
  hazard: 'Kho nguy hiểm',
}

/** Tooltip / help text cho từng trường */
export const productFieldHelp = {
  sku: 'Mã duy nhất phân loại mặt hàng trong kho. Nếu chưa có SKU, người bán tự quy định và in dán khi hàng về kho.',
  partnerSku: 'SKU nội bộ của Người bán/Đối tác kho dùng để quản lý.',
  name: 'Tên gọi sản phẩm do chủ sở hữu hàng hóa tự quy định.',
  storageType:
    'Serial: sản phẩm có số seri/iMei/ISBN/VAN. Non-serial: quản lý theo số lượng, không có số seri.',
  productKind:
    'Hàng lẻ: 1 sản phẩm riêng biệt. Bundle: gom 2+ sản phẩm (vật lý hoặc ảo).',
  bundleKind:
    'Vật lý: tồn kho đã gom sẵn. Ảo: picker gom các SKU lẻ khi xuất hàng.',
  trackSerialOnOutbound:
    'Áp dụng khi sản phẩm có số seri nhưng lưu trữ theo số lượng — chỉ khai báo seri lúc xuất kho.',
  manageByLot: 'Nhân viên kho nhập số lô khi nhận hàng để theo dõi / chỉ định xuất theo lô.',
  hasBarcodeList:
    'Dùng khi mã vạch không dán được lên SP (gốm, sứ, vải mỏng…). Hệ thống hiện danh sách barcode để chọn.',
  isPrivate:
    'Che thông tin sản phẩm trên nhãn vận chuyển (TikTok, Shopee, Lazada, Tiki).',
  trackExpiry: 'Khi nhập kho phải khai báo NSX / HSD (thực phẩm, mỹ phẩm…).',
  units: 'Một sản phẩm có thể có nhiều ĐVT và chuyển đổi qua lại khi vận hành.',
  categories: 'Phân nhóm chức năng. Một sản phẩm có thể thuộc nhiều danh mục.',
  outboundRule: 'FEFO / LEFO / Không định nghĩa. Khi xuất vẫn có thể chọn thủ công.',
  shelfLifeMonths:
    'Số tháng từ NSX đến HSD. Nếu trống, nhập kho yêu cầu cả NSX và HSD; nếu có, hệ thống tự tính.',
  shipBeforeExpiryDays:
    'Số ngày trước HSD được phép xuất. Vượt ngưỡng → tình trạng “Quá hạn xuất kho”.',
  expiryNotifyDays: 'Gửi thông báo hết hạn dựa trên số ngày so với ngày hết hạn.',
  minInboundShelfLifePercent:
    'VD 80%: chỉ cho nhập kho khi HSD còn ≥ 80%, ngược lại hệ thống từ chối.',
  minOutboundShelfLifePercent: '% tối thiểu HSD còn lại để được phép xuất kho.',
  warehouseKind: 'Kho thường, kho mát… tùy thuộc tính sản phẩm.',
  hsCode: 'Mã HS quốc tế (thường 6 số, có thể 8–10). Dùng cho thuế / kiểm soát XNK.',
  originCountry: 'Mã quốc gia xuất xứ theo ISO 3166 (VN, CN, JP…).',
  color: 'Không bắt buộc — hiển thị khi xuất báo cáo.',
  size: 'Không bắt buộc — hiển thị khi xuất báo cáo.',
  description: 'Không bắt buộc — hiển thị khi xuất báo cáo.',
  packingNote: 'Ghi chú quy cách đóng gói đặc biệt cho nhân viên packing.',
  customer: 'Sản phẩm bắt buộc gắn với một khách hàng / đối tác kho.',
  image: 'Ảnh đại diện sản phẩm hiển thị trên danh sách và phiếu thao tác kho. Hỗ trợ JPG/PNG, khuyến nghị vuông.',
} as const

export const seedCatalogProducts: CatalogProduct[] = [
  {
    id: 'cp-1',
    customerId: '1',
    customerCode: 'KHAITN02',
    customerName: 'CÔNG TY TNHH EVERCHARGE01',
    sku: 'SKU-CHARGER-20W',
    partnerSku: 'EVC-CHG-20',
    name: 'Sạc nhanh 20W USB-C',
    imageUrl: productPlaceholder('CHG', '#2563eb'),
    storageType: 'non_serial',
    productKind: 'single',
    trackSerialOnOutbound: false,
    manageByLot: false,
    hasBarcodeList: false,
    isPrivate: false,
    trackExpiry: false,
    units: ['Cái', 'Hộp'],
    categories: ['Điện tử'],
    outboundRule: 'none',
    warehouseKind: 'normal',
    hsCode: '850440',
    originCountry: 'CN',
    color: 'Trắng',
    size: 'Standard',
    description: 'Sạc nhanh PD 20W',
    packingNote: 'Bọc chống sốc, không xếp chồng quá 10 lớp',
    status: 'active',
    createdAt: '2026-07-10T09:00:00',
  },
  {
    id: 'cp-2',
    customerId: '1',
    customerCode: 'KHAITN02',
    customerName: 'CÔNG TY TNHH EVERCHARGE01',
    sku: 'SKU-CABLE-C-C-1M',
    partnerSku: 'EVC-CABLE-01',
    name: 'Cáp USB-C to C 1m',
    imageUrl: productPlaceholder('CABLE', '#0ea5e9'),
    storageType: 'non_serial',
    productKind: 'single',
    trackSerialOnOutbound: false,
    manageByLot: true,
    hasBarcodeList: false,
    isPrivate: false,
    trackExpiry: false,
    units: ['Cái'],
    categories: ['Điện tử'],
    outboundRule: 'none',
    warehouseKind: 'normal',
    originCountry: 'CN',
    status: 'active',
    createdAt: '2026-07-11T10:00:00',
  },
  {
    id: 'cp-3',
    customerId: '2',
    customerCode: 'CUS-002',
    customerName: 'CÔNG TY TNHH GREENMART VIETNAM',
    sku: 'SKU-SERUM-30ML',
    partnerSku: 'GM-SERUM-A',
    name: 'Serum dưỡng ẩm 30ml',
    imageUrl: productPlaceholder('SERUM', '#db2777'),
    storageType: 'non_serial',
    productKind: 'single',
    trackSerialOnOutbound: false,
    manageByLot: true,
    hasBarcodeList: false,
    isPrivate: false,
    trackExpiry: true,
    units: ['Chai', 'Hộp'],
    categories: ['Mỹ phẩm'],
    outboundRule: 'fefo',
    shelfLifeMonths: 24,
    shipBeforeExpiryDays: 90,
    expiryNotifyDays: 30,
    minInboundShelfLifePercent: 80,
    minOutboundShelfLifePercent: 60,
    warehouseKind: 'cold',
    hsCode: '330499',
    originCountry: 'KR',
    packingNote: 'Giữ mát, tránh ánh nắng trực tiếp',
    status: 'active',
    createdAt: '2026-06-01T08:00:00',
  },
  {
    id: 'cp-4',
    customerId: '2',
    customerCode: 'CUS-002',
    customerName: 'CÔNG TY TNHH GREENMART VIETNAM',
    sku: 'BUNDLE-GIFT-01',
    partnerSku: 'GM-GIFT-01',
    name: 'Combo quà tặng mùa hè',
    imageUrl: productPlaceholder('GIFT', '#16a34a'),
    storageType: 'non_serial',
    productKind: 'bundle',
    bundleKind: 'virtual',
    trackSerialOnOutbound: false,
    manageByLot: false,
    hasBarcodeList: false,
    isPrivate: false,
    trackExpiry: true,
    units: ['Bộ'],
    categories: ['Mỹ phẩm', 'Tiêu dùng'],
    outboundRule: 'fefo',
    shelfLifeMonths: 18,
    shipBeforeExpiryDays: 60,
    expiryNotifyDays: 21,
    minInboundShelfLifePercent: 70,
    minOutboundShelfLifePercent: 50,
    warehouseKind: 'normal',
    status: 'active',
    createdAt: '2026-06-15T11:00:00',
  },
  {
    id: 'cp-5',
    customerId: '1',
    customerCode: 'KHAITN02',
    customerName: 'CÔNG TY TNHH EVERCHARGE01',
    sku: 'SKU-PHONE-X1',
    partnerSku: 'EVC-PHONE-X1',
    name: 'Điện thoại demo X1',
    imageUrl: productPlaceholder('PHONE', '#7c3aed'),
    storageType: 'serial',
    productKind: 'single',
    trackSerialOnOutbound: false,
    manageByLot: false,
    hasBarcodeList: false,
    isPrivate: false,
    trackExpiry: false,
    units: ['Cái'],
    categories: ['Điện tử'],
    outboundRule: 'none',
    warehouseKind: 'normal',
    hsCode: '851712',
    originCountry: 'VN',
    status: 'active',
    createdAt: '2026-07-12T14:00:00',
  },
]
