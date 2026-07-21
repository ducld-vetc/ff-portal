import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  CarOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  HistoryOutlined,
  HomeOutlined,
  IdcardOutlined,
  InboxOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  ProductOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  ConfigProvider,
  Dropdown,
  Layout,
  Menu,
  Select,
  Space,
  theme as antTheme,
} from 'antd'
import viVN from 'antd/locale/vi_VN'
import { useAuth } from '../auth/AuthContext'
import { BrandMark } from '../components/PageHeader'
import { customerOptions, warehouseOptions } from '../data/mock'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/onboarding', icon: <UsergroupAddOutlined />, label: 'Onboarding' },
  { key: '/customers', icon: <BankOutlined />, label: 'Khách hàng' },
  {
    key: 'settings-group',
    icon: <SettingOutlined />,
    label: 'Thiết lập',
    children: [
      { key: '/warehouses', icon: <HomeOutlined />, label: 'Kho' },
      { key: '/warehouses/materials', icon: <InboxOutlined />, label: 'Vật tư' },
      {
        key: '/warehouses/storage-devices',
        icon: <AppstoreOutlined />,
        label: 'Thiết bị chứa hàng',
      },
    ],
  },
  {
    key: 'staff-group',
    icon: <TeamOutlined />,
    label: 'Nhân sự & truy cập',
    children: [
      { key: '/staff/roles', icon: <SafetyCertificateOutlined />, label: 'Quản lý nhóm quyền' },
      { key: '/staff/users', icon: <UserOutlined />, label: 'Quản lý nhân sự' },
    ],
  },
  { key: '/pickup-assignments', icon: <ApartmentOutlined />, label: 'Phân công lấy hàng' },
  {
    key: 'products-group',
    icon: <ProductOutlined />,
    label: 'Sản phẩm',
    children: [
      { key: '/catalog', icon: <ProductOutlined />, label: 'Product & SKU' },
      {
        key: '/products/locations',
        icon: <EnvironmentOutlined />,
        label: 'Vị trí sản phẩm',
      },
      {
        key: '/products/location-history',
        icon: <HistoryOutlined />,
        label: 'Lịch sử vị trí sản phẩm',
      },
    ],
  },
  {
    key: 'carriers-group',
    icon: <CarOutlined />,
    label: 'Đơn vị vận chuyển',
    children: [
      { key: '/carriers', icon: <CarOutlined />, label: 'Đơn vị vận chuyển' },
      { key: '/carriers/accounts', icon: <IdcardOutlined />, label: 'Tài khoản đơn vị vận chuyển' },
      { key: '/carriers/packages', icon: <GiftOutlined />, label: 'Gói vận chuyển' },
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

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>([
    'settings-group',
    'staff-group',
    'products-group',
    'carriers-group',
    'system-group',
  ])
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ffm-theme') === 'dark')

  useEffect(() => {
    if (location.pathname.startsWith('/staff')) {
      setOpenKeys((keys) => (keys.includes('staff-group') ? keys : [...keys, 'staff-group']))
    }
    if (location.pathname.startsWith('/carriers')) {
      setOpenKeys((keys) =>
        keys.includes('carriers-group') ? keys : [...keys, 'carriers-group'],
      )
    }
    if (location.pathname.startsWith('/warehouses')) {
      setOpenKeys((keys) =>
        keys.includes('settings-group') ? keys : [...keys, 'settings-group'],
      )
    }
    if (
      location.pathname.startsWith('/catalog') ||
      location.pathname.startsWith('/products')
    ) {
      setOpenKeys((keys) =>
        keys.includes('products-group') ? keys : [...keys, 'products-group'],
      )
    }
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('ffm-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const selectedKeys = useMemo(() => {
    const flat = menuItems.flatMap((item) =>
      'children' in item && item.children ? item.children : [item],
    )
    const match = flat
      .filter((item) => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`))
      .sort((a, b) => b.key.length - a.key.length)[0]
    return match ? [match.key] : ['/dashboard']
  }, [location.pathname])

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1e40af',
          colorInfo: '#3b82f6',
          borderRadius: 10,
          fontFamily: '"Fira Sans", ui-sans-serif, system-ui, sans-serif',
          fontFamilyCode: '"Fira Code", ui-monospace, monospace',
        },
        components: {
          Layout: {
            bodyBg: 'transparent',
            headerBg: 'transparent',
            siderBg: 'transparent',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            itemHeight: 42,
          },
        },
      }}
    >
      <Layout className="app-shell">
        <Sider
          className="app-sider"
          width={248}
          collapsedWidth={80}
          collapsible
          collapsed={collapsed}
          trigger={null}
          theme="dark"
        >
          <button type="button" className="brand" onClick={() => navigate('/dashboard')}>
            <BrandMark />
            {!collapsed && (
              <span>
                <strong>FulfillOne</strong>
                <small>Control Center</small>
              </span>
            )}
          </button>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={setOpenKeys}
            items={menuItems}
            onClick={({ key }) => {
              if (key.startsWith('/')) navigate(key)
            }}
            style={{ flex: 1, overflow: 'auto' }}
          />

          {!collapsed && (
            <div className="sider-footnote">
              <span className="dot" />
              Đã kết nối BFF
            </div>
          )}
        </Sider>

        <Layout>
          <Header className="app-header">
            <Space size={16}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((v) => !v)}
              />
              <div className="scope-selector">
                <Select
                  defaultValue="all"
                  options={customerOptions}
                  suffixIcon={<BankOutlined style={{ color: 'var(--color-text-muted)' }} />}
                />
                <Select
                  defaultValue="all"
                  options={warehouseOptions}
                  suffixIcon={<HomeOutlined style={{ color: 'var(--color-text-muted)' }} />}
                />
              </div>
            </Space>

            <div className="header-actions">
              <Button
                type="text"
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={() => setIsDark((v) => !v)}
              />
              <Badge dot>
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
              <Dropdown
                menu={{
                  items: [
                    { key: 'profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined /> },
                    { type: 'divider' },
                    {
                      key: 'logout',
                      label: 'Đăng xuất',
                      danger: true,
                      onClick: () => {
                        logout()
                        navigate('/login')
                      },
                    },
                  ],
                }}
              >
                <div className="user-menu">
                  <Avatar size={36}>{user.displayName.charAt(0)}</Avatar>
                  <div className="user-copy">
                    <span className="name">{user.displayName}</span>
                    <span className="role">{user.role}</span>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Header>

          <Content className="app-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}
