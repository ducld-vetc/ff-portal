import { useMemo, useState, type Key } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import { pickupAssignments } from '../data/mock'
import {
  listOutboundRequests,
  outboundPriorityLabel,
  type OutboundRequest,
} from '../data/outboundRequests'
import { getLocationSetup } from '../data/warehouseLocations'
import type { PickListLine } from '../data/pickingLists'

const { RangePicker } = DatePicker

const pickMethods = [
  { value: 'Cluster', label: 'Gom đơn xuất (Cluster)' },
  { value: 'PTO', label: 'Lấy theo đơn xuất (PTO)' },
  { value: 'PTS', label: 'Lấy hàng và phân loại (PTS)' },
  { value: 'PTD', label: 'PTD - Lấy hàng và bàn giao' },
  { value: 'SIO', label: 'SIO - Chỉ xử lý các đơn một sản phẩm' },
  { value: 'SSO', label: 'SSO - Chỉ xử lý các đơn hàng cùng mã sản phẩm' },
  {
    value: 'MSMQ',
    label: 'MSMQ - Chỉ xử lý các đơn hàng nhiều sản phẩm giống nhau chỉ khác số lượng',
  },
]

const conditionOptions = [
  { value: 'occurredAt', label: 'Thời gian phát sinh đơn', kind: 'daterange' },
  { value: 'createdAt', label: 'Ngày tạo đơn', kind: 'daterange' },
  { value: 'slaChannel', label: 'SLA xử lý kênh bán hàng', kind: 'daterange' },
  { value: 'sizeGroup', label: 'Nhóm kích thước', kind: 'select' },
  { value: 'partner', label: 'Đối tác', kind: 'select' },
  { value: 'sku', label: 'Mã sản phẩm (SKU)', kind: 'text' },
  { value: 'province', label: 'Tỉnh/thành phố giao', kind: 'select' },
  { value: 'priority', label: 'Độ ưu tiên', kind: 'select' },
  { value: 'shippingPackage', label: 'Gói dịch vụ', kind: 'select' },
  { value: 'carrier', label: 'Đối tác vận chuyển', kind: 'select' },
  { value: 'slaCarrier', label: 'SLA ĐVVC', kind: 'select' },
  { value: 'platformCommitAt', label: 'Thời gian cam kết chuẩn bị hàng với sàn', kind: 'daterange' },
  { value: 'channel', label: 'Kênh bán hàng', kind: 'select' },
  { value: 'store', label: 'Cửa hàng', kind: 'select' },
  { value: 'itemQty', label: 'SL sản phẩm/đơn', kind: 'number' },
  { value: 'orderType', label: 'Loại đơn', kind: 'select' },
] as const

type ConditionField = (typeof conditionOptions)[number]['value']
type ConditionKind = (typeof conditionOptions)[number]['kind']

type SearchCondition = {
  id: string
  field?: ConditionField
  value?: unknown
}

function conditionKind(field?: ConditionField): ConditionKind | undefined {
  return conditionOptions.find((o) => o.value === field)?.kind
}

function buildLocationRows(orders: OutboundRequest[]): PickListLine[] {
  const skuBinMap = new Map<string, string>()
  for (const wave of pickupAssignments) {
    for (const line of wave.lines) {
      if (!skuBinMap.has(line.sku)) skuBinMap.set(line.sku, line.binCode)
    }
  }
  const pickableBins = getLocationSetup('1').bins.filter((b) => !b.nonPickable)
  const fallback = ['R4.A1.T1.002', 'R1.A01.A.02', 'R1.A01.A.05', 'R1.A02.A.03']

  const result: PickListLine[] = []
  let index = 0
  for (const order of orders) {
    for (const line of order.lines) {
      const location =
        skuBinMap.get(line.sku) ||
        pickableBins[index % Math.max(pickableBins.length, 1)]?.code ||
        fallback[index % fallback.length]
      result.push({
        id: `${order.id}-${line.id}`,
        location,
        group: Math.floor(index / 2) + 1,
        productName: line.name,
        sku: line.sku,
        qty: line.qty,
        pickedQty: 0,
        unit: 'Cái',
        pickingDevice: 'RNN.052',
        outboundCode: order.code,
        lotNo: dayjs().subtract(index, 'day').format('YYMMDD'),
        mfgDate: dayjs().subtract(120 + index, 'day').format('YYYY-MM-DD'),
        expDate: dayjs().add(365 - index, 'day').format('YYYY-MM-DD'),
      })
      index += 1
    }
  }
  return result
}

export default function AdminPickingCreatePage() {
  const navigate = useNavigate()
  const rows = listOutboundRequests().filter((r) => r.status === 'new' || r.status === 'picking')
  const [step, setStep] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [method, setMethod] = useState('Cluster')
  const [note, setNote] = useState('')
  const [conditions, setConditions] = useState<SearchCondition[]>([])

  const partnerOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.partnerName || r.storeName).filter(Boolean))].map((v) => ({
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
  const storeOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.storeName).filter(Boolean))].map((v) => ({
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
  const provinceOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.province).filter(Boolean))].map((v) => ({
        value: v!,
        label: v!,
      })),
    [rows],
  )

  const usedFields = useMemo(
    () => new Set(conditions.map((c) => c.field).filter(Boolean)),
    [conditions],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const hay = [row.code, row.partnerOrCode].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      for (const cond of conditions) {
        if (!cond.field || cond.value === undefined || cond.value === null || cond.value === '') {
          continue
        }
        switch (cond.field) {
          case 'occurredAt':
          case 'createdAt':
          case 'slaChannel':
          case 'platformCommitAt': {
            const range = cond.value as [dayjs.Dayjs, dayjs.Dayjs] | undefined
            if (!range?.[0] || !range?.[1]) break
            const raw =
              cond.field === 'createdAt'
                ? row.createdAt
                : cond.field === 'slaChannel'
                  ? row.slaChannelAt || row.createdAt
                  : row.occurredAt || row.createdAt
            const d = dayjs(raw)
            if (d.isBefore(range[0].startOf('day')) || d.isAfter(range[1].endOf('day'))) {
              return false
            }
            break
          }
          case 'partner':
            if ((row.partnerName || row.storeName) !== cond.value) return false
            break
          case 'sku': {
            const skuQ = String(cond.value).toLowerCase()
            if (!row.lines.some((l) => l.sku.toLowerCase().includes(skuQ))) return false
            break
          }
          case 'province':
            if (row.province !== cond.value) return false
            break
          case 'priority':
            if (row.priority !== cond.value) return false
            break
          case 'shippingPackage':
            if (row.shippingPackage !== cond.value) return false
            break
          case 'carrier':
            if (row.carrierCode !== cond.value) return false
            break
          case 'slaCarrier':
            if (cond.value === 'late' && !row.slaCarrierLate) return false
            if (cond.value === 'on_time' && row.slaCarrierLate) return false
            break
          case 'channel':
            if (row.channel !== cond.value) return false
            break
          case 'store':
            if (row.storeName !== cond.value) return false
            break
          case 'itemQty': {
            const qty = row.lines.reduce((s, l) => s + l.qty, 0)
            if (qty !== Number(cond.value)) return false
            break
          }
          case 'orderType':
            if ((row.orderType || (row.isB2b ? 'B2B' : 'Order')) !== cond.value) return false
            break
          case 'sizeGroup':
            if ((row.lines.reduce((s, l) => s + l.qty, 0) === 1 ? 'XS' : 'M') !== cond.value) {
              return false
            }
            break
          default:
            break
        }
      }
      return true
    })
  }, [rows, query, conditions])

  const sio = filtered.filter((r) => r.lines.reduce((s, l) => s + l.qty, 0) === 1).length
  const mio = filtered.length - sio
  const sso = filtered.filter((r) => r.lines.length === 1).length

  const selectedOrders = useMemo(
    () => rows.filter((r) => selectedKeys.includes(r.id)),
    [rows, selectedKeys],
  )

  const locationRows = useMemo(() => buildLocationRows(selectedOrders), [selectedOrders])

  const locationColumns: TableColumnsType<PickListLine> = [
    { title: 'Vị trí', dataIndex: 'location', width: 140 },
    { title: 'Nhóm', dataIndex: 'group', width: 70, align: 'right' },
    { title: 'Phân công', dataIndex: 'assignee', width: 140, render: (v) => v || '—' },
    {
      title: 'Tên SP',
      width: 280,
      render: (_, row) => (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.sku}
          </Typography.Text>
          <div>{row.productName}</div>
        </div>
      ),
    },
    { title: 'SL', dataIndex: 'qty', width: 60, align: 'right' },
    { title: 'SL đã lấy', dataIndex: 'pickedQty', width: 90, align: 'right' },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    {
      title: 'Thiết bị lấy hàng',
      dataIndex: 'pickingDevice',
      width: 130,
      render: (v) => v || '—',
    },
    {
      title: 'Thiết bị đóng gói',
      dataIndex: 'packingDevice',
      width: 130,
      render: (v) => v || '—',
    },
    {
      title: 'Mã yêu cầu xuất kho',
      dataIndex: 'outboundCode',
      width: 170,
      render: (v: string) => <Typography.Link>{v}</Typography.Link>,
    },
    { title: 'Số lô', dataIndex: 'lotNo', width: 90, render: (v) => v || '—' },
    {
      title: 'Ngày sản xuất',
      dataIndex: 'mfgDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
  ]

  const columns: TableColumnsType<OutboundRequest> = [
    {
      title: 'Đối tác',
      width: 240,
      ellipsis: true,
      render: (_, row) => row.partnerName || row.storeName || row.warehouseName,
    },
    {
      title: 'Mã xuất kho',
      dataIndex: 'code',
      width: 170,
      render: (v: string) => <Typography.Link>{v}</Typography.Link>,
    },
    {
      title: 'Mã xuất kho đối tác',
      dataIndex: 'partnerOrCode',
      width: 160,
      render: (v: string) => <Typography.Link>{v}</Typography.Link>,
    },
    {
      title: 'Ngày trễ nhất xử lý đơn',
      width: 180,
      render: (_, row) =>
        dayjs(row.expectedDeliveryAt || row.createdAt)
          .endOf('day')
          .format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Thời gian cam kết chuẩn bị đơn hàng với sàn',
      width: 220,
      render: (_, row) => dayjs(row.occurredAt || row.createdAt).format('DD/MM/YYYY HH:mm:ss'),
    },
  ]

  const addCondition = () => {
    setConditions((prev) => [...prev, { id: `cond-${Date.now()}-${prev.length}` }])
  }

  const updateCondition = (id: string, patch: Partial<SearchCondition>) => {
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id))
  }

  const renderValueControl = (cond: SearchCondition) => {
    const kind = conditionKind(cond.field)
    if (!cond.field || !kind) return null

    if (kind === 'daterange') {
      return (
        <RangePicker
          value={(cond.value as [dayjs.Dayjs, dayjs.Dayjs] | undefined) ?? null}
          onChange={(v) => updateCondition(cond.id, { value: v })}
          format="DD/MM/YYYY"
          style={{ minWidth: 260 }}
        />
      )
    }

    if (kind === 'number') {
      return (
        <InputNumber
          min={1}
          placeholder="Nhập số lượng"
          value={cond.value as number | undefined}
          onChange={(v) => updateCondition(cond.id, { value: v ?? undefined })}
          style={{ width: 160 }}
        />
      )
    }

    if (kind === 'text') {
      return (
        <Input
          allowClear
          placeholder="Nhập giá trị"
          value={(cond.value as string) || ''}
          onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
          style={{ width: 220 }}
        />
      )
    }

    const selectOptions =
      cond.field === 'partner'
        ? partnerOptions
        : cond.field === 'channel'
          ? channelOptions
          : cond.field === 'store'
            ? storeOptions
            : cond.field === 'shippingPackage'
              ? packageOptions
              : cond.field === 'carrier'
                ? carrierOptions
                : cond.field === 'province'
                  ? provinceOptions
                  : cond.field === 'priority'
                    ? Object.entries(outboundPriorityLabel).map(([value, label]) => ({
                        value,
                        label,
                      }))
                    : cond.field === 'slaCarrier'
                      ? [
                          { value: 'on_time', label: 'Chưa trễ' },
                          { value: 'late', label: 'Trễ' },
                        ]
                      : cond.field === 'orderType'
                        ? [
                            { value: 'Order', label: 'Order' },
                            { value: 'B2B', label: 'B2B' },
                            { value: 'Manual', label: 'Manual' },
                          ]
                        : cond.field === 'sizeGroup'
                          ? [
                              { value: 'XS', label: 'XS' },
                              { value: 'S', label: 'S' },
                              { value: 'M', label: 'M' },
                              { value: 'L', label: 'L' },
                            ]
                          : []

    return (
      <Select
        allowClear
        placeholder="Chọn giá trị"
        value={cond.value as string | undefined}
        onChange={(v) => updateCondition(cond.id, { value: v })}
        options={selectOptions}
        style={{ minWidth: 200 }}
        showSearch
        optionFilterProp="label"
      />
    )
  }

  const next = () => {
    if (step === 0) {
      if (!selectedKeys.length) {
        message.warning('Chọn ít nhất một yêu cầu xuất kho')
        return
      }
      setStep(1)
      return
    }
    if (step === 1) {
      setStep(2)
      return
    }
    message.success(`Đã tạo danh sách lấy hàng với ${locationRows.length} dòng vị trí (demo)`)
    navigate('/operations/picking')
  }

  const back = () => {
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div>
      <PageHeader
        title="Tạo danh sách lấy hàng"
        extra={
          <Space>
            {step > 0 ? <Button onClick={back}>Quay lại</Button> : null}
            <Button className="btn-success" onClick={next}>
              {step === 0 ? 'Tiếp tục' : step === 1 ? 'Tiếp tục' : 'Tạo danh sách lấy hàng'}
            </Button>
          </Space>
        }
      />

      <div className="content-card" style={{ marginBottom: 16 }}>
        <Steps
          current={step}
          items={[
            { title: 'Chọn yêu cầu xuất kho' },
            { title: 'Tạo danh sách lấy hàng' },
            { title: 'Xác định vị trí' },
          ]}
        />
      </div>

      {step < 2 ? (
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col xs={12} md={6}>
            <Card size="small">
              <Typography.Text type="secondary">Yêu cầu xuất kho</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{filtered.length}</div>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small">
              <Typography.Text type="secondary">Đơn xuất có một sản phẩm (SIO)</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>{sio}</div>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small">
              <Typography.Text type="secondary">Đơn xuất có nhiều sản phẩm (MIO)</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>{mio}</div>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small">
              <Typography.Text type="secondary">Đơn xuất có một mã sản phẩm (SSO)</Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ca8a04' }}>{sso}</div>
            </Card>
          </Col>
        </Row>
      ) : null}

      {step === 0 ? (
        <div className="content-card">
          <div className="ops-pick-filters">
            <Space.Compact style={{ width: '100%', maxWidth: 520 }}>
              <Input
                allowClear
                placeholder="Mã yêu cầu xuất kho"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="primary" icon={<SearchOutlined />} />
            </Space.Compact>
            <Button type="primary" icon={<PlusOutlined />} onClick={addCondition}>
              Thêm điều kiện
            </Button>
          </div>

          {conditions.length > 0 ? (
            <div className="ops-condition-list">
              {conditions.map((cond) => (
                <div key={cond.id} className="ops-condition-row">
                  <div className="ops-condition-label">Chọn điều kiện tìm kiếm</div>
                  <Select
                    placeholder="Chọn điều kiện"
                    value={cond.field}
                    onChange={(field: ConditionField) =>
                      updateCondition(cond.id, { field, value: undefined })
                    }
                    options={conditionOptions.map((o) => ({
                      value: o.value,
                      label: o.label,
                      disabled: usedFields.has(o.value) && cond.field !== o.value,
                    }))}
                    style={{ width: 320 }}
                    popupMatchSelectWidth={360}
                  />
                  {renderValueControl(cond)}
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeCondition(cond.id)}
                    title="Xóa điều kiện"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <Table
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: setSelectedKeys,
            }}
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 1100 }}
            pagination={{ pageSize: 8 }}
            style={{ marginTop: 12 }}
          />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="content-card">
          <Typography.Title level={5}>Thiết lập phương thức lấy hàng</Typography.Title>
          <Radio.Group
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            options={pickMethods}
          />
          <div style={{ marginTop: 20 }}>
            <Typography.Text type="secondary">Ghi chú</Typography.Text>
            <Input
              style={{ marginTop: 6 }}
              maxLength={50}
              placeholder="Nhập ghi chú (tối đa 50 ký tự)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="content-card">
          <div className="section-toolbar" style={{ marginBottom: 12 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Xác định vị trí lấy hàng
            </Typography.Title>
            <Typography.Text type="secondary">
              {locationRows.length} dòng · {selectedOrders.length} yêu cầu xuất kho · phương thức{' '}
              {method}
            </Typography.Text>
          </div>
          <Table
            rowKey="id"
            size="small"
            columns={locationColumns}
            dataSource={locationRows}
            scroll={{ x: 1600 }}
            pagination={{ pageSize: 10, showTotal: (t) => `${t} sản phẩm` }}
            locale={{ emptyText: 'Không có sản phẩm để xác định vị trí' }}
          />
        </div>
      ) : null}
    </div>
  )
}
