import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NodeIndexOutlined, PlusOutlined, SearchOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { Input, Space, Table, Tag, Typography, type TableColumnsType } from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { pickupAssignments, type PickupAssignment } from '../data/mock'

const statusMap = {
  pending: { color: 'default', label: 'Chờ gán' },
  in_progress: { color: 'processing', label: 'Đang lấy' },
  done: { color: 'success', label: 'Hoàn tất' },
} as const

export default function PickupAssignmentsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pickupAssignments
    return pickupAssignments.filter((row) =>
      [row.wave, row.picker, row.warehouse].join(' ').toLowerCase().includes(q),
    )
  }, [query])

  const columns: TableColumnsType<PickupAssignment> = [
    {
      title: 'Wave',
      dataIndex: 'wave',
      render: (value: string, row) => (
        <Typography.Link
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
          onClick={() => navigate(`/pickup-assignments/${row.id}`)}
        >
          {value}
        </Typography.Link>
      ),
    },
    { title: 'Kho', dataIndex: 'warehouse', width: 130 },
    { title: 'Picker', dataIndex: 'picker', width: 200 },
    { title: 'Đơn', dataIndex: 'orders', width: 80, align: 'right' },
    { title: 'SKU dòng', dataIndex: 'items', width: 100, align: 'right' },
    {
      title: 'Điểm dừng',
      width: 110,
      align: 'right',
      render: (_, row) => new Set(row.lines.map((l) => l.binCode)).size,
    },
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
      width: 170,
      render: (value: string) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: '',
      width: 64,
      align: 'center',
      render: (_, row) => (
        <IconAction
          title="Xem lộ trình lấy hàng"
          icon={<NodeIndexOutlined />}
          onClick={() => navigate(`/pickup-assignments/${row.id}`)}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Phân công lấy hàng"
        description="Gán wave / picker theo kho. Mỗi yêu cầu lấy hàng có lộ trình picker riêng (tính từ bin đã allocate)."
        extra={
          <Space>
            <IconAction title="Phân công mới" type="primary" icon={<UserSwitchOutlined />} />
          </Space>
        }
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Input
            className="search-input"
            prefix={<SearchOutlined />}
            placeholder="Tìm wave, picker, kho"
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <IconAction title="Tạo wave" icon={<PlusOutlined />} />
        </div>
        <Table rowKey="id" columns={columns} dataSource={filtered} pagination={false} />
      </div>
    </div>
  )
}
