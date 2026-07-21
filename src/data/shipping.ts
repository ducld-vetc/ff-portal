import { carriers as seedCarriers, type Carrier } from './mock'

export type { Carrier }

export type CarrierAccount = {
  id: string
  type: 'customer' | 'customer_warehouse'
  setupType: 'platform' | 'partner'
  name: string
  carrierCode: string
  carrierLabel: string
  partnerCode: string
  partnerName: string
  customerId: string
  warehouseCode?: string
  warehouseName?: string
  createdAt: string
  status: 'active' | 'inactive'
  connection: 'connected' | 'disconnected'
  credentials?: Record<string, string | boolean | number | undefined>
}

export type WeightTier = {
  id: string
  fromGram: number
  toGram: number
  stepGram: number
  feePerStep: number
  cost: number
  partner3pl?: string
}

export type ShippingPackage = {
  id: string
  route: string
  serviceCode: string
  serviceName: string
  destination: string
  slaFastHours: number
  slaSlowHours: number
  partner3pl?: string
  applyByDistrict: boolean
  weightTiers: WeightTier[]
  accountIds: string[]
  status: 'active' | 'inactive'
}

export const routes = [
  { value: 'NOI_THANH', label: 'Nội thành' },
  { value: 'LIEN_TINH', label: 'Liên tỉnh' },
  { value: 'TOAN_QUOC', label: 'Toàn quốc' },
  { value: 'NOI_DIA', label: 'Nội địa' },
]

export const partner3plOptions = [
  { value: 'HANGHOA247', label: 'HANGHOA247' },
  { value: 'SPEED_FAST', label: 'SPEED_FAST' },
  { value: 'GHN_3PL', label: 'GHN 3PL' },
  { value: 'GHTK_3PL', label: 'GHTK 3PL' },
]

export const seedCarrierList: Carrier[] = [...seedCarriers]

export const carrierAccounts: CarrierAccount[] = [
  {
    id: 'acc-1',
    type: 'customer',
    setupType: 'partner',
    name: '024LC36396',
    carrierCode: 'JT',
    carrierLabel: 'JTEVN- J&T Express VietNam',
    partnerCode: 'HAC',
    partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
    customerId: '1',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'GLW - Kho Hải Bối - Đông Anh',
    createdAt: '2025-10-03',
    status: 'active',
    connection: 'connected',
  },
  {
    id: 'acc-2',
    type: 'customer',
    setupType: 'partner',
    name: 'Tanphat',
    carrierCode: 'SPX',
    carrierLabel: 'SPX- Shopee Express VietNam',
    partnerCode: 'TPT',
    partnerName: 'TPT - CÔNG TY TNHH TÂN PHÁT TOOLS',
    customerId: '1',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'GLW - Kho Hải Bối - Đông Anh',
    createdAt: '2025-09-19',
    status: 'active',
    connection: 'connected',
  },
  {
    id: 'acc-3',
    type: 'customer',
    setupType: 'partner',
    name: 'HAC-VIETTEL',
    carrierCode: 'VTP',
    carrierLabel: 'VTP- Viettel Post',
    partnerCode: 'HAC',
    partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
    customerId: '1',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'GLW - Kho Hải Bối - Đông Anh',
    createdAt: '2025-09-08',
    status: 'active',
    connection: 'connected',
  },
  {
    id: 'acc-4',
    type: 'customer',
    setupType: 'partner',
    name: '190C6D2A',
    carrierCode: 'GHN',
    carrierLabel: 'GHN- Giao Hàng Nhanh',
    partnerCode: 'HAC',
    partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
    customerId: '1',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'GLW - Kho Hải Bối - Đông Anh',
    createdAt: '2025-08-21',
    status: 'active',
    connection: 'connected',
  },
  {
    id: 'acc-5',
    type: 'customer',
    setupType: 'partner',
    name: '1C60EN',
    carrierCode: 'GHTK',
    carrierLabel: 'GHTK- Giao Hàng Tiết Kiệm',
    partnerCode: 'HAC',
    partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
    customerId: '1',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'GLW - Kho Hải Bối - Đông Anh',
    createdAt: '2025-08-21',
    status: 'active',
    connection: 'connected',
  },
  {
    id: 'acc-6',
    type: 'customer_warehouse',
    setupType: 'partner',
    name: 'GHN-EVC10KG',
    carrierCode: 'GHN',
    carrierLabel: 'GHN- Giao Hàng Nhanh',
    partnerCode: 'EVC',
    partnerName: 'EVC - EverCharge Retail',
    customerId: '1',
    warehouseCode: 'WH-HCM-01',
    warehouseName: 'WH-HCM-01 - Kho HCM Quận 7',
    createdAt: '2025-07-12',
    status: 'active',
    connection: 'connected',
  },
  {
    id: 'acc-7',
    type: 'customer_warehouse',
    setupType: 'partner',
    name: 'GHTK-GM-DN',
    carrierCode: 'GHTK',
    carrierLabel: 'GHTK- Giao Hàng Tiết Kiệm',
    partnerCode: 'GM',
    partnerName: 'GM - GreenMart Vietnam',
    customerId: '2',
    warehouseCode: 'WH-DN-01',
    warehouseName: 'WH-DN-01 - Kho Đà Nẵng',
    createdAt: '2025-06-30',
    status: 'active',
    connection: 'connected',
  },
  {
    id: 'acc-8',
    type: 'customer',
    setupType: 'partner',
    name: 'JT-EVC',
    carrierCode: 'JT',
    carrierLabel: 'JTEVN- J&T Express VietNam',
    partnerCode: 'EVC',
    partnerName: 'EVC - EverCharge Retail',
    customerId: '1',
    createdAt: '2025-05-18',
    status: 'inactive',
    connection: 'disconnected',
  },
  {
    id: 'acc-9',
    type: 'customer_warehouse',
    setupType: 'partner',
    name: 'GHN-HAC10KG',
    carrierCode: 'GHN',
    carrierLabel: 'GHN- Giao Hàng Nhanh',
    partnerCode: 'HAC',
    partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
    customerId: '1',
    warehouseCode: 'WH-HN-01',
    warehouseName: 'GLW - Kho Hải Bối - Đông Anh',
    createdAt: '2025-04-02',
    status: 'active',
    connection: 'connected',
  },
]

export const seedShippingPackages: ShippingPackage[] = [
  {
    id: 'pkg-1',
    route: 'TOAN_QUOC',
    serviceCode: 'GHN_EXPRESS',
    serviceName: 'GHN Express',
    destination: 'Toàn quốc',
    slaFastHours: 24,
    slaSlowHours: 72,
    partner3pl: 'GHN_3PL',
    applyByDistrict: false,
    weightTiers: [
      {
        id: 'wt-1',
        fromGram: 0,
        toGram: 1000,
        stepGram: 500,
        feePerStep: 5000,
        cost: 22000,
        partner3pl: 'GHN_3PL',
      },
      {
        id: 'wt-2',
        fromGram: 1001,
        toGram: 5000,
        stepGram: 1000,
        feePerStep: 8000,
        cost: 35000,
        partner3pl: 'GHN_3PL',
      },
    ],
    accountIds: ['acc-1', 'acc-2'],
    status: 'active',
  },
  {
    id: 'pkg-2',
    route: 'LIEN_TINH',
    serviceCode: 'GHTK_STANDARD',
    serviceName: 'GHTK Standard',
    destination: 'Toàn quốc',
    slaFastHours: 48,
    slaSlowHours: 96,
    partner3pl: 'GHTK_3PL',
    applyByDistrict: true,
    weightTiers: [],
    accountIds: ['acc-3'],
    status: 'active',
  },
  {
    id: 'pkg-3',
    route: 'NOI_THANH',
    serviceCode: 'SPEED_FAST',
    serviceName: 'SPEED_FAST',
    destination: 'Toàn quốc',
    slaFastHours: 6,
    slaSlowHours: 24,
    partner3pl: 'SPEED_FAST',
    applyByDistrict: false,
    weightTiers: [],
    accountIds: [],
    status: 'active',
  },
]

export const accountTypeLabel: Record<CarrierAccount['type'], string> = {
  customer: 'Tài khoản của khách hàng',
  customer_warehouse: 'Tài khoản của khách hàng và kho',
}
