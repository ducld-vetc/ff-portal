import type { ReactNode } from 'react'
import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  CarOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  GiftOutlined,
  HistoryOutlined,
  HomeOutlined,
  IdcardOutlined,
  InboxOutlined,
  ProductOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  WarningOutlined,
} from '@ant-design/icons'

function menuLabel(text: string, isNew = false): ReactNode {
  if (!isNew) return text
  return (
    <span className="menu-item-label">
      <span className="menu-item-text">{text}</span>
      <span className="menu-new-badge">Mới</span>
    </span>
  )
}

/** Menu dành cho Admin / nội bộ */
export const adminMenuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: menuLabel('Tổng quan', true) },
  { key: '/onboarding', icon: <UsergroupAddOutlined />, label: 'Onboarding' },
  {
    key: 'customers-group',
    icon: <BankOutlined />,
    label: 'Khách hàng',
    children: [
      { key: '/customers', icon: <BankOutlined />, label: 'Khách hàng' },
      { key: '/customers/stores', icon: <ShopOutlined />, label: 'Quản lý cửa hàng' },
    ],
  },
  {
    key: 'settings-group',
    icon: <SettingOutlined />,
    label: 'Thiết lập',
    children: [
      { key: '/warehouses', icon: <HomeOutlined />, label: 'Kho' },
      { key: '/warehouses/materials', icon: <InboxOutlined />, label: menuLabel('Vật tư', true) },
      {
        key: '/warehouses/storage-devices',
        icon: <AppstoreOutlined />,
        label: menuLabel('Thiết bị chứa hàng', true),
      },
    ],
  },
  {
    key: 'staff-group',
    icon: <TeamOutlined />,
    label: 'Nhân sự & truy cập',
    children: [
      {
        key: '/staff/roles',
        icon: <SafetyCertificateOutlined />,
        label: menuLabel('Quản lý nhóm quyền', true),
      },
      { key: '/staff/users', icon: <UserOutlined />, label: menuLabel('Quản lý nhân sự', true) },
    ],
  },
  { key: '/pickup-assignments', icon: <ApartmentOutlined />, label: 'Phân công lấy hàng' },
  {
    key: 'products-group',
    icon: <ProductOutlined />,
    label: 'Sản phẩm',
    children: [
      { key: '/catalog', icon: <ProductOutlined />, label: menuLabel('Product & SKU', true) },
      {
        key: '/products/locations',
        icon: <EnvironmentOutlined />,
        label: menuLabel('Vị trí sản phẩm', true),
      },
      {
        key: '/products/location-history',
        icon: <HistoryOutlined />,
        label: menuLabel('Lịch sử vị trí sản phẩm', true),
      },
    ],
  },
  {
    key: 'carriers-group',
    icon: <CarOutlined />,
    label: 'Đơn vị vận chuyển',
    children: [
      { key: '/carriers', icon: <CarOutlined />, label: menuLabel('Đơn vị vận chuyển', true) },
      {
        key: '/carriers/accounts',
        icon: <IdcardOutlined />,
        label: menuLabel('Tài khoản đơn vị vận chuyển', true),
      },
      { key: '/carriers/packages', icon: <GiftOutlined />, label: menuLabel('Gói vận chuyển', true) },
    ],
  },
  { key: '/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
  {
    key: 'system-group',
    icon: <SettingOutlined />,
    label: 'Hệ thống',
    children: [
      { key: '/audit', icon: <AuditOutlined />, label: 'Audit log' },
      { key: '/system', icon: <SettingOutlined />, label: 'Trạng thái dịch vụ' },
    ],
  },
]

/** Menu cổng Khách hàng — bám cấu trúc HDSD VietFul Partner */
export const customerMenuItems = [
  { key: '/client', icon: <HomeOutlined />, label: 'Trang chủ' },
  { key: '/client/dashboard', icon: <DashboardOutlined />, label: menuLabel('Bảng điều khiển', true) },
  {
    key: 'client-ops-group',
    icon: <ShoppingCartOutlined />,
    label: 'Vận hành',
    children: [
      { key: '/client/operations/inbound', icon: <InboxOutlined />, label: 'Nhập kho' },
      { key: '/client/operations/outbound', icon: <ShoppingCartOutlined />, label: 'Xuất kho' },
      { key: '/client/operations/waybills', icon: <CarOutlined />, label: 'Vận đơn' },
      { key: '/client/operations/stocktake', icon: <FileProtectOutlined />, label: 'Kiểm kê' },
      {
        key: '/client/operations/error-outbound',
        icon: <WarningOutlined />,
        label: 'Xuất kho lỗi',
      },
    ],
  },
  {
    key: 'client-channel-group',
    icon: <ShopOutlined />,
    label: 'Kênh bán hàng',
    children: [
      {
        key: '/client/stores',
        icon: <ShopOutlined />,
        label: menuLabel('Quản lý cửa hàng', true),
      },
      {
        key: '/client/channel-conditions',
        icon: <AppstoreOutlined />,
        label: 'Tình trạng HH mặc định',
      },
    ],
  },
  {
    key: 'client-products-group',
    icon: <ProductOutlined />,
    label: 'Quản lý sản phẩm',
    children: [
      { key: '/client/catalog', icon: <ProductOutlined />, label: menuLabel('Sản phẩm', true) },
      { key: '/client/products/categories', icon: <AppstoreOutlined />, label: 'Danh mục sản phẩm' },
      { key: '/client/products/units', icon: <InboxOutlined />, label: 'Đơn vị tính' },
      {
        key: '/client/products/locations',
        icon: <EnvironmentOutlined />,
        label: menuLabel('Vị trí sản phẩm', true),
      },
      {
        key: '/client/products/location-history',
        icon: <HistoryOutlined />,
        label: menuLabel('Lịch sử vị trí', true),
      },
    ],
  },
  {
    key: 'client-shipping-group',
    icon: <CarOutlined />,
    label: 'Vận chuyển',
    children: [
      { key: '/client/carriers/accounts', icon: <IdcardOutlined />, label: 'Tài khoản ĐVVC' },
      { key: '/client/carriers/packages', icon: <GiftOutlined />, label: 'Gói vận chuyển' },
    ],
  },
  { key: '/client/cod', icon: <FileProtectOutlined />, label: 'Quản lý COD' },
  { key: '/client/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
]

export const adminHomePath = '/dashboard'
export const customerHomePath = '/client'
