export type CarrierCode =
  | 'GHTK'
  | 'NJV'
  | 'NTL'
  | 'SPX'
  | 'JTEVN'
  | 'VNP'
  | 'VTP'
  | 'GHN'
  | 'GHSV'

export type FieldType = 'text' | 'password' | 'checkbox' | 'select' | 'email' | 'phone'

export type CarrierFieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  hint?: string
  guideLink?: boolean
  options?: { value: string; label: string }[]
}

export type CarrierOption = {
  code: CarrierCode
  shortName: string
  name: string
  color: string
  label: string
  fields: CarrierFieldDef[]
}

export const carrierCatalog: CarrierOption[] = [
  {
    code: 'GHTK',
    shortName: 'GHTK',
    name: 'Giao Hàng Tiết Kiệm',
    color: '#16a34a',
    label: 'GHTK- Giao Hàng Tiết Kiệm',
    fields: [
      { name: 'isB2C', label: 'Là tài khoản Cá nhân (B2C)', type: 'checkbox' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
      {
        name: 'token',
        label: 'Token',
        type: 'text',
        required: true,
        hint: 'Token API do GHTK cấp',
      },
    ],
  },
  {
    code: 'NJV',
    shortName: 'NJV',
    name: 'Ninja Van',
    color: '#dc2626',
    label: 'NJV- Ninja Van',
    fields: [
      { name: 'njvClientId', label: 'NJV client id', type: 'text', required: true },
      { name: 'njvClientSecret', label: 'NJV client secret', type: 'password', required: true },
    ],
  },
  {
    code: 'NTL',
    shortName: 'NTL',
    name: 'Nhất Tín Logistics',
    color: '#ea580c',
    label: 'NTL- Nhất Tín Logistics',
    fields: [
      {
        name: 'username',
        label: 'Tên đăng nhập',
        type: 'text',
        required: true,
        hint: 'Tài khoản portal Nhất Tín',
      },
      {
        name: 'password',
        label: 'Mật khẩu',
        type: 'password',
        required: true,
        guideLink: true,
      },
      {
        name: 'partnerPortalId',
        label: 'Partner Portal Id',
        type: 'text',
        hint: 'ID đối tác trên portal',
      },
    ],
  },
  {
    code: 'SPX',
    shortName: 'SPX',
    name: 'Shopee Express',
    color: '#f97316',
    label: 'SPX- Shopee Express VietNam',
    fields: [
      { name: 'userId', label: 'User ID', type: 'text', required: true },
      {
        name: 'userSecret',
        label: 'User Secret',
        type: 'text',
        required: true,
        hint: 'Secret key do SPX cấp',
      },
      { name: 'allowCoInspection', label: 'Được đồng kiểm', type: 'checkbox' },
      {
        name: 'allowPartialDelivery',
        label: 'Cho phép giao hàng một phần',
        type: 'checkbox',
      },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Số điện thoại', type: 'phone' },
    ],
  },
  {
    code: 'JTEVN',
    shortName: 'JTEVN',
    name: 'J&T Express',
    color: '#ea580c',
    label: 'JTEVN- J&T Express VietNam',
    fields: [
      {
        name: 'jtAppAccountCode',
        label: 'Mã tài khoản của ứng dụng J&T Express',
        type: 'text',
        required: true,
      },
      {
        name: 'jtAppKey',
        label: 'Mã key của ứng dụng J&T Express',
        type: 'text',
        required: true,
      },
      { name: 'jtCustomerCode', label: 'Mã khách hàng', type: 'text', required: true },
      { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
    ],
  },
  {
    code: 'VNP',
    shortName: 'VNP',
    name: 'Vietnam Post',
    color: '#f59e0b',
    label: 'VNP- Vietnam Post',
    fields: [
      { name: 'username', label: 'Tên đăng nhập', type: 'text', required: true },
      { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
      { name: 'customerCode', label: 'Mã khách hàng', type: 'text', required: true },
      { name: 'contractCode', label: 'Mã hợp đồng', type: 'text' },
    ],
  },
  {
    code: 'VTP',
    shortName: 'VTP',
    name: 'Viettel Post',
    color: '#dc2626',
    label: 'VTP- Viettel Post',
    fields: [
      { name: 'username', label: 'Tên đăng nhập', type: 'text', required: true },
      { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
      {
        name: 'token',
        label: 'Token',
        type: 'text',
        guideLink: true,
      },
      {
        name: 'useViettelLabel',
        label: 'Sử dụng nhãn vận chuyển của Viettel Post',
        type: 'checkbox',
        hint:
          'Khi tùy chỉnh này được chọn thì hệ thống sẽ lấy nhãn vận chuyển được cung cấp bởi Viettel Post và bỏ qua các nhãn tùy chỉnh riêng.',
      },
    ],
  },
  {
    code: 'GHN',
    shortName: 'GHN',
    name: 'Giao Hàng Nhanh',
    color: '#f97316',
    label: 'GHN- Giao Hàng Nhanh',
    fields: [
      { name: 'token', label: 'Token', type: 'text', required: true, hint: 'API Token GHN' },
      { name: 'shopId', label: 'Shop ID', type: 'text', required: true },
      { name: 'phone', label: 'Số điện thoại lấy hàng', type: 'phone' },
    ],
  },
  {
    code: 'GHSV',
    shortName: 'GHSV',
    name: 'Giao Hàng Siêu Việt',
    color: '#2563eb',
    label: 'GHSV- Giao Hàng Siêu Việt',
    fields: [
      { name: 'username', label: 'Tên đăng nhập', type: 'text' },
      { name: 'password', label: 'Mật khẩu', type: 'password' },
      {
        name: 'coInspectionOption',
        label: 'Tùy chọn cho phép tạo đơn đồng kiểm',
        type: 'select',
        options: [
          { value: 'none', label: 'Không cho xem hàng' },
          { value: 'view', label: 'Cho xem hàng' },
          { value: 'try', label: 'Cho thử hàng' },
        ],
      },
      { name: 'apiToken', label: 'Api Token', type: 'text', required: true },
      { name: 'shopCode', label: 'Mã cửa hàng', type: 'text', required: true },
    ],
  },
]

export function getCarrierByCode(code?: string) {
  return carrierCatalog.find((c) => c.code === code)
}

export function mapLegacyCarrierCode(code: string): CarrierCode {
  if (code === 'JT') return 'JTEVN'
  if (code === 'VNPOST') return 'VNP'
  if ((carrierCatalog as { code: string }[]).some((c) => c.code === code)) {
    return code as CarrierCode
  }
  return 'GHN'
}
