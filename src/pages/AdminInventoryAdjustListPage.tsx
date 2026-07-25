import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FilterOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  inventoryAdjustStatusColor,
  inventoryAdjustStatusLabel,
  inventoryPartnerOptions,
  listInventoryAdjustments,
  type InventoryAdjustStatus,
  type InventoryAdjustment,
} from '../data/inventoryAdjustments'

const { RangePicker } = DatePicker

function fmtDt(v?: string | null) {
  if (!v) return '—'
  return dayjs(v).format('DD/MM/YYYY HH:mm')
}

export default function AdminInventoryAdjustListPage() {
  const navigate = useNavigate()
  const rows = listInventoryAdjustments()
  const [query, setQuery] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [createdRange, setCreatedRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [status, setStatus] = useState<InventoryAdjustStatus | undefined>()
  const [direction, setDirection] = useState<InventoryAdjustment['direction'] | undefined>()
  const [partnerName, setPartnerName] = useState<string | undefined>()
  const [createdBy, setCreatedBy] = useState<string | undefined>()
  const [unconfirmedOnly, setUnconfirmedOnly] = useState(false)

  const creatorOptions = useMemo(() => {
    const names = Array.from(new Set(rows.map((r) => r.createdBy).filter(Boolean)))
    return names.map((name) => ({ value: name, label: name }))
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const inCode = row.code.toLowerCase().includes(q)
        const inSku = row.lines.some(
          (l) => l.sku.toLowerCase().includes(q) || l.partnerSku.toLowerCase().includes(q),
        )
        if (!inCode && !inSku) return false
      }
      if (createdRange) {
        const created = dayjs(row.createdAt)
        if (
          created.isBefore(createdRange[0].startOf('day')) ||
          created.isAfter(createdRange[1].endOf('day'))
        ) {
          return false
        }
      }
      if (status && row.status !== status) return false
      if (direction && row.direction !== direction) return false
      if (partnerName && row.partnerName !== partnerName) return false
      if (createdBy && row.createdBy !== createdBy) return false
      if (unconfirmedOnly && row.confirmedAt) return false
      return true
    })
  }, [rows, query, createdRange, status, direction, partnerName, createdBy, unconfirmedOnly])

  const columns: TableColumnsType<InventoryAdjustment> = [
    { title: '#', width: 56, render: (_, __, index) => index + 1 },
    {
      title: 'Mã điều chỉnh',
      dataIndex: 'code',
      width: 170,
      render: (code: string, row) => (
        <span>
          <Link to={`/operations/inventory-adjust/${row.id}`} className="inbound-ir-link">
            {code}
          </Link>
          <Tag
            style={{ marginLeft: 8 }}
            color={row.direction === 'increase' ? 'success' : 'orange'}
          >
            {row.direction === 'increase' ? 'Tăng' : 'Giảm'}
          </Tag>
        </span>
      ),
    },
    { title: 'Đối tác', dataIndex: 'partnerName', width: 260, ellipsis: true },
    { title: 'SL SKU', dataIndex: 'skuCount', width: 90, align: 'right' },
    { title: 'SL Items', dataIndex: 'itemCount', width: 100, align: 'right' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (v: InventoryAdjustStatus) => (
        <Tag color={inventoryAdjustStatusColor[v]}>{inventoryAdjustStatusLabel[v]}</Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 150,
      render: (v: string) => fmtDt(v),
    },
    { title: 'Người tạo', dataIndex: 'createdBy', width: 110 },
    {
      title: 'Xác nhận lúc',
      dataIndex: 'confirmedAt',
      width: 150,
      render: (v?: string | null) => fmtDt(v),
    },
    {
      title: 'Xác nhận bởi',
      dataIndex: 'confirmedBy',
      width: 120,
      render: (v?: string | null) => v || '—',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Điều chỉnh tồn"
        extra={
          <Space>
            <Button
              className="btn-success"
              icon={<ArrowUpOutlined />}
              onClick={() => navigate('/operations/inventory-adjust/increase')}
            >
              Điều chỉnh tăng
            </Button>
            <Button
              className="btn-warning"
              icon={<ArrowDownOutlined />}
              onClick={() => navigate('/operations/inventory-adjust/decrease')}
            >
              Điều chỉnh giảm
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <Space wrap>
            <Space.Compact>
              <Input
                allowClear
                placeholder="Mã điều chỉnh, mã sản phẩm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={() => message.success(`Tìm thấy ${filtered.length} kết quả`)}
                style={{ width: 280 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => message.success(`Tìm thấy ${filtered.length} kết quả`)}
              />
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setAdvancedOpen((v) => !v)}
                title={advancedOpen ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao'}
              />
            </Space.Compact>
          </Space>

          {advancedOpen ? (
            <Space wrap>
              <RangePicker
                value={createdRange}
                onChange={(v) => setCreatedRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
              <Select
                allowClear
                placeholder="Chọn loại điều chỉnh"
                style={{ width: 180 }}
                value={direction}
                onChange={setDirection}
                options={[
                  { value: 'increase', label: 'Tăng tồn' },
                  { value: 'decrease', label: 'Giảm tồn' },
                ]}
              />
              <Select
                allowClear
                placeholder="Chọn trạng thái"
                style={{ width: 170 }}
                value={status}
                onChange={setStatus}
                options={Object.entries(inventoryAdjustStatusLabel).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                allowClear
                showSearch
                placeholder="Chọn đối tác"
                style={{ width: 220 }}
                value={partnerName}
                onChange={setPartnerName}
                options={inventoryPartnerOptions}
                optionFilterProp="label"
              />
              <Select
                allowClear
                placeholder="Chọn người tạo"
                style={{ width: 160 }}
                value={createdBy}
                onChange={setCreatedBy}
                options={creatorOptions}
              />
              <Checkbox
                checked={unconfirmedOnly}
                onChange={(e) => setUnconfirmedOnly(e.target.checked)}
              >
                Chưa xác nhận
              </Checkbox>
            </Space>
          ) : null}
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} phiếu` }}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </div>
    </div>
  )
}
