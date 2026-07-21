import { EnvironmentOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Table, Tag, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { warehouses, type Warehouse } from '../data/mock'

const columns: TableColumnsType<Warehouse> = [
  {
    title: 'Kho',
    render: (_, row) => (
      <div className="entity-copy">
        <strong>{row.name}</strong>
        <span>{row.code}</span>
      </div>
    ),
  },
  {
    title: 'Địa chỉ',
    dataIndex: 'address',
    render: (value: string) => (
      <span>
        <EnvironmentOutlined style={{ marginRight: 6, color: 'var(--color-text-muted)' }} />
        {value}
      </span>
    ),
  },
  { title: 'Khách hàng', dataIndex: 'customer', width: 180 },
  { title: 'Zones', dataIndex: 'zones', width: 90 },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 130,
    render: (status: Warehouse['status']) =>
      status === 'active' ? (
        <Tag color="green">Đang hoạt động</Tag>
      ) : (
        <Tag>Không hoạt động</Tag>
      ),
  },
]

export default function WarehousesPage() {
  return (
    <div>
      <PageHeader
        title="Kho"
        description="Quản lý kho, layout zone/location và phạm vi vận hành theo customer."
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Tạo kho
          </Button>
        }
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Input
            className="search-input"
            prefix={<SearchOutlined />}
            placeholder="Tìm mã kho, tên, địa chỉ"
            allowClear
          />
        </div>
        <Table rowKey="id" columns={columns} dataSource={warehouses} pagination={false} />
        <div className="canvas-placeholder" style={{ marginTop: 16 }}>
          Sơ đồ layout kho (placeholder) — zone / aisle / bin
        </div>
      </div>
    </div>
  )
}
