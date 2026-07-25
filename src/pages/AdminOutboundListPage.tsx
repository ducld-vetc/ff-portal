import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FilterOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  deliveryMethodLabel,
  listOutboundRequests,
  outboundPriorityColor,
  outboundPriorityLabel,
  outboundSearchFields,
  outboundStatusColor,
  outboundStatusLabel,
  type DeliveryMethod,
  type OutboundOrderType,
  type OutboundPriority,
  type OutboundRequest,
  type OutboundSearchField,
  type OutboundStatus,
} from '../data/outboundRequests'

const { RangePicker } = DatePicker

function maskName(name: string) {
  const parts = name.split(' ')
  return parts
    .map((p) => (p.length <= 1 ? p : `${p[0]}${'*'.repeat(Math.min(2, p.length - 1))}`))
    .join(' ')
}

function maskPhone(phone: string) {
  if (phone.length < 6) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-2)}`
}

function fmtDt(v?: string | null) {
  return v ? dayjs(v).format('DD/MM/YYYY HH:mm:ss') : '—'
}

export default function AdminOutboundListPage() {
  const navigate = useNavigate()
  const rows = listOutboundRequests()
  const [searchField, setSearchField] = useState<OutboundSearchField>('partnerOrCode')
  const [query, setQuery] = useState('')
  const [createdRange, setCreatedRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs('2026-07-10'),
    dayjs('2026-07-25'),
  ])
  const [outboundType, setOutboundType] = useState<string | undefined>()
  const [priority, setPriority] = useState<OutboundPriority | undefined>()
  const [partner, setPartner] = useState<string | undefined>()
  const [processingStatus, setProcessingStatus] = useState<string | undefined>()
  const [shippingPackage, setShippingPackage] = useState<string | undefined>()
  const [carrier, setCarrier] = useState<string | undefined>()
  const [channel, setChannel] = useState<string | undefined>()
  const [store, setStore] = useState<string | undefined>()
  const [delayDays, setDelayDays] = useState<number | undefined>()
  const [status, setStatus] = useState<OutboundStatus | undefined>()
  const [orderType, setOrderType] = useState<OutboundOrderType | undefined>()
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const partnerOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.partnerName || r.storeName).filter(Boolean))].map((v) => ({
        value: v!,
        label: v!,
      })),
    [rows],
  )
  const storeOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.storeName).filter(Boolean))].map((v) => ({
        value: v!,
        label: v!,
      })),
    [rows],
  )
  const channelOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.channel).filter(Boolean))].map((v) => ({
        value: v!,
        label: v!,
      })),
    [rows],
  )
  const packageOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.shippingPackage).filter(Boolean))].map((v) => ({
        value: v!,
        label: v!,
      })),
    [rows],
  )
  const carrierOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.carrierCode).filter(Boolean))].map((v) => ({
        value: v!,
        label: v!,
      })),
    [rows],
  )
  const processingOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.processingStatus).filter(Boolean))].map((v) => ({
        value: v!,
        label: v!,
      })),
    [rows],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const hay = String(row[searchField] ?? '').toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (createdRange) {
        const created = dayjs(row.createdAt)
        if (
          created.isBefore(createdRange[0].startOf('day')) ||
          created.isAfter(createdRange[1].endOf('day'))
        ) {
          return false
        }
      }
      if (outboundType === 'b2b' && !row.isB2b) return false
      if (outboundType === 'order' && row.isB2b) return false
      if (priority && row.priority !== priority) return false
      if (partner && (row.partnerName || row.storeName) !== partner) return false
      if (processingStatus && row.processingStatus !== processingStatus) return false
      if (shippingPackage && row.shippingPackage !== shippingPackage) return false
      if (carrier && row.carrierCode !== carrier) return false
      if (channel && row.channel !== channel) return false
      if (store && row.storeName !== store) return false
      if (delayDays !== undefined && (row.delayDays ?? 0) !== delayDays) return false
      if (status && row.status !== status) return false
      if (orderType && (row.orderType || (row.isB2b ? 'B2B' : 'Order')) !== orderType) return false
      return true
    })
  }, [
    rows,
    query,
    searchField,
    createdRange,
    outboundType,
    priority,
    partner,
    processingStatus,
    shippingPackage,
    carrier,
    channel,
    store,
    delayDays,
    status,
    orderType,
  ])

  const fieldLabel =
    outboundSearchFields.find((f) => f.value === searchField)?.label ?? 'Mã OR đối tác'

  const columns: TableColumnsType<OutboundRequest> = [
    { title: '#', width: 50, fixed: 'left', render: (_, __, i) => i + 1 },
    {
      title: 'Ngày phát sinh',
      width: 150,
      render: (_, row) => fmtDt(row.occurredAt || row.createdAt),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 150,
      render: (v: string) => fmtDt(v),
    },
    {
      title: 'Mã xuất kho',
      dataIndex: 'code',
      width: 170,
      render: (code: string, row) => (
        <Link to={`/operations/outbound/${row.id}`} className="inbound-ir-link">
          {code}
        </Link>
      ),
    },
    {
      title: 'Loại',
      width: 80,
      render: (_, row) => row.orderType || (row.isB2b ? 'B2B' : 'Order'),
    },
    { title: 'Mã xuất kho đối tác', dataIndex: 'partnerOrCode', width: 150 },
    {
      title: 'SL SKU',
      width: 80,
      align: 'right',
      render: (_, row) => row.lines.length,
    },
    {
      title: 'SL Item',
      width: 80,
      align: 'right',
      render: (_, row) => row.lines.reduce((s, l) => s + l.qty, 0),
    },
    {
      title: 'Người mua',
      width: 160,
      render: (_, row) => (
        <div>
          <div>{maskName(row.buyerName)}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
            {maskPhone(row.buyerPhone)}
          </div>
        </div>
      ),
    },
    {
      title: 'Đối tác',
      width: 200,
      ellipsis: true,
      render: (_, row) => row.partnerName || row.storeName || '—',
    },
    { title: 'Kênh bán hàng', dataIndex: 'channel', width: 120, render: (v) => v || '—' },
    { title: 'Cửa hàng', dataIndex: 'storeName', width: 180, ellipsis: true, render: (v) => v || '—' },
    {
      title: 'Hình thức nhận hàng',
      width: 150,
      render: (_, row) => deliveryMethodLabel[row.deliveryMethod as DeliveryMethod],
    },
    {
      title: 'Đối tác vận chuyển',
      width: 140,
      render: (_, row) => row.carrierCode || '—',
    },
    {
      title: 'Mã vận đơn',
      width: 140,
      render: (_, row) =>
        row.trackingCode ? (
          <span className="inbound-ir-link">{row.trackingCode}</span>
        ) : (
          '—'
        ),
    },
    {
      title: 'Độ ưu tiên',
      width: 110,
      render: (_, row) => (
        <Tag color={outboundPriorityColor[row.priority]}>{outboundPriorityLabel[row.priority]}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (v: OutboundRequest['status']) => (
        <Tag color={outboundStatusColor[v]}>{outboundStatusLabel[v]}</Tag>
      ),
    },
    {
      title: 'Số ngày trễ',
      width: 110,
      align: 'right',
      render: (_, row) => row.delayDays ?? 0,
    },
    {
      title: 'Loại đơn',
      width: 100,
      render: (_, row) => row.orderType || (row.isB2b ? 'B2B' : 'Order'),
    },
    {
      title: 'SLA DVVC',
      width: 110,
      render: (_, row) => (
        <Tag color={row.slaCarrierLate ? 'error' : 'success'}>
          {row.slaCarrierLate ? 'Trễ' : 'Chưa trễ'}
        </Tag>
      ),
    },
    {
      title: 'SLA xử lý KBH',
      width: 150,
      render: (_, row) => (
        <span style={{ color: row.slaCarrierLate ? '#dc2626' : '#16a34a' }}>
          {fmtDt(row.slaChannelAt)}
        </span>
      ),
    },
    {
      title: 'SLA đóng gói',
      width: 150,
      render: (_, row) => fmtDt(row.slaPackingAt),
    },
    {
      title: 'Ngày đóng gói',
      width: 150,
      render: (_, row) => fmtDt(row.packedAt),
    },
    {
      title: 'Ngày bàn giao',
      width: 150,
      render: (_, row) => fmtDt(row.handedOverAt),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Yêu cầu xuất kho"
        description="Vận hành → Xuất kho: theo dõi đơn xuất, lấy hàng nhanh và bàn giao vận chuyển."
        extra={
          <Space wrap>
            <Button type="primary" onClick={() => message.success('Đã xuất file chi tiết (demo)')}>
              Xuất file chi tiết
            </Button>
            <Button
              className="btn-success"
              onClick={() => message.success(`Đã xuất ${filtered.length} yêu cầu (demo)`)}
            >
              Xuất Excel
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="ops-filter-panel">
          <div className="ops-filter-row">
            <Space.Compact className="ops-filter-search">
              <Select
                value={searchField}
                style={{ width: 160 }}
                options={outboundSearchFields.map((f) => ({ value: f.value, label: f.label }))}
                onChange={setSearchField}
              />
              <Input
                allowClear
                placeholder={`Tìm kiếm theo ${fieldLabel}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: 280 }}
              />
              <Button type="primary" icon={<SearchOutlined />} />
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setAdvancedOpen((v) => !v)}
                title={advancedOpen ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao'}
              />
            </Space.Compact>
          </div>

          <div className="ops-filter-row">
            <Select
              defaultValue="createdAt"
              style={{ width: 130 }}
              options={[{ value: 'createdAt', label: 'Ngày tạo' }]}
            />
            <RangePicker
              value={createdRange}
              onChange={(v) => setCreatedRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              style={{ minWidth: 280 }}
            />
            <Select
              allowClear
              placeholder="Loại xuất kho"
              className="ops-filter-highlight"
              style={{ width: 160 }}
              value={outboundType}
              onChange={setOutboundType}
              options={[
                { value: 'order', label: 'Order' },
                { value: 'b2b', label: 'B2B' },
              ]}
            />
          </div>

          {advancedOpen ? (
            <>
              <div className="ops-filter-row ops-filter-grid">
                <Select
                  allowClear
                  placeholder="Độ ưu tiên"
                  value={priority}
                  onChange={setPriority}
                  options={Object.entries(outboundPriorityLabel).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
                <Select
                  allowClear
                  placeholder="Chọn đối tác"
                  value={partner}
                  onChange={setPartner}
                  options={partnerOptions}
                  showSearch
                  optionFilterProp="label"
                />
                <Select
                  allowClear
                  placeholder="Tình trạng xử lý"
                  value={processingStatus}
                  onChange={setProcessingStatus}
                  options={processingOptions}
                />
                <Select
                  allowClear
                  placeholder="Chọn dịch vụ vận chuyển"
                  value={shippingPackage}
                  onChange={setShippingPackage}
                  options={packageOptions}
                />
                <Select
                  allowClear
                  placeholder="Đối tác vận chuyển"
                  value={carrier}
                  onChange={setCarrier}
                  options={carrierOptions}
                />
              </div>

              <div className="ops-filter-row ops-filter-grid">
                <Select
                  allowClear
                  placeholder="Kênh bán hàng"
                  value={channel}
                  onChange={setChannel}
                  options={channelOptions}
                />
                <Select
                  allowClear
                  placeholder="Cửa hàng"
                  value={store}
                  onChange={setStore}
                  options={storeOptions}
                  showSearch
                  optionFilterProp="label"
                />
                <Select
                  allowClear
                  placeholder="Số ngày trễ"
                  value={delayDays}
                  onChange={setDelayDays}
                  options={[0, 1, 2, 3, 5, 7].map((n) => ({ value: n, label: String(n) }))}
                />
                <Select
                  allowClear
                  placeholder="Trạng thái"
                  value={status}
                  onChange={setStatus}
                  options={Object.entries(outboundStatusLabel).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
                <Select
                  allowClear
                  placeholder="Loại đơn"
                  value={orderType}
                  onChange={setOrderType}
                  options={[
                    { value: 'Order', label: 'Order' },
                    { value: 'B2B', label: 'B2B' },
                    { value: 'Manual', label: 'Manual' },
                  ]}
                />
              </div>
            </>
          ) : null}
        </div>

        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 3600 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} yêu cầu` }}
          onRow={(row) => ({
            onDoubleClick: () => navigate(`/operations/outbound/${row.id}`),
          })}
        />
      </div>
    </div>
  )
}
