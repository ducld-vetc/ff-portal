import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Card, Col, Row, Space, Tag, Typography } from 'antd'
import { PageHeader } from '../components/PageHeader'

const services = [
  { name: 'BFF Gateway', status: 'up', latency: '42ms' },
  { name: 'Auth Service', status: 'up', latency: '28ms' },
  { name: 'Master Data API', status: 'up', latency: '61ms' },
  { name: 'WMS Adapter', status: 'up', latency: '95ms' },
  { name: 'Carrier Hub', status: 'degraded', latency: '320ms' },
  { name: 'Report Worker', status: 'up', latency: '110ms' },
]

export default function SystemPage() {
  return (
    <div>
      <PageHeader
        title="Trạng thái dịch vụ"
        description="Health check các service phía sau Control Center (mock local)."
      />
      <Row gutter={[16, 16]}>
        {services.map((service) => (
          <Col xs={24} md={12} xl={8} key={service.name}>
            <Card className="content-card">
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {service.name}
                  </Typography.Title>
                  <Typography.Text type="secondary">Latency {service.latency}</Typography.Text>
                </div>
                {service.status === 'up' ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Healthy
                  </Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="warning">
                    Degraded
                  </Tag>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
