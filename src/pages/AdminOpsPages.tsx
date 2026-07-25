import { useMemo, useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Space, Table, Tag, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'
import {
  outboundUpdateSeed,
  printLabelSeed,
} from '../data/adminOpsSeed'
import AdminPickingListPage from './AdminPickingListPage'
import AdminPackingPage from './AdminPackingPage'

export { default as AdminPackingPage } from './AdminPackingPage'

function OpsTablePage({
  title,
  description,
  rows,
  columns,
  createLabel,
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
            {createLabel ? <Button type="primary">{createLabel}</Button> : null}
          </Space>
        }
      />
      <div className="content-card">
        <div className="table-toolbar">
          <Input
            allowClear
            placeholder="Tìm kiếm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 320 }}
          />
        </div>
        <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} />
      </div>
    </div>
  )
}

export function AdminPickingB2bPage() {
  return <AdminPickingListPage b2bOnly />
}

export function AdminPackingByLabelPage() {
  return <AdminPackingPage mode="label" />
}

export function AdminOutboundUpdatePage() {
  return (
    <OpsTablePage
      title="Cập nhật đơn xuất"
      description="Vận hành → Vận chuyển → Cập nhật đơn xuất: lịch sử đổi trạng thái OR."
      rows={outboundUpdateSeed}
      columns={[
        { title: 'Mã xuất kho', dataIndex: 'outboundCode', width: 170 },
        { title: 'Từ trạng thái', dataIndex: 'fromStatus', width: 140 },
        { title: 'Sang trạng thái', dataIndex: 'toStatus', width: 140 },
        { title: 'Nguồn', dataIndex: 'source', width: 130 },
        { title: 'Người cập nhật', dataIndex: 'updatedBy', width: 120 },
        {
          title: 'Thời điểm',
          dataIndex: 'updatedAt',
          render: (v: string) => new Date(v).toLocaleString('vi-VN'),
        },
      ]}
    />
  )
}

export function AdminPrintLabelsPage() {
  return (
    <OpsTablePage
      title="In nhãn"
      description="Vận hành → Tiện ích → In nhãn: vận đơn, vị trí, barcode thiết bị."
      rows={printLabelSeed}
      createLabel="In nhãn"
      columns={[
        { title: 'Loại nhãn', dataIndex: 'labelType', width: 140 },
        { title: 'Tham chiếu', dataIndex: 'relatedCode', width: 170 },
        { title: 'Số bản', dataIndex: 'copies', width: 90, align: 'right' },
        { title: 'Máy in', dataIndex: 'printer', width: 120 },
        {
          title: 'Trạng thái',
          dataIndex: 'status',
          width: 110,
          render: (v: string) => <Tag color={v === 'Đã in' ? 'success' : 'default'}>{v}</Tag>,
        },
        {
          title: 'Thời điểm in',
          dataIndex: 'printedAt',
          render: (v: string | null) => (v ? new Date(v).toLocaleString('vi-VN') : '—'),
        },
      ]}
    />
  )
}
