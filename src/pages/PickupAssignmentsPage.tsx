import { PlusOutlined, SearchOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { Button, Input, Table, Tag, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { pickupAssignments, type PickupAssignment } from '../data/mock'

const statusMap = {
  pending: { color: 'default', label: 'Chờ gán' },
  in_progress: { color: 'processing', label: 'Đang lấy' },
  done: { color: 'success', label: 'Hoàn tất' },
} as const

const columns: TableColumnsType<PickupAssignment> = [
  {
    title: 'Wave',
    dataIndex: 'wave',
    render: (value: string) => <strong style={{ fontFamily: 'var(--font-mono)' }}>{value}</strong>,
  },
  { title: 'Kho', dataIndex: 'warehouse', width: 130 },
  { title: 'Picker', dataIndex: 'picker', width: 200 },
  { title: 'Đơn', dataIndex: 'orders', width: 90 },
  { title: 'SKU dòng', dataIndex: 'items', width: 100 },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 130,
    render: (status: PickupAssignment['status']) => (
      <Tag color={statusMap[status].color}>{statusMap[status].label}</Tag>
    ),
  },
  {
    title: 'Gán lúc',
    dataIndex: 'assignedAt',
    width: 180,
    render: (value: string) => new Date(value).toLocaleString('vi-VN'),
  },
]

export default function PickupAssignmentsPage() {
  return (
    <div>
      <PageHeader
        title="Phân công lấy hàng"
        description="Gán wave / picker theo kho, theo dõi tiến độ picking realtime."
        extra={
          <Button type="primary" icon={<UserSwitchOutlined />}>
            Phân công mới
          </Button>
        }
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Input
            className="search-input"
            prefix={<SearchOutlined />}
            placeholder="Tìm wave, picker, kho"
            allowClear
          />
          <Button icon={<PlusOutlined />}>Tạo wave</Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={pickupAssignments} pagination={false} />
      </div>
    </div>
  )
}
