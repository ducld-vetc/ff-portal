import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EnvironmentOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Input, Space, Table, Tag, type TableColumnsType } from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { warehouses, type Warehouse } from '../data/mock'
import { locationSetupProgress } from '../data/warehouseLocations'

export default function WarehousesPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return warehouses
    return warehouses.filter((row) =>
      [row.code, row.name, row.address, row.customer].join(' ').toLowerCase().includes(q),
    )
  }, [query])

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
    { title: 'Khách hàng', dataIndex: 'customer', width: 200, ellipsis: true },
    {
      title: 'Cấu hình vị trí',
      width: 200,
      render: (_, row) => {
        const progress = locationSetupProgress(row.id)
        return progress.ready ? (
          <Tag color="green">
            {progress.rooms}P · {progress.aisles}L · {progress.racks}K · {progress.bins}Bin
          </Tag>
        ) : (
          <Tag color="orange">Chưa đủ / trống</Tag>
        )
      },
    },
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
    {
      title: '',
      width: 72,
      align: 'center',
      render: (_, row) => (
        <IconAction
          title="Thiết lập vị trí"
          type="primary"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => navigate(`/warehouses/${row.id}/locations`)}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Kho"
        description="Quản lý kho và thiết lập cấu trúc vị trí chứa hàng: Phòng → Tầng → Lối đi → Dãy kệ → Bin."
        extra={
          <Space>
            <IconAction
              title="Thiết bị chứa hàng"
              icon={<InboxOutlined />}
              onClick={() => navigate('/warehouses/storage-devices')}
            />
            <IconAction title="Tạo kho" type="primary" icon={<PlusOutlined />} />
          </Space>
        }
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Input
            className="search-input"
            prefix={<SearchOutlined />}
            placeholder="Tìm mã kho, tên, địa chỉ"
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Table rowKey="id" columns={columns} dataSource={filtered} pagination={false} />
      </div>
    </div>
  )
}
