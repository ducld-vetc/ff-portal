import { useMemo, useState } from 'react'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import {
  goodsConditionLabel,
  goodsEventKindLabel,
  seedGoodsDamageConversion,
  type GoodsDamageConversionRow,
  type GoodsEventKind,
} from '../data/goodsDamageConversion'
import { usePortal } from '../portal/PortalContext'

const { RangePicker } = DatePicker

const kindColor: Record<GoodsEventKind, string> = {
  damaged: 'orange',
  converted: 'blue',
}

export default function ClientGoodsDamagePage() {
  const { customerScope } = usePortal()
  const [query, setQuery] = useState('')
  const [warehouse, setWarehouse] = useState<string | undefined>()
  const [kind, setKind] = useState<GoodsEventKind | undefined>()
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs('2026-07-01'),
    dayjs('2026-07-31'),
  ])

  const scoped = useMemo(
    () => seedGoodsDamageConversion.filter((r) => r.customerId === customerScope.customerId),
    [customerScope.customerId],
  )

  const warehouseOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const row of scoped) map.set(row.warehouseCode, `${row.warehouseCode} · ${row.warehouseName}`)
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [scoped])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((row) => {
      if (warehouse && row.warehouseCode !== warehouse) return false
      if (kind && row.kind !== kind) return false
      if (range) {
        const d = dayjs(row.date)
        if (d.isBefore(range[0], 'day') || d.isAfter(range[1], 'day')) return false
      }
      if (
        q &&
        !row.sku.toLowerCase().includes(q) &&
        !(row.partnerSku || '').toLowerCase().includes(q) &&
        !row.productName.toLowerCase().includes(q) &&
        !(row.relatedDoc || '').toLowerCase().includes(q) &&
        !row.reason.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [scoped, query, warehouse, kind, range])

  const totals = useMemo(() => {
    let damagedQty = 0
    let convertedQty = 0
    for (const row of filtered) {
      if (row.kind === 'damaged') damagedQty += row.qty
      else convertedQty += row.qty
    }
    return {
      lines: filtered.length,
      damagedQty,
      convertedQty,
      totalQty: damagedQty + convertedQty,
    }
  }, [filtered])

  const columns: TableColumnsType<GoodsDamageConversionRow> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      width: 110,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Loại',
      dataIndex: 'kind',
      width: 120,
      render: (v: GoodsEventKind) => <Tag color={kindColor[v]}>{goodsEventKindLabel[v]}</Tag>,
    },
    {
      title: 'Kho',
      width: 150,
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.warehouseCode}</strong>
          <span>{row.warehouseName}</span>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      width: 240,
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.productName}</strong>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {row.sku}
            {row.partnerSku ? ` · ${row.partnerSku}` : ''}
          </span>
        </div>
      ),
    },
    {
      title: 'Tình trạng',
      width: 170,
      render: (_, row) => (
        <span>
          {goodsConditionLabel[row.fromCondition]} → {goodsConditionLabel[row.toCondition]}
        </span>
      ),
    },
    {
      title: 'SL',
      dataIndex: 'qty',
      width: 90,
      align: 'right',
      render: (v: number, row) => (
        <span>
          <strong>{v.toLocaleString('vi-VN')}</strong>{' '}
          <span style={{ color: 'var(--color-text-muted)' }}>{row.unit}</span>
        </span>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Chứng từ / vị trí',
      width: 160,
      render: (_, row) => (
        <div className="entity-copy">
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.relatedDoc || '—'}</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.locationCode || '—'}</span>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tổng hợp hàng hư hỏng / chuyển đổi"
        description="Theo dõi lượng hàng bị ghi nhận hư hỏng hoặc chuyển đổi tình trạng (mới ↔ đã dùng ↔ hư hỏng) theo kho và kỳ."
        extra={
          <IconAction
            title="Xuất Excel"
            icon={<DownloadOutlined />}
            onClick={() =>
              message.success(`Đã xuất ${filtered.length} dòng hàng hư hỏng/chuyển đổi (demo)`)
            }
          />
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="Số dòng" value={totals.lines} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="SL hư hỏng" value={totals.damagedQty} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="SL chuyển đổi" value={totals.convertedQty} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="Tổng SL" value={totals.totalQty} />
          </Card>
        </Col>
      </Row>

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap>
            <RangePicker
              value={range}
              onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
              format="DD/MM/YYYY"
              allowClear
            />
            <Select
              allowClear
              placeholder="Kho"
              style={{ minWidth: 220 }}
              value={warehouse}
              onChange={setWarehouse}
              options={warehouseOptions}
            />
            <Select
              allowClear
              placeholder="Loại sự kiện"
              style={{ minWidth: 160 }}
              value={kind}
              onChange={setKind}
              options={Object.entries(goodsEventKindLabel).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Input
              allowClear
              placeholder="Tìm SKU, tên SP, lý do, chứng từ"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Space>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1280 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </div>
  )
}
