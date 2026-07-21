import { useMemo, useState } from 'react'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Select, Space, Table, Tag, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'

export type OpsDoc = {
  id: string
  code: string
  type: string
  warehouse: string
  status: string
  skuCount: number
  qty: number
  createdAt: string
  note?: string
}

const stocktakeSeed = [
  {
    id: 'st-1',
    code: 'KK-20260718-01',
    warehouse: 'WH-HCM-01',
    status: 'Hoàn tất',
    variance: -3,
    createdAt: '2026-07-18T16:00:00',
  },
]

const errorOutboundSeed = [
  {
    id: 'eo-1',
    code: 'OUT-ERR-220',
    reason: 'Sai địa chỉ giao',
    status: 'Chờ xử lý',
    createdAt: '2026-07-20T08:30:00',
  },
  {
    id: 'eo-2',
    code: 'OUT-ERR-221',
    reason: 'Thiếu tồn serial',
    status: 'Đã hủy',
    createdAt: '2026-07-19T20:10:00',
  },
]

const codSeed = [
  {
    id: 'cod-1',
    orderCode: 'OUT-SHOPEE-99100',
    amount: 350000,
    status: 'Chờ thu',
    carrier: 'GHN',
    createdAt: '2026-07-20T19:00:00',
  },
  {
    id: 'cod-2',
    orderCode: 'OUT-TIKTOK-1002',
    amount: 189000,
    status: 'Đã đối soát',
    carrier: 'JT',
    createdAt: '2026-07-18T10:00:00',
  },
]

function OpsTablePage({
  title,
  description,
  rows,
  columns,
  createLabel = 'Thêm yêu cầu',
}: {
  title: string
  description: string
  rows: Record<string, unknown>[]
  columns: TableColumnsType
  createLabel?: string
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q))
  }, [rows, query])

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        extra={
          <Space>
            <Button>Xuất Excel</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              {createLabel}
            </Button>
          </Space>
        }
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Space.Compact style={{ width: 320 }}>
            <Input
              allowClear
              placeholder="Tìm kiếm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Space.Compact>
        </div>
        <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} />
      </div>
    </div>
  )
}

export function ClientStocktakePage() {
  return (
    <OpsTablePage
      title="Kiểm kê"
      description="Yêu cầu kiểm kê tồn kho theo kho được gán."
      rows={stocktakeSeed}
      createLabel="Tạo kiểm kê"
      columns={[
        { title: 'Mã kiểm kê', dataIndex: 'code', width: 160 },
        { title: 'Kho', dataIndex: 'warehouse', width: 120 },
        {
          title: 'Trạng thái',
          dataIndex: 'status',
          width: 120,
          render: (v: string) => <Tag color="green">{v}</Tag>,
        },
        { title: 'Chênh lệch', dataIndex: 'variance', width: 110, align: 'right' },
        {
          title: 'Ngày tạo',
          dataIndex: 'createdAt',
          render: (v: string) => new Date(v).toLocaleString('vi-VN'),
        },
      ]}
    />
  )
}

export function ClientErrorOutboundPage() {
  return (
    <OpsTablePage
      title="Yêu cầu xuất kho lỗi"
      description="Theo dõi và xử lý các yêu cầu xuất kho lỗi / hủy."
      rows={errorOutboundSeed}
      createLabel="Làm mới"
      columns={[
        { title: 'Mã', dataIndex: 'code', width: 160 },
        { title: 'Nguyên nhân', dataIndex: 'reason' },
        {
          title: 'Trạng thái',
          dataIndex: 'status',
          width: 130,
          render: (v: string) => <Tag color="orange">{v}</Tag>,
        },
        {
          title: 'Ngày tạo',
          dataIndex: 'createdAt',
          render: (v: string) => new Date(v).toLocaleString('vi-VN'),
        },
      ]}
    />
  )
}

export function ClientCodPage() {
  return (
    <OpsTablePage
      title="Đơn hàng COD"
      description="Theo dõi COD theo đơn hàng và xuất báo cáo đối soát."
      rows={codSeed}
      createLabel="Xuất Excel"
      columns={[
        { title: 'Mã đơn', dataIndex: 'orderCode', width: 180 },
        { title: 'ĐVVC', dataIndex: 'carrier', width: 100 },
        {
          title: 'Số tiền',
          dataIndex: 'amount',
          width: 120,
          align: 'right',
          render: (v: number) => v.toLocaleString('vi-VN'),
        },
        {
          title: 'Trạng thái',
          dataIndex: 'status',
          width: 130,
          render: (v: string) => <Tag color={v.includes('Đã') ? 'green' : 'gold'}>{v}</Tag>,
        },
        {
          title: 'Ngày tạo',
          dataIndex: 'createdAt',
          render: (v: string) => new Date(v).toLocaleString('vi-VN'),
        },
      ]}
    />
  )
}

export function ClientCategoriesPage() {
  const rows = [
    { id: '1', code: 'COSMETIC', name: 'Mỹ phẩm', productCount: 42 },
    { id: '2', code: 'FMCG', name: 'Tiêu dùng', productCount: 128 },
    { id: '3', code: 'ELECTRONIC', name: 'Điện tử', productCount: 35 },
  ]
  return (
    <OpsTablePage
      title="Danh mục sản phẩm"
      description="Phân nhóm sản phẩm theo chức năng. Một sản phẩm có thể thuộc nhiều danh mục."
      rows={rows}
      createLabel="Thêm danh mục"
      columns={[
        { title: 'Mã', dataIndex: 'code', width: 140 },
        { title: 'Tên danh mục', dataIndex: 'name' },
        { title: 'Số SP', dataIndex: 'productCount', width: 100, align: 'right' },
      ]}
    />
  )
}

export function ClientUnitsPage() {
  const rows = [
    { id: '1', code: 'CAI', name: 'Cái', base: true },
    { id: '2', code: 'HOP', name: 'Hộp', base: false },
    { id: '3', code: 'THUNG', name: 'Thùng', base: false },
  ]
  return (
    <OpsTablePage
      title="Đơn vị tính"
      description="Quản lý đơn vị tính và quy đổi dùng khi nhập / xuất / tồn kho."
      rows={rows}
      createLabel="Thêm đơn vị"
      columns={[
        { title: 'Mã', dataIndex: 'code', width: 120 },
        { title: 'Tên ĐVT', dataIndex: 'name' },
        {
          title: 'Đơn vị gốc',
          dataIndex: 'base',
          width: 120,
          render: (v: boolean) => (v ? <Tag color="blue">Gốc</Tag> : '—'),
        },
      ]}
    />
  )
}

export function ClientDefaultConditionPage() {
  const [channel, setChannel] = useState('Shopee')
  const rows = [
    { id: '1', channelSku: 'AVO-GP-01', condition: 'Mới' },
    { id: '2', channelSku: 'AVO-GP-02', condition: 'Mới' },
    { id: '3', channelSku: 'INOX-01', condition: 'Hư hỏng' },
  ]
  return (
    <div>
      <PageHeader
        title="KBH — Tình trạng hàng hóa mặc định"
        description="Liên kết sản phẩm trên kênh bán hàng với tình trạng hàng hóa mặc định khi đồng bộ về kho."
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Select
            value={channel}
            onChange={setChannel}
            style={{ width: 200 }}
            options={[
              { value: 'Shopee', label: 'Shopee' },
              { value: 'TikTok', label: 'TikTok' },
              { value: 'Lazada', label: 'Lazada' },
            ]}
          />
        </div>
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={false}
          columns={[
            { title: 'SKU kênh', dataIndex: 'channelSku' },
            {
              title: 'Tình trạng mặc định',
              dataIndex: 'condition',
              render: (v: string) => <Tag>{v}</Tag>,
            },
          ]}
        />
      </div>
    </div>
  )
}
