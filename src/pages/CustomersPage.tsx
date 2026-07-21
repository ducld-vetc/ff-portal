import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Space, Table, Tag, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { getCustomerShipping } from '../data/customerShipping'
import { customers, type Customer } from '../data/mock'

export default function CustomersPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.taxCode.toLowerCase().includes(q) ||
        row.legalName.toLowerCase().includes(q),
    )
  }, [query])

  const columns: TableColumnsType<Customer> = [
    {
      title: 'Khách hàng',
      render: (_, row) => (
        <button type="button" className="entity-link" onClick={() => navigate(`/customers/${row.id}`)}>
          <strong>{row.name}</strong>
          <span>
            {row.code} · {row.legalName}
          </span>
        </button>
      ),
    },
    { title: 'Mã số thuế', dataIndex: 'taxCode', width: 140 },
    {
      title: 'Liên hệ',
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.contact}</strong>
          <span>{row.email}</span>
        </div>
      ),
    },
    { title: 'Số kho', dataIndex: 'warehouses', width: 90 },
    {
      title: 'ĐVVC',
      width: 90,
      render: (_, row) => getCustomerShipping(row.id).carrierCodes.length,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status: Customer['status']) => {
        const map = {
          active: { color: 'green', label: 'Active' },
          draft: { color: 'gold', label: 'Bản nháp' },
          inactive: { color: 'default', label: 'Inactive' },
        } as const
        return <Tag color={map[status].color}>{map[status].label}</Tag>
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 160,
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Tác vụ',
      width: 90,
      render: (_, row) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/customers/${row.id}`)}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Khách hàng"
        description="Danh sách tenant / customer. Bấm vào dòng để mở trang chi tiết đầy đủ."
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm khách hàng
          </Button>
        }
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Input
            className="search-input"
            prefix={<SearchOutlined />}
            placeholder="Tìm mã, tên, mã số thuế"
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Space>
            <Button>Xuất CSV</Button>
          </Space>
        </div>
        <Table rowKey="id" columns={columns} dataSource={filtered} pagination={false} />
      </div>
    </div>
  )
}
