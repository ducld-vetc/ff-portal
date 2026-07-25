import { useMemo, useState, type Key } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FilterOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  listPickLists,
  pickListStatusColor,
  pickListStatusLabel,
  pickPriorityColor,
  pickPriorityLabel,
  type PickList,
  type PickListStatus,
  type PickPriority,
} from '../data/pickingLists'

const { RangePicker } = DatePicker

type Props = {
  b2bOnly?: boolean
}

export default function AdminPickingListPage({ b2bOnly = false }: Props) {
  const navigate = useNavigate()
  const rows = listPickLists({ b2bOnly })
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PickListStatus | undefined>()
  const [priority, setPriority] = useState<PickPriority | undefined>()
  const [unassignedOnly, setUnassignedOnly] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs(),
    dayjs(),
  ])
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q && !row.code.toLowerCase().includes(q)) return false
      if (status && row.status !== status) return false
      if (priority && row.priority !== priority) return false
      if (unassignedOnly && row.assignee) return false
      return true
    })
  }, [rows, query, status, priority, unassignedOnly])

  const columns: TableColumnsType<PickList> = [
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 170,
      render: (v: PickList['status'], row) => (
        <div>
          <Tag color={pickListStatusColor[v]}>{pickListStatusLabel[v]}</Tag>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {dayjs(row.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Tình trạng',
      width: 140,
      render: (_, row) => (
        <Space size={4} wrap>
          <Tag color={pickPriorityColor[row.priority]}>{pickPriorityLabel[row.priority]}</Tag>
          <Tag color={row.slaState === 'on_time' ? 'success' : 'error'}>
            {row.slaState === 'on_time' ? 'Chưa Trễ' : 'Trễ'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Mã ds lấy hàng',
      dataIndex: 'code',
      width: 240,
      render: (code: string, row) => (
        <div>
          <Link to={`/operations/picking/${row.id}`} className="inbound-ir-link">
            {code}
          </Link>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {row.createdBy} · {dayjs(row.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </div>
        </div>
      ),
    },
    {
      title: 'SL đơn xuất',
      dataIndex: 'orderQty',
      width: 100,
      align: 'right',
      render: (v: number, row) => (
        <Typography.Link onClick={() => navigate(`/operations/picking/${row.id}`)}>{v}</Typography.Link>
      ),
    },
    { title: 'SL sản phẩm', dataIndex: 'productQty', width: 110, align: 'right' },
    { title: 'Ghi chú', dataIndex: 'note', width: 140, render: (v) => v || '—' },
    { title: 'Kích thước', dataIndex: 'sizeGroup', width: 100 },
    { title: 'Thiết bị lấy hàng', dataIndex: 'pickingDevice', width: 130, render: (v) => v || '—' },
    {
      title: 'Phân công',
      width: 200,
      render: (_, row) =>
        row.assignee ? (
          <div>
            <div>{row.assignee}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {row.assignedAt ? dayjs(row.assignedAt).format('DD/MM/YYYY HH:mm') : ''}
            </div>
          </div>
        ) : (
          <Tag>Chưa phân công</Tag>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={b2bOnly ? 'Lấy hàng B2B' : 'Danh sách lấy hàng'}
        description={
          b2bOnly
            ? 'Vận hành → Xuất kho → Lấy hàng B2B'
            : 'Vận hành → Xuất kho → Lấy hàng: tạo DS, phân công, xác định vị trí.'
        }
        extra={
          <Space wrap>
            <Button
              className="btn-success"
              onClick={() => navigate('/operations/picking/create')}
            >
              Tạo danh sách lấy hàng
            </Button>
            <Button
              type="primary"
              onClick={() =>
                message.info(
                  selectedKeys.length
                    ? `Demo: phân công ${selectedKeys.length} danh sách`
                    : 'Chọn ít nhất 1 danh sách',
                )
              }
            >
              Phân công
            </Button>
            <Button type="primary" onClick={() => message.info('Demo: xác định vị trí lấy hàng')}>
              Xác định vị trí
            </Button>
            <Button danger onClick={() => message.info('Demo: gom danh sách lấy hàng')}>
              Gom DS lấy hàng
            </Button>
            <Button danger onClick={() => message.warning('Demo: hủy danh sách đã chọn')}>
              Hủy
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <Space wrap>
            <Space.Compact>
              <Select
                defaultValue="code"
                style={{ width: 200 }}
                options={[{ value: 'code', label: 'Mã danh sách lấy hàng' }]}
              />
              <Input
                allowClear
                placeholder="Tìm kiếm theo mã danh sách lấy hàng"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
              />
              <Button type="primary" icon={<SearchOutlined />}>
                Tìm
              </Button>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setAdvancedOpen((v) => !v)}
                title={advancedOpen ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao'}
              />
            </Space.Compact>
          </Space>
          {advancedOpen ? (
            <Space wrap>
              <RangePicker
                value={dateRange}
                onChange={(v) => setDateRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="DD/MM/YYYY"
              />
              <Select
                allowClear
                placeholder="Chọn trạng thái"
                style={{ width: 170 }}
                value={status}
                onChange={setStatus}
                options={Object.entries(pickListStatusLabel).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                allowClear
                placeholder="Chọn độ ưu tiên"
                style={{ width: 160 }}
                value={priority}
                onChange={setPriority}
                options={Object.entries(pickPriorityLabel).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select allowClear placeholder="Chọn đối tác" style={{ width: 160 }} />
              <Select allowClear placeholder="Chọn người tạo" style={{ width: 160 }} />
              <Select allowClear placeholder="Chọn nhân viên được phân công" style={{ width: 220 }} />
              <Checkbox
                checked={unassignedOnly}
                onChange={(e) => setUnassignedOnly(e.target.checked)}
              >
                Chưa phân công
              </Checkbox>
            </Space>
          ) : null}
        </div>

        <Table
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
          }}
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1600 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} danh sách` }}
        />
      </div>
    </div>
  )
}
