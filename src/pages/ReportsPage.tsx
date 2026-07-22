import {
  BarChartOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileSearchOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Space, Typography } from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'

const reports = [
  {
    title: 'Inbound trong kỳ',
    description: 'Phiếu nhập, SKU nhận, putaway lead time.',
    icon: <DownloadOutlined />,
  },
  {
    title: 'Outbound trong kỳ',
    description: 'Đơn xuất, SLA picking/packing, handover.',
    icon: <BarChartOutlined />,
  },
  {
    title: 'Tồn kho theo warehouse',
    description: 'On-hand, reserved, near-expiry theo location.',
    icon: <PieChartOutlined />,
  },
  {
    title: 'Hiệu suất picker',
    description: 'Lines/hour, accuracy, wave completion.',
    icon: <LineChartOutlined />,
  },
  {
    title: 'COD & carrier',
    description: 'Tỷ lệ giao thành công, COD theo ĐVVC.',
    icon: <FileSearchOutlined />,
  },
  {
    title: 'Audit & exception',
    description: 'Cảnh báo CRITICAL / WARNING theo dịch vụ.',
    icon: <FileSearchOutlined />,
  },
]

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Báo cáo"
        description="Bộ báo cáo vận hành fulfillment theo khoảng thời gian và scope."
      />
      <Row gutter={[16, 16]}>
        {reports.map((report) => (
          <Col xs={24} md={12} xl={8} key={report.title}>
            <Card className="report-card content-card" hoverable>
              <Space align="start" size={14}>
                <span className="report-icon">{report.icon}</span>
                <div>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {report.title}
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ margin: '6px 0 14px' }}>
                    {report.description}
                  </Typography.Paragraph>
                  <IconAction title="Xem báo cáo" type="primary" ghost icon={<EyeOutlined />} />
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
