import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
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
  handoverCarrierOptions,
  handoverSessionTypeLabel,
  handoverStatusColor,
  handoverStatusLabel,
  listCarrierHandovers,
  type CarrierHandoverSession,
  type HandoverSessionType,
  type HandoverStatus,
} from '../data/carrierHandovers'

const { RangePicker } = DatePicker

export default function AdminCarrierHandoverListPage() {
  const navigate = useNavigate()
  const rows = listCarrierHandovers()
  const [query, setQuery] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [createdRange, setCreatedRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs('2016-01-01'),
    dayjs(),
  ])
  const [carrierCode, setCarrierCode] = useState<string | undefined>()
  const [sessionType, setSessionType] = useState<HandoverSessionType | undefined>()
  const [statuses, setStatuses] = useState<HandoverStatus[]>(['new', 'processing'])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const hitCode = row.code.toLowerCase().includes(q)
        const hitOutbound = row.packages.some(
          (p) =>
            p.outboundCode.toLowerCase().includes(q) ||
            p.partnerOrCode.toLowerCase().includes(q) ||
            p.packageCode.toLowerCase().includes(q),
        )
        if (!hitCode && !hitOutbound) return false
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
      if (carrierCode && row.carrierCode !== carrierCode) return false
      if (sessionType && row.sessionType !== sessionType) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      return true
    })
  }, [rows, query, createdRange, carrierCode, sessionType, statuses])

  const columns: TableColumnsType<CarrierHandoverSession> = [
    { title: '#', width: 56, render: (_, __, index) => index + 1 },
    { title: 'Nhà vận chuyển', dataIndex: 'carrierName', width: 200 },
    {
      title: 'Mã phiên bàn giao',
      dataIndex: 'code',
      width: 180,
      render: (code: string, row) => (
        <Link to={`/operations/carrier-handover/${row.id}`} className="inbound-ir-link">
          {code}
        </Link>
      ),
    },
    {
      title: 'Loại phiên',
      dataIndex: 'sessionType',
      width: 130,
      render: (v: HandoverSessionType) => handoverSessionTypeLabel[v],
    },
    { title: 'Số kiện hàng', dataIndex: 'packageCount', width: 120, align: 'right' },
    { title: 'SL đơn xuất', dataIndex: 'outboundCount', width: 120, align: 'right' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (v: HandoverStatus) => (
        <Tag color={handoverStatusColor[v]}>{handoverStatusLabel[v]}</Tag>
      ),
    },
    { title: 'Người tạo', dataIndex: 'createdBy', width: 200, ellipsis: true },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 130,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
  ]

  return (
    <div>
      <PageHeader title="Bàn giao đối tác vận chuyển" />

      <div className="content-card">
        <div className="table-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Space.Compact>
              <Input
                allowClear
                placeholder="Tìm kiếm mã phiên bàn giao, mã yêu cầu xuất kho..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={() => message.success(`Tìm thấy ${filtered.length} kết quả`)}
                style={{ width: 360 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => message.success(`Tìm thấy ${filtered.length} kết quả`)}
              />
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setAdvancedOpen((v) => !v)}
                title={advancedOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              />
            </Space.Compact>

            <Space wrap>
              <Button
                className="btn-success"
                icon={<PlusOutlined />}
                onClick={() => navigate('/operations/carrier-handover/receipt')}
              >
                Tạo phiên nhận
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/operations/carrier-handover/delivery')}
              >
                Tạo phiên giao
              </Button>
            </Space>
          </div>

          {advancedOpen ? (
            <Space wrap>
              <RangePicker
                value={createdRange}
                onChange={(v) => setCreatedRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="DD/MM/YYYY"
              />
              <Select
                allowClear
                placeholder="Đối tác vận chuyển"
                style={{ width: 200 }}
                value={carrierCode}
                onChange={setCarrierCode}
                options={handoverCarrierOptions}
              />
              <Select
                allowClear
                placeholder="Loại phiên"
                style={{ width: 160 }}
                value={sessionType}
                onChange={setSessionType}
                options={Object.entries(handoverSessionTypeLabel).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                mode="multiple"
                allowClear
                placeholder="Trạng thái"
                style={{ minWidth: 220 }}
                value={statuses}
                onChange={setStatuses}
                options={Object.entries(handoverStatusLabel).map(([value, label]) => ({
                  value,
                  label,
                }))}
                maxTagCount="responsive"
              />
            </Space>
          ) : null}
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} phiên` }}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </div>
    </div>
  )
}
