import { useMemo, useState } from 'react'
import { FilterOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  listOpsIssues,
  opsIssueStatusLabel,
  opsIssueStatusOptions,
  opsIssueTypeLabel,
  opsIssueTypeOptions,
  type OpsIssue,
  type OpsIssueStatus,
  type OpsIssueType,
} from '../data/opsIssues'

const { RangePicker } = DatePicker

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="product-thumb-img" />
  return <div className="product-thumb">{label.slice(0, 2).toUpperCase()}</div>
}

export default function AdminIssuesPage() {
  const rows = listOpsIssues()
  const [query, setQuery] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [createdRange, setCreatedRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ])
  const [status, setStatus] = useState<OpsIssueStatus | undefined>('new')
  const [type, setType] = useState<OpsIssueType | undefined>()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const hay = [row.sku, row.partnerSku, row.productName, row.locationCode]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
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
      if (type && row.type !== type) return false
      return true
    })
  }, [rows, query, createdRange, status, type])

  const columns: TableColumnsType<OpsIssue> = [
    { title: '#', width: 50, fixed: 'left', render: (_, __, i) => i + 1 },
    { title: 'vị trí', dataIndex: 'locationCode', width: 140, fixed: 'left' },
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
      width: 140,
      render: (v: string) => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span>,
    },
    { title: 'Mã SKU đối tác', dataIndex: 'partnerSku', width: 140 },
    {
      title: 'Hình ảnh',
      width: 90,
      align: 'center',
      render: (_, row) => <ProductThumb src={row.imageUrl} label={row.sku} />,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      width: 260,
      render: (v: string) => <div className="product-name-cell">{v}</div>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 150,
      render: (v: OpsIssueType) => opsIssueTypeLabel[v],
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (v: OpsIssueStatus) => opsIssueStatusLabel[v],
    },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    { title: 'SL', dataIndex: 'qty', width: 70, align: 'right' },
    { title: 'SL tìm thấy', dataIndex: 'foundQty', width: 110, align: 'right' },
    { title: 'Tình trạng hàng hóa', dataIndex: 'goodsCondition', width: 150 },
    {
      title: 'Số lô',
      dataIndex: 'lotCode',
      width: 130,
      render: (v?: string) => v || '',
    },
    {
      title: 'Serial/Nhãn lưu trữ',
      dataIndex: 'serialOrLabel',
      width: 160,
      render: (v?: string) => v || '',
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      width: 120,
      render: (v?: string | null) => (v ? dayjs(v).format('DD/MM/YYYY') : ''),
    },
    { title: 'Người tạo', dataIndex: 'createdBy', width: 200, ellipsis: true },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
  ]

  return (
    <div>
      <PageHeader title="Vấn đề phát sinh" />

      <div className="content-card">
        <div className="table-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <Space wrap>
            <Space.Compact>
              <Input
                allowClear
                placeholder="Mã/tên sản phẩm, vị trí"
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
                title={advancedOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              />
            </Space.Compact>
          </Space>

          {advancedOpen ? (
            <Space wrap>
              <RangePicker
                value={createdRange}
                onChange={(v) => setCreatedRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="DD/MM/YYYY"
              />
              <Select
                allowClear
                placeholder="Trạng thái"
                style={{ width: 160 }}
                value={status}
                onChange={setStatus}
                options={opsIssueStatusOptions}
              />
              <Select
                allowClear
                placeholder="Loại"
                style={{ width: 180 }}
                value={type}
                onChange={setType}
                options={opsIssueTypeOptions}
              />
            </Space>
          ) : null}
        </div>

        <Table
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 2200 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} vấn đề` }}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </div>
    </div>
  )
}
