import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CheckOutlined,
  EditOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { PageHeader } from '../components/PageHeader'
import {
  buildOutboundSummaries,
  getCarrierHandover,
  handoverSessionTypeLabel,
  handoverStatusColor,
  handoverStatusLabel,
  upsertCarrierHandover,
  type CarrierHandoverSession,
  type HandoverPackage,
} from '../data/carrierHandovers'

dayjs.locale('vi')

export default function AdminCarrierHandoverDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [row, setRow] = useState<CarrierHandoverSession | undefined>(() => getCarrierHandover(id))
  const [listQuery, setListQuery] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)

  const filteredPackages = useMemo(() => {
    if (!row) return []
    const q = listQuery.trim().toLowerCase()
    if (!q) return row.packages
    return row.packages.filter((p) =>
      [p.packageCode, p.outboundCode, p.partnerOrCode, p.trackingCode].join(' ').toLowerCase().includes(q),
    )
  }, [row, listQuery])

  const summaries = useMemo(
    () => (row ? buildOutboundSummaries(row.packages) : []),
    [row],
  )

  if (!row) {
    return (
      <div>
        <PageHeader title="Không tìm thấy phiên bàn giao" />
        <Button onClick={() => navigate('/operations/carrier-handover')}>Thoát</Button>
      </div>
    )
  }

  const isReceipt = row.sessionType === 'receipt'
  const canHandover = row.status === 'new' || row.status === 'processing'
  const title = `Tạo phiên bàn giao - ${handoverSessionTypeLabel[row.sessionType]}`

  const refresh = (next: CarrierHandoverSession) => {
    upsertCarrierHandover(next)
    setRow(next)
  }

  const confirmHandover = () => {
    Modal.confirm({
      title: 'Xác nhận bàn giao',
      content: `Bàn giao phiên ${row.code} với ${row.packageCount} kiện cho ${row.carrierName}?`,
      okText: 'Bàn giao',
      cancelText: 'Thoát',
      onOk: () => {
        refresh({ ...row, status: 'handed_over' })
        message.success(`Đã bàn giao phiên ${row.code}`)
      },
    })
  }

  const packageColumns: TableColumnsType<HandoverPackage> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    ...(isReceipt
      ? [{ title: 'Đối tác', dataIndex: 'partnerName', width: 200, ellipsis: true } as const]
      : []),
    {
      title: 'Mã yêu cầu xuất kho',
      dataIndex: 'outboundCode',
      width: 180,
      render: (v: string) => <span className="inbound-ir-link">{v}</span>,
    },
    { title: 'Mã yêu cầu xuất kho đối tác', dataIndex: 'partnerOrCode', width: 180 },
    { title: 'Mã vận đơn', dataIndex: 'trackingCode', width: 140 },
    { title: 'Mã kiện hàng', dataIndex: 'packageCode', width: 180 },
    { title: 'SL sản phẩm', dataIndex: 'productQty', width: 110, align: 'right' },
    ...(isReceipt
      ? [
          { title: 'Loại trả hàng', dataIndex: 'returnType', width: 130 } as const,
          { title: 'Tình trạng', dataIndex: 'condition', width: 120 } as const,
        ]
      : []),
  ]

  const summaryColumns: TableColumnsType<(typeof summaries)[number]> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    {
      title: 'Mã yêu cầu xuất kho',
      dataIndex: 'outboundCode',
      width: 200,
      render: (v: string) => <span className="inbound-ir-link">{v}</span>,
    },
    {
      title: 'Tình trạng xử lý',
      dataIndex: 'processingStatus',
      width: 140,
      render: (v: string) => <Tag color="success">{v}</Tag>,
    },
    { title: 'SL kiện hàng còn lại', dataIndex: 'remainingPackages', width: 160, align: 'right' },
    {
      title: 'SL kiện hàng đã tạo phiên',
      dataIndex: 'sessionPackages',
      width: 180,
      align: 'right',
    },
    { title: 'SL kiện hàng', dataIndex: 'totalPackages', width: 130, align: 'right' },
  ]

  return (
    <div className="ops-adjust-create">
      <PageHeader
        title={title}
        extra={
          <Space wrap>
            <Button onClick={() => navigate('/operations/carrier-handover')}>Thoát</Button>
            {canHandover ? (
              <Button className="btn-success" icon={<CheckOutlined />} onClick={confirmHandover}>
                Bàn giao
              </Button>
            ) : null}
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => message.info('Demo: cập nhật phiên bàn giao')}
            >
              Cập nhật
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => message.info('Demo: in biên bản bàn giao')}
            >
              In
            </Button>
            <Button
              className="btn-success"
              icon={<FileExcelOutlined />}
              onClick={() => message.info('Demo: xuất Excel')}
            >
              Xuất Excel
            </Button>
          </Space>
        }
      />

      <div className="ops-adjust-layout">
        <div className="content-card ops-handover-main">
          <Tabs
            defaultActiveKey="session"
            items={[
              {
                key: 'session',
                label: 'Phiên bàn giao',
                children: (
                  <>
                    <div className="ops-adjust-main-toolbar">
                      <Space.Compact>
                        <Input
                          allowClear
                          placeholder="Tìm kiếm mã kiện hàng, yêu cầu xuất kho, vận đơn"
                          value={listQuery}
                          onChange={(e) => setListQuery(e.target.value)}
                          style={{ width: 360 }}
                        />
                        <Button type="primary" icon={<SearchOutlined />} />
                      </Space.Compact>
                      <Typography.Text strong>Số kiện hàng: {row.packageCount}</Typography.Text>
                    </div>

                    <Table
                      rowKey="id"
                      size="middle"
                      columns={packageColumns}
                      dataSource={filteredPackages}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: isReceipt ? 1300 : 1100 }}
                      style={{ marginBottom: 20 }}
                    />

                    <div className="ops-adjust-main-toolbar">
                      <Typography.Text strong>SL yêu cầu xuất kho: {summaries.length}</Typography.Text>
                    </div>
                    <Table
                      rowKey="outboundCode"
                      size="middle"
                      columns={summaryColumns}
                      dataSource={summaries}
                      pagination={{ pageSize: 8 }}
                    />
                  </>
                ),
              },
            ]}
          />
        </div>

        <div className="ops-detail-stack">
          <div className="content-card ops-detail-sidebar">
            <div className="ops-detail-head">
              <Typography.Title level={4} className="ops-detail-code">
                {row.code}
              </Typography.Title>
              <Tag color={handoverStatusColor[row.status]}>{handoverStatusLabel[row.status]}</Tag>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Tag>{handoverSessionTypeLabel[row.sessionType]}</Tag>
            </div>
          </div>

          <div className="content-card ops-detail-sidebar">
            <div className="ops-adjust-history-head">
              <span className="ops-sidebar-caption" style={{ marginBottom: 0 }}>
                Lịch sử trạng thái
              </span>
              <Button type="link" size="small" onClick={() => setHistoryOpen(true)}>
                Chi tiết
              </Button>
            </div>
            <Typography.Text type="secondary">
              Cập nhật mới nhất:{' '}
              {dayjs(row.createdAt).format('ddd - DD/MM/YYYY').replace(/^\w/, (c) => c.toUpperCase())}
            </Typography.Text>
          </div>

          <div className="content-card ops-detail-sidebar">
            <div className="ops-sidebar-caption">Thông tin chung</div>
            <div className="ops-field">
              <span className="ops-field-label">Số lượng kiện hàng bàn giao</span>
              <span className="ops-field-value">
                <Link to="#" className="inbound-ir-link" onClick={(e) => e.preventDefault()}>
                  {row.packageCount}
                </Link>
              </span>
            </div>
            <div className="ops-field">
              <span className="ops-field-label">Đối tác vận chuyển</span>
              <span className="ops-field-value">
                {row.carrierCode} - {row.carrierName}
              </span>
            </div>
            <div className="ops-field">
              <span className="ops-field-label">Người tạo</span>
              <span className="ops-field-value">{row.createdBy}</span>
            </div>
            <div className="ops-field">
              <span className="ops-field-label">Ghi chú</span>
              <span className="ops-field-value">{row.note || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Lịch sử trạng thái"
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        footer={<Button onClick={() => setHistoryOpen(false)}>Đóng</Button>}
      >
        <div className="ops-adjust-history-list">
          <div className="ops-adjust-history-item">
            <div className="ops-adjust-history-label">Tạo phiên</div>
            <div className="ops-adjust-history-meta">
              {dayjs(row.createdAt).format('DD/MM/YYYY HH:mm:ss')} · {row.createdBy}
            </div>
          </div>
          {row.status === 'handed_over' ? (
            <div className="ops-adjust-history-item">
              <div className="ops-adjust-history-label">Đã bàn giao</div>
              <div className="ops-adjust-history-meta">
                {dayjs().format('DD/MM/YYYY HH:mm:ss')} · Ops
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
