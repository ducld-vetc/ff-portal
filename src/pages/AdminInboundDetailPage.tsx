import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DownloadOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Checkbox,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  getInboundRequest,
  goodsConditionColor,
  goodsConditionLabel,
  inboundStatusColor,
  inboundStatusLabel,
  inboundTypeLabel,
  upsertInboundRequest,
  type InboundLine,
  type InboundRequest,
} from '../data/inboundRequests'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ops-field">
      <span className="ops-field-label">{label}</span>
      <span className="ops-field-value">{children}</span>
    </div>
  )
}

export default function AdminInboundDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(() => getInboundRequest(id))
  const [query, setQuery] = useState('')
  const [hideFulfilled, setHideFulfilled] = useState(false)

  const lines = useMemo(() => {
    if (!request) return []
    const q = query.trim().toLowerCase()
    return request.lines.filter((line) => {
      if (hideFulfilled && (request.receivedQty || 0) >= line.qty) return false
      if (!q) return true
      return [line.name, line.sku, line.partnerSku].join(' ').toLowerCase().includes(q)
    })
  }, [request, query, hideFulfilled])

  if (!request) {
    return (
      <div>
        <PageHeader title="Không tìm thấy yêu cầu nhập kho" />
        <Button onClick={() => navigate('/operations/inbound')}>Thoát</Button>
      </div>
    )
  }

  const locked = request.status === 'received' || request.status === 'cancelled'

  const checkIn = () => {
    const next: InboundRequest = {
      ...request,
      status: 'processing',
      lastCheckInAt: new Date().toISOString(),
      receivedQty: Math.min(request.productQty, (request.receivedQty || 0) + 1),
    }
    upsertInboundRequest(next)
    setRequest(next)
    message.success('Đã check-in phiếu nhập kho')
  }

  const complete = () => {
    const next: InboundRequest = {
      ...request,
      status: 'received',
      receivedQty: request.productQty,
      storedQty: request.productQty,
      receivedAt: dayjs().format('YYYY-MM-DD'),
      lastCheckInAt: new Date().toISOString(),
    }
    upsertInboundRequest(next)
    setRequest(next)
    message.success('Đã hoàn thành yêu cầu nhập kho')
  }

  const productColumns: TableColumnsType<InboundLine> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    {
      title: 'Tên SP',
      render: (_, row) => (
        <div>
          <Typography.Link>{row.name}</Typography.Link>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              SKU: {row.sku} · ĐT: {row.partnerSku}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    { title: 'SL', dataIndex: 'qty', width: 70, align: 'right' },
    {
      title: 'Thực nhận',
      width: 90,
      align: 'right',
      render: (_, row) =>
        request.status === 'received' ? row.qty : Math.min(row.qty, request.receivedQty),
    },
    { title: 'SL tham chiếu', width: 110, align: 'right', render: () => 0 },
    {
      title: 'SL lưu kho',
      width: 100,
      align: 'right',
      render: () => request.storedQty ?? 0,
    },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    {
      title: 'Giá',
      dataIndex: 'unitPrice',
      width: 100,
      align: 'right',
      render: (v: number) => v.toLocaleString('vi-VN'),
    },
    { title: 'Ghi chú', width: 120, render: () => '—' },
  ]

  return (
    <div>
      <PageHeader
        title="Xem yêu cầu nhập kho"
        extra={
          <Space wrap>
            <Button onClick={() => navigate('/operations/inbound')}>Thoát</Button>
            <Button type="primary" onClick={() => message.info('Demo: in biên bản nhận hàng')}>
              In biên bản
            </Button>
            <Button className="btn-success" disabled={locked} onClick={checkIn}>
              Check in
            </Button>
            <Button className="btn-success" disabled={locked} onClick={complete}>
              Hoàn thành
            </Button>
            <Button
              className="btn-success"
              icon={<DownloadOutlined />}
              onClick={() => message.success('Đã xuất Excel (demo)')}
            >
              Xuất Excel
            </Button>
          </Space>
        }
      />

      <Row gutter={16}>
        <Col xs={24} xl={16}>
          <div className="content-card" style={{ marginBottom: 16 }}>
            <div className="section-toolbar" style={{ marginBottom: 12 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Sản phẩm nhập kho
              </Typography.Title>
              <Space wrap>
                <Input
                  allowClear
                  placeholder="Mã, tên sản phẩm"
                  prefix={<SearchOutlined />}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ width: 220 }}
                />
                <Button type="primary" onClick={() => message.info('Demo')}>
                  Tìm bundle
                </Button>
                <Checkbox checked={hideFulfilled} onChange={(e) => setHideFulfilled(e.target.checked)}>
                  Ẩn sản phẩm nhận đủ
                </Checkbox>
              </Space>
            </div>
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
                    <strong>{request.productQty}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong>{request.receivedQty}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} colSpan={5} />
                </Table.Summary.Row>
              )}
            />
          </div>

          <div className="content-card">
            <Tabs
              items={[
                {
                  key: 'notes',
                  label: 'Ghi chú nhận hàng',
                  children: (
                    <Typography.Paragraph type="secondary">
                      {request.note || 'Chưa có ghi chú nhận hàng.'}
                    </Typography.Paragraph>
                  ),
                },
                {
                  key: 'checkin',
                  label: 'Check in',
                  children: (
                    <div className="ops-sidebar-block">
                      <Field label="Lần cuối">
                        {request.lastCheckInAt
                          ? dayjs(request.lastCheckInAt).format('DD/MM/YYYY HH:mm:ss')
                          : '—'}
                      </Field>
                      <Field label="Người phụ trách">{request.ownerName}</Field>
                    </div>
                  ),
                },
                {
                  key: 'grn',
                  label: 'Phiên nhận hàng',
                  children: (
                    <div>
                      <Typography.Text strong>
                        CKS{request.code} - Phiếu nhận hàng (GRN) |{' '}
                        {request.lastCheckInAt
                          ? dayjs(request.lastCheckInAt).format('DD/MM/YYYY HH:mm:ss')
                          : '—'}
                      </Typography.Text>
                      <Table
                        style={{ marginTop: 12 }}
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={request.lines}
                        columns={[
                          { title: '#', width: 50, render: (_, __, i) => i + 1 },
                          { title: 'SKU', dataIndex: 'sku', width: 140 },
                          { title: 'Mã SKU đối tác', dataIndex: 'partnerSku', width: 140 },
                          { title: 'Tên sản phẩm', dataIndex: 'name' },
                          { title: 'ĐVT', dataIndex: 'unit', width: 80 },
                          {
                            title: 'TTHH',
                            width: 100,
                            render: () => (
                              <Tag color={goodsConditionColor[request.goodsCondition]}>
                                {goodsConditionLabel[request.goodsCondition]}
                              </Tag>
                            ),
                          },
                          { title: 'SL', dataIndex: 'qty', width: 70, align: 'right' },
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  key: 'putaway',
                  label: 'Phiên lưu kho',
                  children: (
                    <Typography.Paragraph type="secondary">
                      SL lưu kho: {request.storedQty ?? 0} / {request.productQty}
                    </Typography.Paragraph>
                  ),
                },
              ]}
            />
          </div>
        </Col>

        <Col xs={24} xl={8}>
          <div className="content-card ops-detail-sidebar">
            <div className="ops-detail-head">
              <Typography.Title level={4} className="ops-detail-code">
                {request.code}
              </Typography.Title>
              <Tag color={inboundStatusColor[request.status]}>
                {inboundStatusLabel[request.status]}
              </Tag>
            </div>

            <div className="ops-sidebar-block">
              <div className="ops-sidebar-caption">Phụ trách đơn hàng</div>
              <div className="ops-owner-row">
                <UserOutlined />
                <span className="inbound-owner-name">{request.ownerName}</span>
              </div>
              <div className="ops-owner-row ops-owner-phone">
                <PhoneOutlined />
                <span>{request.ownerPhone}</span>
              </div>
            </div>

            <div className="ops-sidebar-block">
              <div className="ops-sidebar-caption">Thông tin nhập kho</div>
              <Field label="Kho">{request.warehouseName}</Field>
              <Field label="Ngày dự kiến gửi hàng">
                {dayjs(request.expectedAt).format('DD/MM/YYYY')}
              </Field>
            </div>

            <div className="ops-sidebar-block">
              <Field label="Loại">{inboundTypeLabel[request.type]}</Field>
              <Field label="Tình trạng hàng hóa">
                <Tag color={goodsConditionColor[request.goodsCondition]}>
                  {goodsConditionLabel[request.goodsCondition]}
                </Tag>
              </Field>
              <Field label="Người tạo">{request.ownerName}</Field>
              <Field label="Ghi chú">{request.note || 'N/A'}</Field>
            </div>

            <div className="ops-sidebar-block">
              <Field label="Tài xế">{request.driver || 'N/A'}</Field>
              <Field label="Số xe">{request.vehicleNo || 'N/A'}</Field>
              <Field label="Số container">{request.containerNo || 'N/A'}</Field>
              <Field label="Mã IR đối tác">{request.partnerIrCode || 'N/A'}</Field>
              <Field label="Mã tham chiếu">{request.referenceCode || 'N/A'}</Field>
              <Field label="Mã OR trả hàng">N/A</Field>
              <Field label="Nhà cung cấp">{request.supplier || 'N/A'}</Field>
            </div>

            <div className="ops-sidebar-block ops-services">
              <div className="ops-services-head">
                <span className="ops-sidebar-caption" style={{ marginBottom: 0 }}>
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
              <div className="ops-services-count">0 dịch vụ</div>
            </div>

            <div className="ops-sidebar-block ops-sidebar-timestamps">
              <Field label="Ngày tạo">
                {dayjs(request.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Field>
              <Field label="Ngày hàng đến kho">
                {request.receivedAt ? dayjs(request.receivedAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
              </Field>
              <Field label="Ngày hoàn tất">
                {request.status === 'received' && request.receivedAt
                  ? dayjs(request.receivedAt).format('DD/MM/YYYY HH:mm:ss')
                  : '—'}
              </Field>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
