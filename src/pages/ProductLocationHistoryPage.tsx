import { useMemo, useState } from 'react'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import {
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import {
  conditionLabels,
  seedProductLocationHistory,
  workSessionOptions,
  type ProductCondition,
  type ProductLocationHistoryRow,
} from '../data/productLocations'
import { usePortal } from '../portal/PortalContext'

const { RangePicker } = DatePicker

const partnerOptions = Array.from(
  new Map(
    seedProductLocationHistory.map((row) => [
      row.partnerCode,
      { value: row.partnerCode, label: row.partnerName },
    ]),
  ).values(),
)

export default function ProductLocationHistoryPage() {
  const { isCustomer } = usePortal()
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [partner, setPartner] = useState<string | undefined>()
  const [session, setSession] = useState<string | undefined>()
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs('2026-07-14'),
    dayjs('2026-07-21'),
  ])

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return seedProductLocationHistory.filter((row) => {
      if (!isCustomer && partner && row.partnerCode !== partner) return false
      if (session && row.session !== workSessionOptions.find((s) => s.value === session)?.label) {
        return false
      }
      if (range) {
        const d = dayjs(row.updatedAt)
        if (d.isBefore(range[0].startOf('day')) || d.isAfter(range[1].endOf('day'))) {
          return false
        }
      }
      if (
        q &&
        !row.sku.toLowerCase().includes(q) &&
        !row.productName.toLowerCase().includes(q) &&
        !row.ioCode.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [appliedQuery, partner, session, range, isCustomer])

  const summary = filtered[0]

  const columns: TableColumnsType<ProductLocationHistoryRow> = [
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      width: 160,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm:ss'),
    },
    { title: 'Người cập nhật', dataIndex: 'updatedBy', width: 120 },
    {
      title: 'Mã nhập/xuất',
      dataIndex: 'ioCode',
      width: 170,
      render: (value: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{value}</span>
      ),
    },
    {
      title: 'Ngày nhập/xuất',
      dataIndex: 'ioDate',
      width: 130,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Số lô',
      dataIndex: 'lot',
      width: 100,
      render: (value: string) => value || '—',
    },
    {
      title: 'Thông tin ngày',
      dataIndex: 'dateInfo',
      width: 120,
      render: (value: string) => value || '—',
    },
    { title: 'Phiên làm việc', dataIndex: 'session', width: 150 },
    { title: 'ĐVT', dataIndex: 'unit', width: 70 },
    { title: 'SL/Serial', dataIndex: 'qtyOrSerial', width: 90, align: 'right' },
    {
      title: 'Tình trạng hàng hóa',
      dataIndex: 'condition',
      width: 150,
      render: (value: ProductCondition) => <Tag>{conditionLabels[value]}</Tag>,
    },
    {
      title: 'Vị trí nguồn',
      dataIndex: 'sourceLocation',
      width: 130,
      render: (value: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
      ),
    },
    {
      title: 'Vị trí đích',
      dataIndex: 'destLocation',
      width: 130,
      render: (value: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
      ),
    },
  ]

  const exportExcel = () => {
    if (!filtered.length) {
      message.warning('Không có dữ liệu để xuất')
      return
    }

    const header = [
      'Ngày cập nhật',
      'Người cập nhật',
      'Mã nhập/xuất',
      'Ngày nhập/xuất',
      'Số lô',
      'Thông tin ngày',
      'Phiên làm việc',
      'ĐVT',
      'SL/Serial',
      'Tình trạng hàng hóa',
      'Vị trí nguồn',
      'Vị trí đích',
      'SKU',
      'Đối tác',
    ]

    const lines = filtered.map((row) =>
      [
        dayjs(row.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
        row.updatedBy,
        row.ioCode,
        dayjs(row.ioDate).format('DD/MM/YYYY'),
        row.lot,
        row.dateInfo,
        row.session,
        row.unit,
        row.qtyOrSerial,
        conditionLabels[row.condition],
        row.sourceLocation,
        row.destLocation,
        row.sku,
        row.partnerName,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    )

    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lich-su-vi-tri-san-pham-${dayjs().format('YYYYMMDD-HHmm')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    message.success('Đã xuất Excel (CSV)')
  }

  return (
    <div>
      <PageHeader
        title="Lịch sử vị trí sản phẩm"
        description="Theo dõi lịch sử di chuyển vị trí sản phẩm theo phiên làm việc."
        extra={
          <IconAction
            title="Xuất Excel"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportExcel}
          />
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap>
            <Space.Compact style={{ width: 240 }}>
              <Input
                allowClear
                placeholder="Mã sản phẩm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={() => setAppliedQuery(query)}
              />
              <IconAction
                title="Tìm kiếm"
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setAppliedQuery(query)}
              />
            </Space.Compact>
            <RangePicker
              format="DD/MM/YYYY"
              value={range}
              onChange={(values) =>
                setRange(values && values[0] && values[1] ? [values[0], values[1]] : null)
              }
            />
            {!isCustomer ? (
              <Select
                allowClear
                placeholder="Đối tác"
                style={{ minWidth: 280 }}
                value={partner}
                onChange={setPartner}
                options={partnerOptions}
              />
            ) : null}
            <Select
              allowClear
              placeholder="Phiên làm việc"
              style={{ minWidth: 180 }}
              value={session}
              onChange={setSession}
              options={workSessionOptions}
            />
          </Space>
        </div>

        {summary ? (
          <div className="product-history-summary">
            <div className="product-history-summary-name">{summary.productName}</div>
            <div className="product-history-summary-meta">
              <span>
                Loại lưu trữ: <strong>{summary.storageType}</strong>
              </span>
              <span>
                Loại sản phẩm: <strong>{summary.productType}</strong>
              </span>
              <span>
                <strong>
                  {summary.sku} - {summary.sku}
                </strong>
              </span>
              <span>
                Loại nhập xuất: <strong>{summary.ioType}</strong>
              </span>
            </div>
          </div>
        ) : null}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1600 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </div>
  )
}
