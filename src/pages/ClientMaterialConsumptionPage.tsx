import { useMemo, useState } from 'react'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Card, Col, DatePicker, Input, Row, Select, Space, Statistic, Table, Tag, message, type TableColumnsType } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import {
  materialTypeLabel,
  relatedTypeLabel,
  seedMaterialConsumption,
  type MaterialConsumptionRow,
} from '../data/materialConsumption'
import { usePortal } from '../portal/PortalContext'

const { RangePicker } = DatePicker

export default function ClientMaterialConsumptionPage() {
  const { customerScope } = usePortal()
  const [query, setQuery] = useState('')
  const [warehouse, setWarehouse] = useState<string | undefined>()
  const [materialType, setMaterialType] = useState<string | undefined>()
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs('2026-07-01'),
    dayjs('2026-07-31'),
  ])

  const scoped = useMemo(
    () => seedMaterialConsumption.filter((r) => r.customerId === customerScope.customerId),
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
      if (materialType && row.materialType !== materialType) return false
      if (range) {
        const d = dayjs(row.date)
        if (d.isBefore(range[0], 'day') || d.isAfter(range[1], 'day')) return false
      }
      if (
        q &&
        !row.materialCode.toLowerCase().includes(q) &&
        !row.materialName.toLowerCase().includes(q) &&
        !row.relatedDoc.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [scoped, query, warehouse, materialType, range])

  const totals = useMemo(() => {
    const byType = new Map<string, number>()
    let qty = 0
    for (const row of filtered) {
      qty += row.qtyUsed
      byType.set(row.materialType, (byType.get(row.materialType) || 0) + row.qtyUsed)
    }
    return { qty, lines: filtered.length, types: byType.size }
  }, [filtered])

  const columns: TableColumnsType<MaterialConsumptionRow> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      width: 110,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Kho',
      width: 160,
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.warehouseCode}</strong>
          <span>{row.warehouseName}</span>
        </div>
      ),
    },
    {
      title: 'Vật tư',
      width: 220,
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.materialName}</strong>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.materialCode}</span>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'materialType',
      width: 120,
      render: (v: string) => materialTypeLabel[v] || v,
    },
    {
      title: 'SL tiêu hao',
      dataIndex: 'qtyUsed',
      width: 110,
      align: 'right',
      render: (v: number, row) => (
        <span>
          <strong>{v.toLocaleString('vi-VN')}</strong>{' '}
          <span style={{ color: 'var(--color-text-muted)' }}>{row.unit}</span>
        </span>
      ),
    },
    {
      title: 'Chứng từ',
      width: 140,
      render: (_, row) => (
        <div className="entity-copy">
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.relatedDoc}</span>
          <Tag>{relatedTypeLabel[row.relatedType]}</Tag>
        </div>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      ellipsis: true,
      render: (v?: string) => v || '—',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tổng hợp vật tư tiêu hao"
        description="Theo dõi lượng vật tư đóng gói đã dùng theo kho, loại vật tư và chứng từ liên quan trong kỳ."
        extra={
          <IconAction
            title="Xuất Excel"
            icon={<DownloadOutlined />}
            onClick={() => message.success(`Đã xuất ${filtered.length} dòng vật tư tiêu hao (demo)`)}
          />
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Dòng tiêu hao" value={totals.lines} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Tổng SL tiêu hao" value={totals.qty} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Số loại vật tư" value={totals.types} />
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
              placeholder="Loại vật tư"
              style={{ minWidth: 160 }}
              value={materialType}
              onChange={setMaterialType}
              options={Object.entries(materialTypeLabel).map(([value, label]) => ({ value, label }))}
            />
            <Input
              allowClear
              placeholder="Tìm mã / tên vật tư, chứng từ"
              prefix={<SearchOutlined />}
              style={{ width: 280 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Space>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </div>
  )
}
