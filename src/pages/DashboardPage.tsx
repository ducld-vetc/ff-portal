import {
  BankOutlined,
  HomeOutlined,
  ProductOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Card, Col, List, Progress, Row, Space, Statistic, Tag, Typography } from 'antd'
import { PageHeader } from '../components/PageHeader'

const metrics = [
  {
    title: 'Khách hàng',
    value: 12,
    icon: <BankOutlined />,
    className: 'metric-blue',
  },
  {
    title: 'Kho hoạt động',
    value: 5,
    icon: <HomeOutlined />,
    className: 'metric-cyan',
  },
  {
    title: 'SKU active',
    value: 1842,
    icon: <ProductOutlined />,
    className: 'metric-purple',
  },
  {
    title: 'Đơn hôm nay',
    value: 326,
    icon: <ShoppingOutlined />,
    className: 'metric-orange',
  },
  {
    title: 'Nhân sự',
    value: 48,
    icon: <TeamOutlined />,
    className: 'metric-gold',
  },
  {
    title: 'Cảnh báo',
    value: 3,
    icon: <WarningOutlined />,
    className: 'metric-orange',
  },
]

const recent = [
  { title: 'Wave WAVE-20260720-01 đang lấy hàng', tag: 'PICKING', color: 'blue' },
  { title: 'Khách hàng ShopFast Demo chờ onboarding', tag: 'ONBOARDING', color: 'gold' },
  { title: 'SKU-CHARGER-20W sắp hết tồn tại WH-HCM-01', tag: 'INVENTORY', color: 'orange' },
  { title: 'Audit: Admin cập nhật role E2E Warehouse Operator', tag: 'AUDIT', color: 'purple' },
]

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Tổng quan"
        description="Theo dõi sức khỏe vận hành fulfillment theo customer / warehouse scope hiện tại."
      />

      <Row gutter={[16, 16]}>
        {metrics.map((item) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={item.title}>
            <Card className={`metric-card ${item.className}`} size="small">
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Statistic title={item.title} value={item.value} />
                <span className="metric-icon">{item.icon}</span>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card className="dashboard-card content-card" title="Công suất kho hôm nay">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Typography.Text type="secondary">Inbound</Typography.Text>
                <Progress percent={72} strokeColor="#2563eb" />
              </div>
              <div>
                <Typography.Text type="secondary">Picking</Typography.Text>
                <Progress percent={58} strokeColor="#7c3aed" />
              </div>
              <div>
                <Typography.Text type="secondary">Packing / Handover</Typography.Text>
                <Progress percent={41} strokeColor="#ea580c" />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="dashboard-card content-card" title="Hoạt động gần đây">
            <List
              dataSource={recent}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={<Tag color={item.color}>{item.tag}</Tag>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
