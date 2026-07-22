import { useNavigate } from 'react-router-dom'
import {
  AppstoreOutlined,
  BarChartOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  GiftOutlined,
  HistoryOutlined,
  IdcardOutlined,
  InboxOutlined,
  ProductOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Space, Statistic, Typography } from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { seedCatalogProducts } from '../data/productCatalog'
import { storeRows } from '../data/stores'
import { usePortal } from '../portal/PortalContext'

export default function ClientHomePage() {
  const navigate = useNavigate()
  const { setPortal, customerScope } = usePortal()
  const myStores = storeRows.filter((s) => s.partnerName === customerScope.partnerName)
  const myProducts = seedCatalogProducts.filter((p) => p.customerId === customerScope.customerId)

  return (
    <div>
      <PageHeader
        title="Cổng khách hàng"
        description={`Xin chào ${customerScope.customerName}. Theo dõi vận hành, cửa hàng kênh bán và sản phẩm của bạn.`}
        extra={
          <IconAction
            title="Sang cổng Admin"
            icon={<SwapOutlined />}
            onClick={() => {
              setPortal('admin')
              navigate('/dashboard')
            }}
          />
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Cửa hàng của tôi" value={myStores.length} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Sản phẩm / SKU" value={myProducts.length} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Đơn cần xử lý" value={97} />
          </Card>
        </Col>
      </Row>

      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        Truy cập nhanh
      </Typography.Paragraph>
      <Row gutter={[12, 12]}>
        {[
          { path: '/client/dashboard', icon: <DashboardOutlined />, title: 'Bảng điều khiển' },
          { path: '/client/operations/inbound', icon: <InboxOutlined />, title: 'Nhập kho' },
          { path: '/client/operations/outbound', icon: <ShoppingCartOutlined />, title: 'Xuất kho' },
          { path: '/client/stores', icon: <ShopOutlined />, title: 'Quản lý cửa hàng' },
          { path: '/client/catalog', icon: <ProductOutlined />, title: 'Sản phẩm' },
          { path: '/client/products/locations', icon: <EnvironmentOutlined />, title: 'Vị trí sản phẩm' },
          {
            path: '/client/products/location-history',
            icon: <HistoryOutlined />,
            title: 'Lịch sử vị trí',
          },
          { path: '/client/carriers/accounts', icon: <IdcardOutlined />, title: 'Tài khoản ĐVVC' },
          { path: '/client/carriers/packages', icon: <GiftOutlined />, title: 'Gói vận chuyển' },
          { path: '/client/cod', icon: <FileProtectOutlined />, title: 'Quản lý COD' },
          { path: '/client/reports', icon: <BarChartOutlined />, title: 'Báo cáo' },
        ].map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.path}>
            <button type="button" className="client-quick-card" onClick={() => navigate(item.path)}>
              <Space>
                <span className="client-quick-icon">{item.icon}</span>
                <strong>{item.title}</strong>
              </Space>
              <AppstoreOutlined style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </Col>
        ))}
      </Row>
    </div>
  )
}
