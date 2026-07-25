import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CopyOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Col,
  Collapse,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

import { PageHeader } from '../components/PageHeader'
import {
  deliveryMethodLabel,
  formatAddress,
  getOutboundRequest,
  outboundPriorityColor,
  outboundPriorityLabel,
  outboundStatusColor,
  outboundStatusLabel,
  upsertOutboundRequest,
  type OutboundLine,
  type OutboundRequest,
} from '../data/outboundRequests'

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="product-thumb-img" />
  return <div className="product-thumb">{label.slice(0, 2).toUpperCase()}</div>
}

function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: string }) {
  return (
    <div className="ops-field">
      <span className="ops-field-label">
        {label}
        {hint ? (
          <Tooltip title={hint}>
            <QuestionCircleOutlined style={{ marginLeft: 4, color: '#94a3b8' }} />
          </Tooltip>
        ) : null}
      </span>
      <span className="ops-field-value">{children}</span>
    </div>
  )
}

function Copyable({ value }: { value?: string | null }) {
  if (!value) return <span>—</span>
  return (
    <span className="ops-copyable">
      <span>{value}</span>
      <Button
        type="link"
        size="small"
        icon={<CopyOutlined />}
        onClick={() => {
          void navigator.clipboard.writeText(value)
          message.success('Đã sao chép')
        }}
      />
    </span>
  )
}

function fmtDt(v?: string | null) {
  return v ? dayjs(v).format('DD/MM/YYYY HH:mm:ss') : 'N/A'
}

export default function AdminOutboundDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(() => getOutboundRequest(id))
  const [query, setQuery] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignee, setAssignee] = useState<string>()

  const lines = useMemo(() => {
    if (!request) return []
    const q = query.trim().toLowerCase()
    if (!q) return request.lines
    return request.lines.filter((line) =>
      [line.name, line.sku, line.partnerSku].join(' ').toLowerCase().includes(q),
    )
  }, [request, query])

  if (!request) {
    return (
      <div>
        <PageHeader title="Không tìm thấy yêu cầu xuất kho" />
        <Button onClick={() => navigate('/operations/outbound')}>Thoát</Button>
      </div>
    )
  }

  const quickPick = () => setAssignOpen(true)

  const processOrder = () => {
    if (!assignee) {
      message.warning('Chọn nhân viên phân công')
      return
    }
    const next: OutboundRequest = {
      ...request,
      status: 'picking',
      processingStatus: 'Đang lấy hàng',
      lines: request.lines.map((l) => ({ ...l, assignedQty: l.qty })),
    }
    upsertOutboundRequest(next)
    setRequest(next)
    setAssignOpen(false)
    message.success(`Đã tạo danh sách lấy hàng và phân công ${assignee}`)
    navigate('/operations/picking')
  }

  const productColumns: TableColumnsType<OutboundLine> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    {
      title: 'Sản phẩm',
      render: (_, row) => (
        <Space align="start" size={12}>
          <ProductThumb src={row.imageUrl} label={row.sku} />
          <div>
            <div>{row.name}</div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {row.sku} · {row.partnerSku || '—'} ·{' '}
              {row.goodsCondition === 'new' ? 'Mới' : row.goodsCondition}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    { title: 'SL', dataIndex: 'qty', width: 70, align: 'right' },
    { title: 'SL chỉ định', dataIndex: 'assignedQty', width: 100, align: 'right' },
    {
      title: 'SL đóng gói',
      width: 100,
      align: 'right',
      render: () =>
        request.status === 'packed' || request.status === 'shipped'
          ? request.lines.reduce((s, l) => s + l.qty, 0)
          : 0,
    },
    { title: 'Ghi chú', dataIndex: 'note', width: 140, render: (v) => v || '—' },
  ]

  return (
    <div>
      <PageHeader
        title="Chi tiết yêu cầu xuất kho"
        extra={
          <Space wrap>
            <Button className="btn-success" onClick={() => message.info('Demo: in hóa đơn')}>
              In hóa đơn
            </Button>
            <Button className="btn-success" onClick={() => message.info('Demo: in phiếu xuất kho')}>
              Phiếu xuất kho
            </Button>
            <Button
              className="btn-success"
              onClick={quickPick}
              disabled={request.status === 'cancelled' || request.status === 'shipped'}
            >
              Lấy hàng nhanh
            </Button>
            <Button onClick={() => navigate('/operations/outbound')}>Thoát</Button>
          </Space>
        }
      />

      <Row gutter={16} align="top">
        <Col xs={24} xl={15}>
          <div className="content-card" style={{ marginBottom: 16 }}>
            <Input
              allowClear
              placeholder="Mã, tên sản phẩm"
              prefix={<SearchOutlined />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 280, marginBottom: 12 }}
            />
            <Table
              rowKey="id"
              size="small"
              columns={productColumns}
              dataSource={lines}
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <strong>{request.lines.reduce((s, l) => s + l.qty, 0)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong>{request.lines.reduce((s, l) => s + l.assignedQty, 0)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <strong>0</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} />
                </Table.Summary.Row>
              )}
            />
          </div>

          <div className="content-card" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div className="ops-note-block">
                  <div className="ops-field">
                    <span className="ops-field-label">Ghi chú</span>
                    <span className="ops-field-value ops-field-value-left">
                      {request.note?.trim() || '—'}
                    </span>
                  </div>
                  <div className="ops-field">
                    <span className="ops-field-label">Ghi chú đóng gói</span>
                    <span className="ops-field-value ops-field-value-left">
                      {request.packingNote?.trim() || '—'}
                    </span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="ops-sidebar-block" style={{ borderBottom: 0, marginBottom: 0, paddingBottom: 0 }}>
                  <Field label="Thu hộ (COD) (VND)">{request.cod.toLocaleString('vi-VN')}</Field>
                  <Field label="Khai giá (VND)">{request.declaredValue.toLocaleString('vi-VN')}</Field>
                </div>
              </Col>
            </Row>
          </div>

          <div className="content-card">
            <Tabs
              items={[
                {
                  key: 'delivery',
                  label: 'Thông tin giao hàng',
                  children: (
                    <div className="ops-sidebar-block" style={{ borderBottom: 0, marginBottom: 0 }}>
                      <Field label="Người nhận">{request.buyerName}</Field>
                      <Field label="Email">{request.buyerEmail || '—'}</Field>
                      <Field label="Số điện thoại">{request.buyerPhone}</Field>
                      <Field label="Địa chỉ">{formatAddress(request)}</Field>
                    </div>
                  ),
                },
                {
                  key: 'picking',
                  label: 'Lấy hàng',
                  children: (
                    <Typography.Paragraph type="secondary">
                      Trạng thái lấy hàng: {outboundStatusLabel[request.status]}. Dùng &quot;Lấy hàng
                      nhanh&quot; để tạo danh sách và phân công.
                    </Typography.Paragraph>
                  ),
                },
                {
                  key: 'packing',
                  label: 'Đóng gói',
                  children: (
                    <Typography.Paragraph type="secondary">
                      {request.packedAt
                        ? `Đã đóng gói lúc ${fmtDt(request.packedAt)}`
                        : 'Chưa có phiên đóng gói.'}
                    </Typography.Paragraph>
                  ),
                },
                {
                  key: 'handover',
                  label: 'Bàn giao vận chuyển',
                  children: (
                    <Typography.Paragraph type="secondary">
                      Đơn vị VC: {request.carrierCode || request.shippingPackage} ·{' '}
                      {deliveryMethodLabel[request.deliveryMethod]}
                    </Typography.Paragraph>
                  ),
                },
                {
                  key: 'history',
                  label: 'Lịch sử cập nhật',
                  children: (
                    <Typography.Text type="secondary">
                      Cập nhật gần nhất: {fmtDt(request.createdAt)}
                    </Typography.Text>
                  ),
                },
              ]}
            />
          </div>
        </Col>

        <Col xs={24} xl={9}>
          <div className="ops-detail-stack">
            <div className="content-card ops-detail-sidebar">
              <div className="ops-detail-head">
                <div className="ops-detail-code-wrap">
                  <Typography.Title level={4} className="ops-detail-code">
                    {request.code}
                  </Typography.Title>
                  <Button
                    type="link"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      void navigator.clipboard.writeText(request.code)
                      message.success('Đã sao chép mã OR')
                    }}
                  />
                </div>
                <Tag color={outboundStatusColor[request.status]}>
                  {outboundStatusLabel[request.status]}
                </Tag>
              </div>

              <Typography.Paragraph type="secondary" italic style={{ fontSize: 12, marginBottom: 12 }}>
                Dữ liệu lịch sử chỉ hiển thị thông tin trong vòng 90 ngày, kể từ ngày hiện tại.
              </Typography.Paragraph>

              <div className="ops-sidebar-block">
                <div className="ops-services-head">
                  <span className="ops-sidebar-caption" style={{ marginBottom: 0, color: '#1d4ed8' }}>
                    Lịch sử trạng thái
                  </span>
                  <Button type="link" size="small">
                    Chi tiết
                  </Button>
                </div>
                <Collapse
                  ghost
                  size="small"
                  expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                  items={[
                    {
                      key: 'latest',
                      label: `Cập nhật mới nhất ${dayjs(request.createdAt).format('dddd - DD/MM/YYYY')}`,
                      children: (
                        <Typography.Text type="secondary">
                          {outboundStatusLabel[request.status]} · {fmtDt(request.createdAt)}
                        </Typography.Text>
                      ),
                    },
                  ]}
                />
              </div>

              <div className="ops-sidebar-block">
                <div className="ops-sidebar-caption" style={{ color: '#1d4ed8' }}>
                  Thông tin chung
                </div>
                <Field label="Thông tin giao hàng">
                  <Typography.Link>{request.isB2b ? 'B2B' : 'B2C'}</Typography.Link>
                </Field>
                <Field label="Kho xuất">{request.warehouseName}</Field>
                <Field label="Độ ưu tiên">
                  <Tag color={outboundPriorityColor[request.priority]}>
                    {outboundPriorityLabel[request.priority]}
                  </Tag>
                </Field>
                <Field label="Mã OR nội bộ">
                  <Copyable value={request.internalCode || request.referenceCode} />
                </Field>
                <Field label="Mã tham chiếu">
                  <Copyable value={request.referenceCode || request.internalCode} />
                </Field>
                <Field label="Loại xuất kho">
                  {request.orderType || (request.isB2b ? 'B2B' : 'Order')}
                </Field>
                <Field label="Yêu cầu chứng từ">
                  {request.requireDocuments ? 'Có' : 'Không'}
                </Field>
                <Field label="Kênh bán hàng">{request.channel || 'N/A'}</Field>
                <Field label="Đóng gói">{request.noPacking ? 'Không' : 'Có'}</Field>
                <Field label="Phí xử lý đơn hàng">—</Field>
              </div>
            </div>

            <div className="content-card ops-detail-sidebar">
              <div className="ops-services-head">
                <span className="ops-sidebar-caption" style={{ marginBottom: 0, color: '#1d4ed8' }}>
                  Thông tin vận chuyển
                </span>
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => message.info('Demo: sửa thông tin vận chuyển')}
                />
              </div>
              <Field label="Hình thức nhận hàng">
                {deliveryMethodLabel[request.deliveryMethod]}
              </Field>
              <Field label="Gói vận chuyển">{request.shippingPackage || 'N/A'}</Field>
              <Field label="Đơn vị vận chuyển - Kho">
                <strong>{request.carrierCode || 'N/A'}</strong>
              </Field>
              <Field label="Đơn vị vận chuyển - KBH">
                <strong>{request.carrierChannel || 'N/A'}</strong>
              </Field>
              <Field label="Mã vận đơn">
                <Space size={4}>
                  {request.trackingCode || null}
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => message.info('Demo: sửa mã vận đơn')}
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => message.info('Demo: xem vận đơn')}
                  />
                </Space>
              </Field>
              <Field label="Mã vận đơn thu hồi">—</Field>
              <Field label="Mã vận đơn XBO">—</Field>
              <Field label="Nhãn vận chuyển">—</Field>
              <Field label="Phí dịch vụ vận chuyển">—</Field>
              <Field label="Số lần giao">—</Field>
              <Field label="Tài xế">{request.driver || 'N/A'}</Field>
              <Field label="Số xe">{request.vehicleNo || 'N/A'}</Field>
              <Field label="Số container">{request.containerNo || 'N/A'}</Field>
              <Field label="Kích thước (D x R x C) (cm)">
                {request.dimensions || 'N/A'}
              </Field>
              <Field label="Trọng lượng đơn hàng (Kg)">
                {request.weightKg ?? 'N/A'}
              </Field>
            </div>

            <div className="content-card ops-detail-sidebar">
              <Field label="Ngày phát sinh">{fmtDt(request.occurredAt || request.createdAt)}</Field>
              <Field label="Ngày tạo">{fmtDt(request.createdAt)}</Field>
              <Field label="SLA DVVC">
                <Tag color={request.slaCarrierLate ? 'error' : 'success'}>
                  {request.slaCarrierLate ? 'Trễ' : 'Chưa trễ'}
                </Tag>
              </Field>
              <Field label="SLA xử lý KBH" hint="Thời hạn xử lý đơn với kênh bán hàng">
                <span style={{ color: request.slaCarrierLate ? '#dc2626' : '#16a34a' }}>
                  {fmtDt(request.slaChannelAt)}
                </span>
              </Field>
              <Field label="VRA">N/A</Field>
              <Field label="Dự kiến giao hàng">{fmtDt(request.expectedDeliveryAt)}</Field>
              <Field label="Thời gian giao hàng mong muốn">
                {fmtDt(request.desiredDeliveryAt)}
              </Field>
            </div>

            <div className="content-card ops-detail-sidebar">
              <div className="ops-sidebar-caption" style={{ color: '#1d4ed8' }}>
                Phí dịch vụ
              </div>
              <Field label="Phí xử lý">—</Field>
              <Field label="Phí vận chuyển">—</Field>
            </div>

            <div className="content-card ops-detail-sidebar">
              <div className="ops-services-head">
                <span className="ops-sidebar-caption" style={{ marginBottom: 0, color: '#1d4ed8' }}>
                  Dịch vụ cộng thêm
                </span>
                <Button
                  size="small"
                  className="btn-success"
                  icon={<PlusOutlined />}
                  onClick={() => message.info('Demo: thêm dịch vụ cộng thêm')}
                >
                  Thêm dịch vụ
                </Button>
              </div>
              <div className="ops-services-count" style={{ textAlign: 'right' }}>
                0 dịch vụ
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal
        title="Tạo danh sách lấy hàng và phân công nhân viên đi lấy"
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setAssignOpen(false)}>Thoát</Button>
            <Button type="primary" onClick={processOrder}>
              Xử lý đơn
            </Button>
          </Space>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Phân công" required>
            <Select
              placeholder="Chọn nhân viên"
              value={assignee}
              onChange={setAssignee}
              options={[
                { value: 'Hien - Nguyễn Thị Hiền', label: 'Hien - Nguyễn Thị Hiền' },
                { value: 'Binh - Nguyễn Bình', label: 'Binh - Nguyễn Bình' },
                { value: 'Lan - Trần Thị Lan', label: 'Lan - Trần Thị Lan' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
