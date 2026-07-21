export type PermissionNode = {
  key: string
  title: string
  children?: PermissionNode[]
}

/** Cây quyền theo từng màn hình Control Center */
export const permissionTree: PermissionNode[] = [
  {
    key: 'dashboard',
    title: 'Tổng quan',
    children: [
      { key: 'dashboard.view', title: 'Xem tổng quan' },
      { key: 'dashboard.export', title: 'Xuất báo cáo nhanh' },
    ],
  },
  {
    key: 'onboarding',
    title: 'Onboarding',
    children: [
      { key: 'onboarding.view', title: 'Xem wizard' },
      { key: 'onboarding.create', title: 'Tạo khách hàng mới' },
      { key: 'onboarding.update', title: 'Cập nhật cấu hình onboarding' },
    ],
  },
  {
    key: 'customers',
    title: 'Khách hàng',
    children: [
      {
        key: 'customers.list',
        title: 'Khách hàng',
        children: [
          { key: 'customers.view', title: 'Xem danh sách' },
          { key: 'customers.create', title: 'Thêm khách hàng' },
          { key: 'customers.update', title: 'Cập nhật khách hàng' },
          { key: 'customers.export', title: 'Xuất CSV' },
        ],
      },
      {
        key: 'customers.stores',
        title: 'Quản lý cửa hàng',
        children: [
          { key: 'customers.stores.view', title: 'Xem danh sách cửa hàng' },
          { key: 'customers.stores.filter', title: 'Lọc theo đối tác / kênh' },
          { key: 'customers.stores.connection', title: 'Theo dõi trạng thái kết nối' },
        ],
      },
    ],
  },
  {
    key: 'warehouses',
    title: 'Thiết lập',
    children: [
      {
        key: 'warehouses.list',
        title: 'Kho',
        children: [
          { key: 'warehouses.view', title: 'Xem danh sách kho' },
          { key: 'warehouses.create', title: 'Tạo kho' },
          { key: 'warehouses.update', title: 'Cập nhật kho' },
          {
            key: 'warehouses.layout',
            title: 'Layout kho',
            children: [
              { key: 'warehouses.layout.view', title: 'Xem layout' },
              { key: 'warehouses.layout.edit', title: 'Chỉnh sửa zone / location' },
            ],
          },
        ],
      },
      {
        key: 'warehouses.storage',
        title: 'Thiết bị chứa hàng',
        children: [
          { key: 'warehouses.storage.view', title: 'Xem thiết bị chứa hàng' },
          { key: 'warehouses.storage.create', title: 'Tạo thiết bị chứa hàng' },
          { key: 'warehouses.storage.update', title: 'Cập nhật thiết bị' },
          { key: 'warehouses.storage.delete', title: 'Xóa thiết bị' },
          { key: 'warehouses.storage.import', title: 'Import Excel' },
          { key: 'warehouses.storage.print', title: 'In barcode thiết bị' },
        ],
      },
      {
        key: 'warehouses.materials',
        title: 'Vật tư',
        children: [
          { key: 'warehouses.materials.view', title: 'Xem vật tư' },
          { key: 'warehouses.materials.create', title: 'Thêm vật tư' },
          { key: 'warehouses.materials.update', title: 'Cập nhật vật tư' },
          { key: 'warehouses.materials.delete', title: 'Xóa vật tư' },
          { key: 'warehouses.materials.print', title: 'In mã vật tư' },
        ],
      },
    ],
  },
  {
    key: 'staff',
    title: 'Nhân sự & truy cập',
    children: [
      {
        key: 'staff.roles',
        title: 'Quản lý nhóm quyền',
        children: [
          { key: 'staff.roles.view', title: 'Xem nhóm quyền' },
          { key: 'staff.roles.create', title: 'Tạo nhóm quyền' },
          { key: 'staff.roles.update', title: 'Cập nhật nhóm quyền' },
          { key: 'staff.roles.delete', title: 'Xóa nhóm quyền' },
        ],
      },
      {
        key: 'staff.users',
        title: 'Quản lý nhân sự',
        children: [
          { key: 'staff.users.view', title: 'Xem nhân viên' },
          { key: 'staff.users.create', title: 'Tạo nhân viên' },
          { key: 'staff.users.update', title: 'Cập nhật nhân viên' },
          { key: 'staff.users.reset_password', title: 'Đặt lại mật khẩu' },
          { key: 'staff.users.disable', title: 'Vô hiệu hóa / kích hoạt' },
        ],
      },
    ],
  },
  {
    key: 'pickup',
    title: 'Phân công lấy hàng',
    children: [
      { key: 'pickup.view', title: 'Xem wave / phân công' },
      { key: 'pickup.create', title: 'Tạo wave' },
      { key: 'pickup.assign', title: 'Phân công picker' },
      { key: 'pickup.update', title: 'Cập nhật trạng thái' },
    ],
  },
  {
    key: 'catalog',
    title: 'Sản phẩm',
    children: [
      {
        key: 'catalog.sku',
        title: 'Product & SKU',
        children: [
          { key: 'catalog.view', title: 'Xem danh sách SKU' },
          { key: 'catalog.create', title: 'Thêm SKU' },
          { key: 'catalog.update', title: 'Cập nhật SKU' },
          { key: 'catalog.import', title: 'Import' },
        ],
      },
      {
        key: 'catalog.locations',
        title: 'Vị trí sản phẩm',
        children: [
          { key: 'catalog.locations.view', title: 'Xem vị trí sản phẩm' },
          { key: 'catalog.locations.filter', title: 'Lọc theo đối tác / SKU' },
        ],
      },
      {
        key: 'catalog.location_history',
        title: 'Lịch sử vị trí sản phẩm',
        children: [
          { key: 'catalog.location_history.view', title: 'Xem lịch sử vị trí' },
          { key: 'catalog.location_history.export', title: 'Xuất Excel' },
        ],
      },
    ],
  },
  {
    key: 'carriers',
    title: 'Đơn vị vận chuyển',
    children: [
      {
        key: 'carriers.units',
        title: 'Đơn vị vận chuyển',
        children: [
          { key: 'carriers.units.view', title: 'Xem ĐVVC' },
          { key: 'carriers.units.create', title: 'Thêm ĐVVC' },
          { key: 'carriers.units.update', title: 'Cập nhật ĐVVC' },
          { key: 'carriers.units.delete', title: 'Xóa ĐVVC' },
        ],
      },
      {
        key: 'carriers.accounts',
        title: 'Tài khoản đơn vị vận chuyển',
        children: [
          { key: 'carriers.accounts.view', title: 'Xem tài khoản ĐVVC' },
          { key: 'carriers.accounts.create', title: 'Thêm tài khoản ĐVVC' },
          { key: 'carriers.accounts.update', title: 'Cập nhật tài khoản ĐVVC' },
          { key: 'carriers.accounts.delete', title: 'Xóa tài khoản ĐVVC' },
          { key: 'carriers.accounts.connect', title: 'Kết nối / ngắt kết nối' },
        ],
      },
      {
        key: 'carriers.packages',
        title: 'Gói vận chuyển',
        children: [
          { key: 'carriers.packages.view', title: 'Xem gói VC' },
          { key: 'carriers.packages.create', title: 'Tạo gói VC' },
          { key: 'carriers.packages.update', title: 'Cập nhật gói VC' },
          { key: 'carriers.packages.delete', title: 'Xóa gói VC' },
          { key: 'carriers.packages.link_accounts', title: 'Gắn tài khoản khách hàng' },
        ],
      },
    ],
  },
  {
    key: 'reports',
    title: 'Báo cáo',
    children: [
      { key: 'reports.view', title: 'Xem báo cáo' },
      { key: 'reports.export', title: 'Xuất file' },
    ],
  },
  {
    key: 'system',
    title: 'Hệ thống',
    children: [
      {
        key: 'system.audit',
        title: 'Audit log',
        children: [{ key: 'system.audit.view', title: 'Xem nhật ký' }],
      },
      {
        key: 'system.health',
        title: 'Trạng thái dịch vụ',
        children: [{ key: 'system.health.view', title: 'Xem health check' }],
      },
    ],
  },
]

export function collectPermissionKeys(nodes: PermissionNode[] = permissionTree): string[] {
  const keys: string[] = []
  const walk = (list: PermissionNode[]) => {
    for (const node of list) {
      if (node.children?.length) walk(node.children)
      else keys.push(node.key)
    }
  }
  walk(nodes)
  return keys
}

export const ALL_PERMISSION_KEYS = collectPermissionKeys()

export function filterPermissionTree(
  nodes: PermissionNode[],
  query: string,
): PermissionNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes

  const filterNode = (node: PermissionNode): PermissionNode | null => {
    const selfMatch = node.title.toLowerCase().includes(q) || node.key.toLowerCase().includes(q)
    if (!node.children?.length) return selfMatch ? node : null
    const children = node.children.map(filterNode).filter(Boolean) as PermissionNode[]
    if (selfMatch || children.length) return { ...node, children }
    return null
  }

  return nodes.map(filterNode).filter(Boolean) as PermissionNode[]
}
