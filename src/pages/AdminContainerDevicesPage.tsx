import { useMemo, useState } from 'react'
import { ExportOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import { PageHeader } from '../components/PageHeader'
import {
  ageBucketLabel,
  ageBucketOrder,
  buildStatusMatrix,
  cancelledPackageStatusLabel,
  cancelledPackageStatusOptions,
  containerDeviceStatusLabel,
  containerDeviceTypeOptions,
  getMaxDelayDays,
  listCancelledPackages,
  listContainerDevices,
  type AgeBucket,
  type CancelledPackageRow,
  type CancelledPackageStatus,
  type ContainerDeviceRow,
  type ContainerDeviceStatus,
  type MatrixCell,
} from '../data/containerDevices'

type DetailState = {
  status: ContainerDeviceStatus
  ageBucket: AgeBucket
} | null

export default function AdminContainerDevicesPage() {
  const [tab, setTab] = useState<'devices' | 'cancelled'>('devices')
  const [deviceType, setDeviceType] = useState<string | undefined>('Tote')
  const [detail, setDetail] = useState<DetailState>(null)
  const [detailType, setDetailType] = useState<string | undefined>('Tote')
  const [locationQuery, setLocationQuery] = useState('')
  const [appliedLocation, setAppliedLocation] = useState('')

  const [cancelledStatus, setCancelledStatus] = useState<CancelledPackageStatus | undefined>()
  const [cancelledQuery, setCancelledQuery] = useState('')
  const [cancelledAppliedQuery, setCancelledAppliedQuery] = useState('')

  const allRows = useMemo(() => listContainerDevices(), [])
  const cancelledAll = useMemo(() => listCancelledPackages(), [])

  const filteredByType = useMemo(
    () => (deviceType ? allRows.filter((r) => r.deviceType === deviceType) : allRows),
    [allRows, deviceType],
  )

  const matrixRows = useMemo(() => buildStatusMatrix(filteredByType), [filteredByType])
  const maxDelay = useMemo(() => getMaxDelayDays(filteredByType), [filteredByType])

  const cancelledFiltered = useMemo(() => {
    const q = cancelledAppliedQuery.trim().toLowerCase()
    return cancelledAll.filter((row) => {
      if (cancelledStatus && row.status !== cancelledStatus) return false
      if (!q) return true
      return (
        row.outboundCode.toLowerCase().includes(q) || row.packageCode.toLowerCase().includes(q)
      )
    })
  }, [cancelledAll, cancelledStatus, cancelledAppliedQuery])

  const detailRows = useMemo(() => {
    if (!detail) return []
    return allRows.filter((r) => {
      if (r.status !== detail.status || r.ageBucket !== detail.ageBucket) return false
      if (detailType && r.deviceType !== detailType) return false
      if (appliedLocation) {
        const loc = (r.locationCode || '').toLowerCase()
        if (!loc.includes(appliedLocation.toLowerCase())) return false
      }
      return true
    })
  }, [allRows, detail, detailType, appliedLocation])

  const openDetail = (status: ContainerDeviceStatus, ageBucket: AgeBucket, cell: MatrixCell) => {
    if (!cell) return
    setDetailType(deviceType)
    setLocationQuery('')
    setAppliedLocation('')
    setDetail({ status, ageBucket })
  }

  const matrixColumns: TableColumnsType<(typeof matrixRows)[number]> = [
    {
      title: '',
      dataIndex: 'label',
      width: 220,
      fixed: 'left',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    ...ageBucketOrder.map((bucket, index) => ({
      title: ageBucketLabel[bucket],
      width: 120,
      align: 'center' as const,
      render: (_: unknown, row: (typeof matrixRows)[number]) => {
        const cell = row.cells[index]
        if (!cell) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>
        return (
          <button
            type="button"
            className="ops-device-matrix-link"
            onClick={() => openDetail(row.status, bucket, cell)}
          >
            {cell.deviceCount} ({cell.productQty})
          </button>
        )
      },
    })),
  ]

  const detailColumns: TableColumnsType<ContainerDeviceRow> = [
    { title: '#', width: 56, render: (_, __, i) => i + 1 },
    {
      title: 'Thiết bị chứa hàng',
      dataIndex: 'code',
      width: 160,
      render: (v: string) => <span className="inbound-ir-link">{v}</span>,
    },
    { title: 'Số lượng SKU', dataIndex: 'skuCount', width: 130, align: 'right' },
    { title: 'SL Sản phẩm', dataIndex: 'productQty', width: 130, align: 'right' },
    { title: 'Người thao tác', dataIndex: 'operator', width: 240, ellipsis: true },
  ]

  const cancelledColumns: TableColumnsType<CancelledPackageRow> = [
    { title: '#', width: 56, render: (_, __, i) => i + 1 },
    {
      title: 'Mã xuất kho',
      dataIndex: 'outboundCode',
      width: 180,
      render: (v: string) => <span className="inbound-ir-link">{v}</span>,
    },
    { title: 'Mã kiện hàng', dataIndex: 'packageCode', width: 200 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 220,
      render: (v: CancelledPackageStatus) => cancelledPackageStatusLabel[v],
    },
    { title: 'Số ngày hoàn', dataIndex: 'returnDaysLabel', width: 120 },
    { title: 'Số lượng SKU', dataIndex: 'skuCount', width: 120, align: 'right' },
    { title: 'SL Sản phẩm', dataIndex: 'productQty', width: 120, align: 'right' },
    {
      title: 'Người thao tác',
      dataIndex: 'operator',
      width: 180,
      render: (v?: string) => v || '',
    },
  ]

  return (
    <div>
      <PageHeader title="Danh sách thiết bị" />

      <div className="content-card">
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as 'devices' | 'cancelled')}
          items={[
            { key: 'devices', label: 'Thiết bị chứa hàng' },
            { key: 'cancelled', label: 'Kiện hàng lưu kho hàng hủy' },
          ]}
        />

        {tab === 'devices' ? (
          <>
            <div className="ops-device-matrix-toolbar">
              <Select
                allowClear
                placeholder="Loại thiết bị"
                style={{ width: 180 }}
                value={deviceType}
                onChange={setDeviceType}
                options={containerDeviceTypeOptions}
              />
              <Typography.Link className="ops-device-delay">
                Số ngày trễ lớn nhất: {maxDelay}
              </Typography.Link>
            </div>

            <Table
              rowKey="status"
              size="middle"
              pagination={false}
              columns={matrixColumns}
              dataSource={matrixRows}
              scroll={{ x: 900 }}
              locale={{ emptyText: 'Không có dữ liệu' }}
              className="ops-device-matrix-table"
            />
          </>
        ) : (
          <>
            <div className="ops-device-detail-toolbar">
              <Space wrap>
                <Select
                  allowClear
                  placeholder="Trạng thái"
                  style={{ width: 240 }}
                  value={cancelledStatus}
                  onChange={setCancelledStatus}
                  options={cancelledPackageStatusOptions}
                />
                <Space.Compact>
                  <Input
                    allowClear
                    placeholder="Mã Kiện hàng, mã OR"
                    value={cancelledQuery}
                    onChange={(e) => setCancelledQuery(e.target.value)}
                    onPressEnter={() => setCancelledAppliedQuery(cancelledQuery.trim())}
                    style={{ width: 280 }}
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => setCancelledAppliedQuery(cancelledQuery.trim())}
                  />
                </Space.Compact>
              </Space>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={() =>
                  message.success(`Đã xuất ${cancelledFiltered.length} dòng chi tiết (demo)`)
                }
              >
                Xuất file chi tiết
              </Button>
            </div>

            <Table
              rowKey="id"
              size="middle"
              columns={cancelledColumns}
              dataSource={cancelledFiltered}
              scroll={{ x: 1200 }}
              pagination={{ pageSize: 10, showTotal: (t) => `${t} kiện` }}
              locale={{ emptyText: 'Không có dữ liệu' }}
            />
          </>
        )}
      </div>

      <Modal
        title={`Thiết bị chứa hàng: ${detail ? containerDeviceStatusLabel[detail.status] : ''}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        width={900}
        destroyOnHidden
        footer={null}
      >
        <div className="ops-device-detail-toolbar">
          <Space wrap>
            <Typography.Text strong>{detail ? ageBucketLabel[detail.ageBucket] : ''}</Typography.Text>
            <Select
              allowClear
              placeholder="Loại thiết bị"
              style={{ width: 140 }}
              value={detailType}
              onChange={setDetailType}
              options={containerDeviceTypeOptions}
            />
            <Space.Compact>
              <Input
                allowClear
                placeholder="vị trí"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onPressEnter={() => setAppliedLocation(locationQuery.trim())}
                style={{ width: 180 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setAppliedLocation(locationQuery.trim())}
              />
            </Space.Compact>
          </Space>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={() => message.success(`Đã xuất ${detailRows.length} dòng chi tiết (demo)`)}
          >
            Xuất file chi tiết
          </Button>
        </div>

        <Table
          rowKey="id"
          size="middle"
          columns={detailColumns}
          dataSource={detailRows}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} thiết bị` }}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </Modal>
    </div>
  )
}
