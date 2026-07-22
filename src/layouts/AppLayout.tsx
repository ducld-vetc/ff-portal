import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BankOutlined,
  BellOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SwapOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  ConfigProvider,
  Dropdown,
  Layout,
  Menu,
  Select,
  Space,
  Tag,
  theme as antTheme,
} from 'antd'
import { IconAction } from '../components/IconAction'
import viVN from 'antd/locale/vi_VN'
import { useAuth } from '../auth/AuthContext'
import { BrandMark } from '../components/PageHeader'
import { customerOptions, warehouseOptions } from '../data/mock'
import { usePortal } from '../portal/PortalContext'
import {
  adminHomePath,
  adminMenuItems,
  customerHomePath,
  customerMenuItems,
} from '../portal/menuConfig'

const { Header, Sider, Content } = Layout

function flattenMenuKeys(items: typeof adminMenuItems): { key: string }[] {
  return items.flatMap((item) =>
    'children' in item && item.children ? item.children : [item],
  ) as { key: string }[]
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { portal, setPortal, isCustomer } = usePortal()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ffm-theme') === 'dark')

  const menuItems = isCustomer ? customerMenuItems : adminMenuItems
  const homePath = isCustomer ? customerHomePath : adminHomePath

  useEffect(() => {
    const defaults = isCustomer
      ? [
          'client-ops-group',
          'client-channel-group',
          'client-products-group',
          'client-shipping-group',
        ]
      : [
          'customers-group',
          'settings-group',
          'staff-group',
          'products-group',
          'carriers-group',
          'system-group',
        ]
    setOpenKeys(defaults)
  }, [isCustomer])

  useEffect(() => {
    const path = location.pathname
    setOpenKeys((keys) => {
      const next = new Set(keys)
      if (path.startsWith('/customers')) next.add('customers-group')
      if (path.startsWith('/staff')) next.add('staff-group')
      if (path.startsWith('/carriers') && !path.startsWith('/client')) next.add('carriers-group')
      if (path.startsWith('/warehouses')) next.add('settings-group')
      if (
        (path.startsWith('/catalog') || path.startsWith('/products')) &&
        !path.startsWith('/client')
      ) {
        next.add('products-group')
      }
      if (path.startsWith('/client/catalog') || path.startsWith('/client/products')) {
        next.add('client-products-group')
      }
      if (path.startsWith('/client/carriers')) next.add('client-shipping-group')
      if (path.startsWith('/client/operations')) next.add('client-ops-group')
      if (path.startsWith('/client/stores') || path.startsWith('/client/channel')) {
        next.add('client-channel-group')
      }
      return [...next]
    })
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('ffm-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Keep portal mode aligned with current route namespace
  useEffect(() => {
    const onClient = location.pathname.startsWith('/client')
    if (onClient && portal !== 'customer') setPortal('customer')
    if (!onClient && portal === 'customer' && location.pathname !== '/login') {
      // stay on customer portal even if deep-linking admin routes via URL is rare;
      // only auto-switch when explicitly switching via button
    }
  }, [location.pathname, portal, setPortal])

  const selectedKeys = useMemo(() => {
    const flat = flattenMenuKeys(menuItems)
    const match = flat
      .filter(
        (item) =>
          location.pathname === item.key || location.pathname.startsWith(`${item.key}/`),
      )
      .sort((a, b) => b.key.length - a.key.length)[0]
    return match ? [match.key] : [homePath]
  }, [location.pathname, menuItems, homePath])

  const switchPortal = () => {
    if (isCustomer) {
      setPortal('admin')
      navigate(adminHomePath)
    } else {
      setPortal('customer')
      navigate(customerHomePath)
    }
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: isCustomer ? '#0f766e' : '#1e40af',
          colorInfo: isCustomer ? '#14b8a6' : '#3b82f6',
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
      <Layout className={`app-shell ${isCustomer ? 'portal-customer' : 'portal-admin'}`}>
        <Sider
          className="app-sider"
          width={248}
          collapsedWidth={80}
          collapsible
          collapsed={collapsed}
          trigger={null}
          theme="dark"
        >
          <button type="button" className="brand" onClick={() => navigate(homePath)}>
            <BrandMark />
            {!collapsed && (
              <span>
                <strong>FulfillOne</strong>
                <small>{isCustomer ? 'Customer Portal' : 'Control Center'}</small>
              </span>
            )}
          </button>

          {!collapsed && (
            <div className="portal-sider-badge">
              <Tag color={isCustomer ? 'cyan' : 'blue'}>
                {isCustomer ? 'Cổng Khách hàng' : 'Cổng Admin'}
              </Tag>
            </div>
          )}

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
              {isCustomer ? 'Không gian đối tác' : 'Đã kết nối BFF'}
            </div>
          )}
        </Sider>

        <Layout>
          <Header className="app-header">
            <Space size={16}>
              <IconAction
                title={collapsed ? 'Mở menu' : 'Thu gọn menu'}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((v) => !v)}
              />
              {!isCustomer ? (
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
              ) : (
                <Tag color="cyan" style={{ marginInlineEnd: 0 }}>
                  Đang xem với tư cách Khách hàng
                </Tag>
              )}
            </Space>

            <div className="header-actions">
              <IconAction
                title={isCustomer ? 'Sang Admin' : 'Sang Khách hàng'}
                type="primary"
                ghost={!isCustomer}
                icon={<SwapOutlined />}
                onClick={switchPortal}
                className="portal-switch-btn"
              />
              <IconAction
                title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={() => setIsDark((v) => !v)}
              />
              <Badge dot>
                <IconAction title="Thông báo" icon={<BellOutlined />} />
              </Badge>
              <Dropdown
                menu={{
                  items: [
                    { key: 'profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined /> },
                    {
                      key: 'switch-portal',
                      label: isCustomer ? 'Chuyển sang Admin' : 'Chuyển sang Khách hàng',
                      icon: <SwapOutlined />,
                      onClick: switchPortal,
                    },
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
                    <span className="role">
                      {isCustomer ? 'Customer Portal' : user.role}
                    </span>
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
