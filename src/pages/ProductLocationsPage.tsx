import { useMemo, useState } from 'react'
import { PictureOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Select, Space, Table, Tag, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'
import {
  conditionLabels,
  locationStatusLabels,
  seedProductLocations,
  type ProductCondition,
  type ProductLocationRow,
  type ProductLocationStatus,
} from '../data/productLocations'
import { usePortal } from '../portal/PortalContext'

const partnerOptions = Array.from(
  new Map(
    seedProductLocations.map((row) => [
      row.partnerCode,
      { value: row.partnerCode, label: row.partnerName },
    ]),
  ).values(),
)

const statusColor: Record<ProductLocationStatus, string> = {
  pickable: 'blue',
  ready_storage: 'cyan',
  ready_handover: 'green',
}

const conditionColor: Record<ProductCondition, string> = {
  new: 'green',
  damaged: 'orange',
  expired: 'red',
}

export default function ProductLocationsPage() {
  const { isCustomer } = usePortal()
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [partner, setPartner] = useState<string | undefined>()

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return seedProductLocations.filter((row) => {
      if (!isCustomer && partner && row.partnerCode !== partner) return false
      if (
        q &&
        !row.sku.toLowerCase().includes(q) &&
        !row.name.toLowerCase().includes(q) &&
        !row.placeCode.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [appliedQuery, partner, isCustomer])

  const locationRows = filtered.filter((r) => r.kind === 'location')
  const packageRows = filtered.filter((r) => r.kind === 'package')

  const baseColumns: TableColumnsType<ProductLocationRow> = [
    {
      title: '#',
      width: 56,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Hình ảnh',
      width: 90,
      render: () => (
        <div className="product-thumb">
          <PictureOutlined />
        </div>
      ),
    },
    {
      title: 'Tên SP',
      dataIndex: 'name',
      width: 360,
      render: (value: string) => <div className="product-name-cell">{value}</div>,
    },
  ]

  const locationColumns: TableColumnsType<ProductLocationRow> = [
    ...baseColumns,
    {
      title: 'Vị trí',
      dataIndex: 'placeCode',
      width: 140,
      render: (value: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (value: ProductLocationStatus) => (
        <Tag color={statusColor[value]}>{locationStatusLabels[value]}</Tag>
      ),
    },
    { title: 'SL', dataIndex: 'qty', width: 70, align: 'right' },
    { title: 'ĐVT', dataIndex: 'unit', width: 70 },
    { title: 'Chờ xuất', dataIndex: 'pendingOut', width: 90, align: 'right' },
    {
      title: 'Tình trạng hàng hóa',
      dataIndex: 'condition',
      width: 150,
      render: (value: ProductCondition) => (
        <Tag color={conditionColor[value]}>{conditionLabels[value]}</Tag>
      ),
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      width: 120,
      render: (value: string | null) => value || 'N/A',
    },
    ...(!isCustomer
      ? ([{ title: 'Đối tác', dataIndex: 'partnerName', width: 240 }] as TableColumnsType<ProductLocationRow>)
      : []),
  ]

  const packageColumns: TableColumnsType<ProductLocationRow> = [
    ...baseColumns,
    {
      title: 'Kiện hàng',
      dataIndex: 'placeCode',
      width: 200,
      render: (value: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 160,
      render: (value: ProductLocationStatus) => (
        <Tag color={statusColor[value]}>{locationStatusLabels[value]}</Tag>
      ),
    },
    { title: 'SL', dataIndex: 'qty', width: 70, align: 'right' },
    { title: 'ĐVT', dataIndex: 'unit', width: 70 },
    {
      title: 'Tình trạng hàng hóa',
      dataIndex: 'condition',
      width: 150,
      render: (value: ProductCondition) => (
        <Tag color={conditionColor[value]}>{conditionLabels[value]}</Tag>
      ),
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      width: 120,
      render: (value: string | null) => value || 'N/A',
    },
    ...(!isCustomer
      ? ([{ title: 'Đối tác', dataIndex: 'partnerName', width: 240 }] as TableColumnsType<ProductLocationRow>)
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Vị trí sản phẩm"
        description="Tổng hợp sản phẩm đang nằm ở các vị trí / kiện hàng theo từng trạng thái."
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap>
            <Space.Compact style={{ width: 280 }}>
              <Input
                allowClear
                placeholder="Mã / tên sản phẩm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={() => setAppliedQuery(query)}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setAppliedQuery(query)}
              />
            </Space.Compact>
            {!isCustomer ? (
              <Select
                allowClear
                placeholder="Đối tác"
                style={{ minWidth: 320 }}
                value={partner}
                onChange={setPartner}
                options={partnerOptions}
              />
            ) : null}
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={locationColumns}
          dataSource={locationRows}
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: 'Không có dữ liệu vị trí' }}
        />

        <div style={{ marginTop: 20 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>
            Theo kiện hàng
          </div>
          <Table
            rowKey="id"
            columns={packageColumns}
            dataSource={packageRows}
            scroll={{ x: 1400 }}
            pagination={false}
            locale={{ emptyText: 'Không có kiện hàng' }}
          />
        </div>
      </div>
    </div>
  )
}
