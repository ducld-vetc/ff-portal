import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons'
import { Button, Space, Table, Tag, Typography, message } from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import { goodsConditionLabel } from '../data/outboundRequests'
import {
  getWaybill,
  waybillLineAmount,
  waybillStatusColor,
  waybillStatusLabel,
  waybillTotal,
} from '../data/waybills'

export default function ClientWaybillDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const waybill = getWaybill(id)

  if (!waybill) {
    return (
      <div>
        <PageHeader title="Không tìm thấy vận đơn" />
        <Button onClick={() => navigate('/client/operations/waybills')}>Quay lại danh sách</Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Vận đơn ${waybill.code}`}
        description={`${waybill.recipientName} · ${waybill.shippingPackage || 'Chưa chọn gói VC'}`}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/client/operations/waybills')}
            >
              Danh sách
            </Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() =>
                message.success(`Đã lấy nhãn vận chuyển cho ${waybill.code} (demo)`)
              }
            >
              In nhãn VC
            </Button>
          </Space>
        }
      />

      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="info-grid">
          <div>
            <div className="section-label">Mã vận đơn</div>
            <Typography.Text strong className="inbound-ir-link">
              {waybill.code}
            </Typography.Text>
          </div>
          <div>
            <div className="section-label">Mã vận đơn đối tác</div>
            <div>{waybill.partnerWaybillCode || '—'}</div>
          </div>
          <div>
            <div className="section-label">Trạng thái</div>
            <Tag color={waybillStatusColor[waybill.status]}>
              {waybillStatusLabel[waybill.status]}
            </Tag>
          </div>
          <div>
            <div className="section-label">Ngày tạo</div>
            <div>{dayjs(waybill.createdAt).format('DD/MM/YYYY HH:mm')}</div>
          </div>
          <div>
            <div className="section-label">Lấy hàng</div>
            <div>
              {waybill.contactName} · {waybill.contactPhone}
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {waybill.pickupAddressCode}
              </div>
            </div>
          </div>
          <div>
            <div className="section-label">Nhận hàng</div>
            <div>
              {waybill.recipientName} · {waybill.recipientPhone}
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {waybill.recipientAddress}
              </div>
            </div>
          </div>
          <div>
            <div className="section-label">Gói VC / Trọng lượng</div>
            <div>
              {waybill.shippingPackage || '—'} · {waybill.weightKg} kg
            </div>
          </div>
          <div>
            <div className="section-label">COD / Khai giá</div>
            <div>
              {waybill.cod == null ? '—' : waybill.cod.toLocaleString('vi-VN')} /{' '}
              {waybill.declaredValue.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <h3 className="inbound-section-title">Sản phẩm</h3>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={waybill.lines}
          columns={[
            { title: '#', width: 48, render: (_, __, i) => i + 1 },
            { title: 'Sản phẩm', dataIndex: 'name' },
            { title: 'SKU', dataIndex: 'sku', width: 140 },
            {
              title: 'TTHH',
              dataIndex: 'goodsCondition',
              width: 100,
              render: (v: keyof typeof goodsConditionLabel) => (
                <Tag>{goodsConditionLabel[v]}</Tag>
              ),
            },
            { title: 'SL', dataIndex: 'qty', width: 80, align: 'right' },
            {
              title: 'Đơn giá',
              dataIndex: 'unitPrice',
              width: 110,
              align: 'right',
              render: (v: number) => v.toLocaleString('vi-VN'),
            },
            {
              title: 'Thành tiền',
              width: 120,
              align: 'right',
              render: (_, row) => waybillLineAmount(row).toLocaleString('vi-VN'),
            },
          ]}
        />
        <div className="outbound-totals" style={{ marginTop: 12 }}>
          <div className="outbound-totals-row">
            <span>Tổng cộng</span>
            <strong>{waybillTotal(waybill.lines).toLocaleString('vi-VN')}</strong>
          </div>
        </div>
        <p style={{ marginTop: 12 }}>
          <Link to="/client/operations/waybills">← Về danh sách vận đơn</Link>
        </p>
      </div>
    </div>
  )
}
