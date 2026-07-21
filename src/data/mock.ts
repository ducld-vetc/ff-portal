export type StaffMember = {
  id: string
  name: string
  username: string
  roles: string[]
  customerScope: string
  warehouseScope: string
  lastLoginAt: string | null
  status: 'active' | 'inactive'
}

export type Customer = {
  id: string
  code: string
  name: string
  legalName: string
  taxCode: string
  contact: string
  email: string
  phone?: string
  address?: string
  warehouses: number
  productCount: number
  capabilities: string[]
  status: 'active' | 'draft' | 'inactive'
  createdAt: string
}

export type Warehouse = {
  id: string
  code: string
  name: string
  address: string
  customer: string
  zones: number
  status: 'active' | 'inactive'
}

export type Product = {
  id: string
  sku: string
  name: string
  barcode: string
  customer: string
  weightKg: number
  status: 'active' | 'inactive'
}

export type Carrier = {
  id: string
  code: string
  name: string
  service: string
  cod: boolean
  status: 'active' | 'inactive'
}

export type PickupAssignment = {
  id: string
  wave: string
  warehouse: string
  picker: string
  orders: number
  items: number
  status: 'pending' | 'in_progress' | 'done'
  assignedAt: string
}

export const staffMembers: StaffMember[] = [
  {
    id: '1',
    name: 'Nam Vương Bá',
    username: 'nam.vuong',
    roles: [],
    customerScope: 'Toàn cục',
    warehouseScope: 'Toàn cục',
    lastLoginAt: null,
    status: 'active',
  },
  {
    id: '2',
    name: 'Trần Ngọc Khải',
    username: 'khai.tran',
    roles: [],
    customerScope: 'Toàn cục',
    warehouseScope: 'Toàn cục',
    lastLoginAt: null,
    status: 'active',
  },
  {
    id: '3',
    name: 'E2E Warehouse Operator',
    username: 'e2e.wh.op',
    roles: [
      'WAREHOUSE_MANAGER',
      'RECEIVING_OPERATOR',
      'PUTAWAY_OPERATOR',
      'PICKER',
      'PACKER',
      'HANDOVER_OPERATOR',
    ],
    customerScope: '1',
    warehouseScope: '1',
    lastLoginAt: null,
    status: 'active',
  },
  {
    id: '4',
    name: 'Admin System',
    username: 'admin',
    roles: ['SUPER_ADMIN'],
    customerScope: 'Toàn cục',
    warehouseScope: 'Toàn cục',
    lastLoginAt: '2026-07-20T09:12:00',
    status: 'active',
  },
  {
    id: '5',
    name: 'Nguyễn Thị Hằng',
    username: 'hang.nguyen',
    roles: ['PICKER', 'PACKER'],
    customerScope: '2',
    warehouseScope: '1',
    lastLoginAt: '2026-07-19T16:40:00',
    status: 'active',
  },
  {
    id: '6',
    name: 'Lê Minh Quân',
    username: 'quan.le',
    roles: ['RECEIVING_OPERATOR'],
    customerScope: '1',
    warehouseScope: '2',
    lastLoginAt: null,
    status: 'inactive',
  },
]

export const customers: Customer[] = [
  {
    id: '1',
    code: 'KHAITN02',
    name: 'Trần Ngọc Khải',
    legalName: 'CÔNG TY TNHH EVERCHARGE01',
    taxCode: '027000573',
    contact: 'Trần Ngọc Khải',
    email: 'ops@evercharge.vn',
    phone: '',
    address: '',
    warehouses: 2,
    productCount: 0,
    capabilities: ['Quản lý sản phẩm', 'Nhập hàng', 'Xuất hàng'],
    status: 'active',
    createdAt: '2026-07-19T10:18:00',
  },
  {
    id: '2',
    code: 'CUS-002',
    name: 'GreenMart Vietnam',
    legalName: 'CÔNG TY TNHH GREENMART VIETNAM',
    taxCode: '0109876543',
    contact: 'Trần Thị B',
    email: 'fulfillment@greenmart.vn',
    phone: '0909123456',
    address: 'Quận 1, TP.HCM',
    warehouses: 1,
    productCount: 128,
    capabilities: ['Quản lý sản phẩm', 'Xuất hàng'],
    status: 'active',
    createdAt: '2026-03-02T09:00:00',
  },
  {
    id: '3',
    code: 'CUS-003',
    name: 'ShopFast Demo',
    legalName: 'CÔNG TY TNHH SHOPFAST DEMO',
    taxCode: '0405566778',
    contact: 'Lê C',
    email: 'demo@shopfast.vn',
    warehouses: 0,
    productCount: 0,
    capabilities: [],
    status: 'draft',
    createdAt: '2026-07-15T14:30:00',
  },
]

export const warehouses: Warehouse[] = [
  {
    id: '1',
    code: 'WH-HCM-01',
    name: 'Kho HCM Quận 7',
    address: '12 Nguyễn Văn Linh, Q.7, TP.HCM',
    customer: 'CÔNG TY TNHH EVERCHARGE01',
    zones: 8,
    status: 'active',
  },
  {
    id: '2',
    code: 'WH-HN-01',
    name: 'Kho Hà Nội Đông Anh',
    address: 'KCN Thăng Long, Đông Anh, Hà Nội',
    customer: 'CÔNG TY TNHH EVERCHARGE01',
    zones: 5,
    status: 'active',
  },
  {
    id: '3',
    code: 'WH-DN-01',
    name: 'Kho Đà Nẵng',
    address: 'Liên Chiểu, Đà Nẵng',
    customer: 'CÔNG TY TNHH GREENMART VIETNAM',
    zones: 3,
    status: 'active',
  },
]

export const products: Product[] = [
  {
    id: '1',
    sku: 'SKU-CHARGER-20W',
    name: 'Sạc nhanh 20W USB-C',
    barcode: '8936001234567',
    customer: 'EverCharge Retail',
    weightKg: 0.18,
    status: 'active',
  },
  {
    id: '2',
    sku: 'SKU-CABLE-C-C-1M',
    name: 'Cáp USB-C to C 1m',
    barcode: '8936001234568',
    customer: 'EverCharge Retail',
    weightKg: 0.06,
    status: 'active',
  },
  {
    id: '3',
    sku: 'SKU-CASE-IP15',
    name: 'Ốp lưng iPhone 15',
    barcode: '8936009988776',
    customer: 'GreenMart Vietnam',
    weightKg: 0.04,
    status: 'active',
  },
  {
    id: '4',
    sku: 'SKU-EARBUD-BT',
    name: 'Tai nghe Bluetooth TWS',
    barcode: '8936005544332',
    customer: 'EverCharge Retail',
    weightKg: 0.12,
    status: 'inactive',
  },
]

export const carriers: Carrier[] = [
  {
    id: '1',
    code: 'GHN',
    name: 'Giao Hàng Nhanh',
    service: 'Standard / Express',
    cod: true,
    status: 'active',
  },
  {
    id: '2',
    code: 'GHTK',
    name: 'Giao Hàng Tiết Kiệm',
    service: 'Standard',
    cod: true,
    status: 'active',
  },
  {
    id: '3',
    code: 'JT',
    name: 'J&T Express',
    service: 'Express',
    cod: true,
    status: 'active',
  },
  {
    id: '4',
    code: 'VNPOST',
    name: 'Vietnam Post',
    service: 'Economy',
    cod: false,
    status: 'inactive',
  },
]

export const pickupAssignments: PickupAssignment[] = [
  {
    id: '1',
    wave: 'WAVE-20260720-01',
    warehouse: 'WH-HCM-01',
    picker: 'Nguyễn Thị Hằng',
    orders: 24,
    items: 86,
    status: 'in_progress',
    assignedAt: '2026-07-20T08:30:00',
  },
  {
    id: '2',
    wave: 'WAVE-20260720-02',
    warehouse: 'WH-HCM-01',
    picker: 'E2E Warehouse Operator',
    orders: 18,
    items: 52,
    status: 'pending',
    assignedAt: '2026-07-20T09:05:00',
  },
  {
    id: '3',
    wave: 'WAVE-20260719-08',
    warehouse: 'WH-HN-01',
    picker: 'Trần Ngọc Khải',
    orders: 31,
    items: 120,
    status: 'done',
    assignedAt: '2026-07-19T14:20:00',
  },
]

export const customerOptions = [
  { value: 'all', label: 'Tất cả khách hàng' },
  { value: '1', label: 'EverCharge Retail' },
  { value: '2', label: 'GreenMart Vietnam' },
  { value: '3', label: 'ShopFast Demo' },
]

export const warehouseOptions = [
  { value: 'all', label: 'Tất cả kho' },
  { value: '1', label: 'WH-HCM-01 · Kho HCM Quận 7' },
  { value: '2', label: 'WH-HN-01 · Kho Hà Nội Đông Anh' },
  { value: '3', label: 'WH-DN-01 · Kho Đà Nẵng' },
]
