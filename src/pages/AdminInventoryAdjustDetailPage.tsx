import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckOutlined } from '@ant-design/icons'
import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { PageHeader } from '../components/PageHeader'
import {
  getInventoryAdjustment,
  inventoryAdjustStatusColor,
  inventoryAdjustStatusLabel,
  upsertInventoryAdjustment,
  type InventoryAdjustLine,
  type InventoryAdjustment,
} from '../data/inventoryAdjustments'
import {
  goodsConditionColor,
  goodsConditionLabel,
  type GoodsCondition,
} from '../data/inboundRequests'

dayjs.locale('vi')

const DEMO_PIN = '1234'

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="product-thumb-img" />
  return <div className="product-thumb">{label.slice(0, 2).toUpperCase()}</div>
}

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="ops-field">
      <span className="ops-field-label">{label}</span>
      <span className="ops-field-value">{children}</span>
    </div>
  )
}

export default function AdminInventoryAdjustDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [row, setRow] = useState<InventoryAdjustment | undefined>(() => getInventoryAdjustment(id))
  const [finishOpen, setFinishOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)

  const totalQty = useMemo(() => row?.lines.reduce((s, l) => s + l.qty, 0) ?? 0, [row])

  if (!row) {
    return (
      <div>
        <PageHeader title="Không tìm thấy phiếu điều chỉnh tồn" />
        <Button onClick={() => navigate('/operations/inventory-adjust')}>Thoát</Button>
      </div>
    )
  }

  const isDecrease = row.direction === 'decrease'
  const canAct = row.status === 'new'
  const title = isDecrease ? 'Xem điều chỉnh giảm tồn' : 'Xem điều chỉnh tăng tồn'
  const qtyTitle = isDecrease ? 'SL giảm' : 'SL tăng'

  const refresh = (next: InventoryAdjustment) => {
    upsertInventoryAdjustment(next)
    setRow(next)
  }

  const cancelAdjustment = () => {
    Modal.confirm({
      title: 'Hủy điều chỉnh tồn',
      content: `Bạn có chắc muốn hủy phiếu ${row.code}?`,
      okText: 'Hủy phiếu',
      okButtonProps: { danger: true },
      cancelText: 'Đóng',
      onOk: () => {
        refresh({
          ...row,
          status: 'cancelled',
          confirmedAt: null,
          confirmedBy: null,
        })
        message.success(`Đã hủy phiếu ${row.code}`)
      },
    })
  }

  const confirmFinish = () => {
    if (pin.trim() !== DEMO_PIN) {
      message.error('Mã PIN không đúng (demo: 1234)')
      return
    }
    refresh({
      ...row,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      confirmedBy: 'Ops',
    })
    setFinishOpen(false)
    setPin('')
    message.success(`Đã hoàn thành phiếu ${row.code}`)
  }

  const columns: TableColumnsType<InventoryAdjustLine> = [
    {
      title: 'Sản phẩm',
      width: 260,
      render: (_, line) => (
        <Space align="start">
          <ProductThumb src={line.imageUrl} label={line.sku} />
          <div>
            <div className="product-name-cell">{line.name}</div>
            <div className="ops-adjust-product-sku">{line.sku}</div>
          </div>
        </Space>
      ),
    },
    { title: 'SKU đối tác', dataIndex: 'partnerSku', width: 140 },
    {
      title: 'SKU (barcode)',
      dataIndex: 'sku',
      width: 150,
      render: (v: string) => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span>,
    },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    {
      title: 'Tình trạng hàng hóa',
      dataIndex: 'goodsCondition',
      width: 150,
      render: (v?: GoodsCondition) =>
        v ? <Tag color={goodsConditionColor[v]}>{goodsConditionLabel[v]}</Tag> : '—',
    },
    {
      title: 'Số lô',
      dataIndex: 'lotCode',
      width: 120,
      render: (v?: string) => v || '—',
    },
    {
      title: 'Ngày',
      dataIndex: 'lotDate',
      width: 120,
      render: (v?: string | null) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
    {
      title: qtyTitle,
      dataIndex: 'qty',
      width: 100,
      align: 'right',
    },
  ]

  const historyItems = [
    {
      key: 'created',
      label: 'Tạo phiếu',
      at: row.createdAt,
      by: row.createdBy,
    },
    ...(row.status === 'confirmed' && row.confirmedAt
      ? [
          {
            key: 'confirmed',
            label: 'Hoàn thành',
            at: row.confirmedAt,
            by: row.confirmedBy || '—',
          },
        ]
      : []),
    ...(row.status === 'cancelled'
      ? [
          {
            key: 'cancelled',
            label: 'Hủy phiếu',
            at: new Date().toISOString(),
            by: 'Ops',
          },
        ]
      : []),
  ]

  const latestUpdate = historyItems[historyItems.length - 1]

  return (
    <div className="ops-adjust-create">
      <PageHeader
        title={title}
        extra={
          <Space>
            {canAct ? (
              <>
                <Button danger onClick={cancelAdjustment}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => {
                    setPin('')
                    setFinishOpen(true)
                  }}
                >
                  Hoàn thành
                </Button>
              </>
            ) : null}
            <Button onClick={() => navigate('/operations/inventory-adjust')}>Thoát</Button>
          </Space>
        }
      />

      <div className="ops-adjust-layout">
        <div className="content-card ops-adjust-main">
          <div className="ops-adjust-main-toolbar">
            <h3 className="inbound-section-title" style={{ marginBottom: 0 }}>
              Sản phẩm điều chỉnh
            </h3>
            <Typography.Text type="secondary">Tổng cộng: {totalQty}</Typography.Text>
          </div>
          <Table
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={row.lines}
            pagination={false}
            scroll={{ x: 1200 }}
            locale={{ emptyText: 'Chưa có sản phẩm' }}
          />
        </div>

        <div className="ops-detail-stack">
          <div className="content-card ops-detail-sidebar">
            <div className="ops-detail-head">
              <Typography.Title level={4} className="ops-detail-code">
                {row.code}
              </Typography.Title>
              <Tag color={inventoryAdjustStatusColor[row.status]}>
                {inventoryAdjustStatusLabel[row.status]}
              </Tag>
            </div>

            <Field label="Loại điều chỉnh">
              <Tag color={isDecrease ? 'orange' : 'success'}>
                {isDecrease ? 'Giảm tồn' : 'Tăng tồn'}
              </Tag>
            </Field>
            <Field label="Tình trạng hàng hóa">
              {row.lines[0]?.goodsCondition ? (
                <Tag color={goodsConditionColor[row.lines[0].goodsCondition]}>
                  {goodsConditionLabel[row.lines[0].goodsCondition]}
                </Tag>
              ) : (
                '—'
              )}
            </Field>
            <Field label="Đối tác">{row.partnerName}</Field>
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
              Cập nhật gần nhất:{' '}
              {dayjs(latestUpdate.at).format('dddd, DD/MM/YYYY').replace(/^\w/, (c) => c.toUpperCase())}
            </Typography.Text>
          </div>

          <div className="content-card ops-detail-sidebar">
            <div className="ops-sidebar-caption">Ghi chú</div>
            <Typography.Paragraph type={row.note ? undefined : 'secondary'} style={{ marginBottom: 0 }}>
              {row.note || 'Không có dữ liệu'}
            </Typography.Paragraph>
          </div>
        </div>
      </div>

      <Modal
        title="Xác nhận hoàn thành"
        open={finishOpen}
        onCancel={() => setFinishOpen(false)}
        destroyOnHidden
        footer={
          <Space>
            <Button onClick={() => setFinishOpen(false)}>Thoát</Button>
            <Button type="primary" onClick={confirmFinish}>
              Xác nhận
            </Button>
          </Space>
        }
      >
        <Input.Password
          size="large"
          placeholder="Nhập mã pin"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onPressEnter={confirmFinish}
          maxLength={8}
        />
        <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
          Demo mã PIN: {DEMO_PIN}
        </Typography.Paragraph>
      </Modal>

      <Modal
        title="Lịch sử trạng thái"
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        footer={<Button onClick={() => setHistoryOpen(false)}>Đóng</Button>}
      >
        <div className="ops-adjust-history-list">
          {historyItems.map((item) => (
            <div key={item.key} className="ops-adjust-history-item">
              <div className="ops-adjust-history-label">{item.label}</div>
              <div className="ops-adjust-history-meta">
                {dayjs(item.at).format('DD/MM/YYYY HH:mm:ss')} · {item.by}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
