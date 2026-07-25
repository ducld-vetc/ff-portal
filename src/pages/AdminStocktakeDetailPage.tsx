import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PrinterOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  Checkbox,
  Input,
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
  getStocktakeSession,
  lineVariance,
  stocktakeRequestTypeLabel,
  stocktakeStatusLabel,
  upsertStocktakeSession,
  type StocktakeLine,
  type StocktakeSession,
} from '../data/stocktakeSessions'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ops-field">
      <span className="ops-field-label">{label}</span>
      <span className="ops-field-value">{children}</span>
    </div>
  )
}

function fmtDt(v?: string | null) {
  return v ? dayjs(v).format('DD/MM/YYYY HH:mm:ss') : 'N/A'
}

export default function AdminStocktakeDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [row, setRow] = useState<StocktakeSession | undefined>(() => getStocktakeSession(id))
  const [onlyDiff, setOnlyDiff] = useState(false)
  const [query, setQuery] = useState('')

  const lines = useMemo(() => {
    if (!row) return []
    const q = query.trim().toLowerCase()
    return row.lines.filter((line) => {
      if (onlyDiff && lineVariance(line) === 0) return false
      if (!q) return true
      return [line.locationCode, line.sku, line.productName].join(' ').toLowerCase().includes(q)
    })
  }, [row, onlyDiff, query])

  if (!row) {
    return (
      <div>
        <PageHeader title="Không tìm thấy phiên kiểm kê" />
        <Button onClick={() => navigate('/operations/stocktake')}>Thoát</Button>
      </div>
    )
  }

  const refresh = (next: StocktakeSession) => {
    upsertStocktakeSession(next)
    setRow(next)
  }

  const complete = () => {
    refresh({
      ...row,
      status: 'completed',
      endedAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      confirmedBy: 'ops - Ops Warehouse',
      countedLocations: row.locationCount,
      countedProducts: row.skuCount,
    })
    message.success(`Đã hoàn thành phiên ${row.code}`)
  }

  const columns: TableColumnsType<StocktakeLine> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    { title: 'Mã vị trí', dataIndex: 'locationCode', width: 140 },
    {
      title: 'Mã SKU (Barcode)',
      dataIndex: 'sku',
      width: 150,
      render: (v: string) => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span>,
    },
    { title: 'Tên sản phẩm', dataIndex: 'productName', width: 240, ellipsis: true },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    { title: 'Tình trạng hàng hóa', dataIndex: 'goodsCondition', width: 150 },
    { title: 'Số lượng hệ thống', dataIndex: 'systemQty', width: 140, align: 'right' },
    {
      title: 'KQ lần 1',
      dataIndex: 'count1',
      width: 90,
      align: 'right',
      render: (v?: number | null) => v ?? '',
    },
    {
      title: 'KQ lần 2',
      dataIndex: 'count2',
      width: 90,
      align: 'right',
      render: (v?: number | null) => v ?? '',
    },
    {
      title: 'KQ lần 3',
      dataIndex: 'count3',
      width: 90,
      align: 'right',
      render: (v?: number | null) => v ?? '',
    },
    {
      title: 'Chênh lệch',
      width: 110,
      align: 'right',
      render: (_, line) => {
        const diff = lineVariance(line)
        return (
          <span style={{ color: diff !== 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
            {diff}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Chi tiết phiên kiểm kê"
        extra={
          <Space wrap>
            {row.status === 'counting' ? (
              <Button className="btn-success" onClick={complete}>
                Hoàn thành
              </Button>
            ) : null}
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => message.info('Demo: in biên bản kiểm kê')}
            >
              In biên bản
            </Button>
            <Button onClick={() => navigate('/operations/stocktake')}>Thoát</Button>
          </Space>
        }
      />

      <div className="content-card">
        <Tabs
          defaultActiveKey="info"
          items={[
            {
              key: 'info',
              label: 'Thông tin kiểm kê',
              children: (
                <>
                  <div className="ops-detail-head" style={{ marginBottom: 12 }}>
                    <Typography.Title level={4} className="ops-detail-code" style={{ margin: 0 }}>
                      {row.code}
                    </Typography.Title>
                    <Tag color={row.status === 'counting' ? 'success' : row.status === 'completed' ? 'blue' : 'default'}>
                      {stocktakeStatusLabel[row.status]}
                    </Tag>
                  </div>

                  <div className="ops-stocktake-info-grid">
                    <Field label="Loại">{stocktakeRequestTypeLabel[row.requestType]}</Field>
                    <Field label="Đối tác">{row.partnerName || '—'}</Field>
                    <Field label="Thời gian bắt đầu">{fmtDt(row.startedAt)}</Field>
                    <Field label="Thời gian tạo phiên">{fmtDt(row.createdAt)}</Field>
                    <Field label="Người tạo phiên">{row.createdBy}</Field>
                    <Field label="Thời gian kết thúc">{fmtDt(row.endedAt)}</Field>
                    <Field label="Thời gian xác nhận">{fmtDt(row.confirmedAt)}</Field>
                    <Field label="Người xác nhận">{row.confirmedBy || 'N/A'}</Field>
                    <Field label="Vị trí">
                      {row.countedLocations} / {row.locationCount}
                    </Field>
                    <Field label="Sản phẩm">
                      {row.countedProducts} / {row.skuCount}
                    </Field>
                    <Field label="Chênh lệch">
                      <span style={{ color: row.variancePct === 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                        0 ({row.variancePct} %)
                      </span>
                    </Field>
                  </div>

                  <div className="ops-device-detail-toolbar" style={{ marginTop: 16 }}>
                    <Checkbox checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)}>
                      Chỉ hiển thị kết quả bị chênh lệch
                    </Checkbox>
                    <Input
                      allowClear
                      prefix={<SearchOutlined />}
                      placeholder="Vị trí, mã, tên sản phẩm"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      style={{ width: 280 }}
                    />
                  </div>

                  <Table
                    rowKey="id"
                    size="middle"
                    columns={columns}
                    dataSource={lines}
                    scroll={{ x: 1400 }}
                    pagination={{ pageSize: 10 }}
                  />
                </>
              ),
            },
            {
              key: 'docs',
              label: 'Chứng từ',
              children: (
                <Typography.Paragraph type="secondary">
                  Chưa có chứng từ đính kèm cho phiên này.
                </Typography.Paragraph>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
