import { ImportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Space, Table, Tag, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { products, type Product } from '../data/mock'

const columns: TableColumnsType<Product> = [
  {
    title: 'Product / SKU',
    render: (_, row) => (
      <div className="entity-copy">
        <strong>{row.name}</strong>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{row.sku}</span>
      </div>
    ),
  },
  {
    title: 'Barcode',
    dataIndex: 'barcode',
    width: 160,
    render: (value: string) => (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{value}</span>
    ),
  },
  { title: 'Khách hàng', dataIndex: 'customer', width: 180 },
  {
    title: 'Khối lượng (kg)',
    dataIndex: 'weightKg',
    width: 140,
    render: (value: number) => value.toFixed(2),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 120,
    render: (status: Product['status']) =>
      status === 'active' ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
  },
]

export default function CatalogPage() {
  return (
    <div>
      <PageHeader
        title="Product & SKU"
        description="Master data sản phẩm, barcode và thuộc tính đóng gói theo customer."
        extra={
          <Space>
            <Button icon={<ImportOutlined />}>Import</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm SKU
            </Button>
          </Space>
        }
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Input
            className="search-input"
            prefix={<SearchOutlined />}
            placeholder="Tìm mã SKU, barcode, tên"
            allowClear
          />
        </div>
        <Table rowKey="id" columns={columns} dataSource={products} pagination={false} />
      </div>
    </div>
  )
}
