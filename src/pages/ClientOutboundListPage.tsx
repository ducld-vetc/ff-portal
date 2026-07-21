import { useMemo, useState, type Key } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CopyOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  formatAddress,
  listOutboundRequests,
  outboundSearchFields,
  outboundStatusColor,
  outboundStatusLabel,
  outboundWarehouseOptions,
  type OutboundRequest,
  type OutboundSearchField,
  type OutboundStatus,
} from '../data/outboundRequests'

const { RangePicker } = DatePicker

export default function ClientOutboundListPage() {
  const navigate = useNavigate()
  const rows = listOutboundRequests()
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [searchField, setSearchField] = useState<OutboundSearchField>('partnerOrCode')
  const [query, setQuery] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advForm] = Form.useForm()
  const [advFilters, setAdvFilters] = useState<{
    status?: OutboundStatus
    warehouseCode?: string
    channel?: string
    buyerName?: string
    dateFrom?: string
    dateTo?: string
  }>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const hay = String(row[searchField] ?? '').toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (advFilters.status && row.status !== advFilters.status) return false
      if (advFilters.warehouseCode && row.warehouseCode !== advFilters.warehouseCode) return false
      if (advFilters.channel && row.channel !== advFilters.channel) return false
      if (advFilters.buyerName) {
        if (!row.buyerName.toLowerCase().includes(advFilters.buyerName.toLowerCase())) return false
      }
      if (advFilters.dateFrom && row.createdAt.slice(0, 10) < advFilters.dateFrom) return false
      if (advFilters.dateTo && row.createdAt.slice(0, 10) > advFilters.dateTo) return false
      return true
    })
  }, [rows, query, searchField, advFilters])

  const fieldLabel =
    outboundSearchFields.find((f) => f.value === searchField)?.label ?? 'Mã OR đối tác'

  const columns: TableColumnsType<OutboundRequest> = [
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 150,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (v: OutboundRequest['status']) => (
        <Tag color={outboundStatusColor[v]}>{outboundStatusLabel[v]}</Tag>
      ),
    },
    {
      title: 'Mã OR',
      dataIndex: 'code',
      width: 170,
      render: (code: string, row) => (
        <Link to={`/client/operations/outbound/${row.id}`} className="inbound-ir-link">
          {code}
        </Link>
      ),
    },
    { title: 'Mã OR đối tác', dataIndex: 'partnerOrCode', width: 140 },
    { title: 'Kho xuất', dataIndex: 'warehouseName', width: 180, ellipsis: true },
    { title: 'Người mua', dataIndex: 'buyerName', width: 140, ellipsis: true },
    {
      title: 'Địa chỉ',
      width: 240,
      ellipsis: true,
      render: (_, row) => formatAddress(row),
    },
    {
      title: 'COD',
      dataIndex: 'cod',
      width: 110,
      align: 'right',
      render: (v: number) => v.toLocaleString('vi-VN'),
    },
    { title: 'Kênh bán hàng', dataIndex: 'channel', width: 120, render: (v?: string) => v || '—' },
    {
      title: 'Ngày phát sinh',
      dataIndex: 'occurredAt',
      width: 150,
      render: (v?: string | null) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'),
    },
    { title: 'Cửa hàng', dataIndex: 'storeName', width: 180, ellipsis: true, render: (v?: string) => v || '—' },
    { title: 'SLA xử lý KBH', dataIndex: 'slaChannel', width: 120, render: (v?: string) => v || '—' },
    {
      title: '',
      key: 'actions',
      width: 56,
      fixed: 'right',
      render: (_, row) => (
        <Tooltip title="Sao chép tạo nhanh yêu cầu xuất kho">
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => navigate(`/client/operations/outbound/create?copyFrom=${row.id}`)}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Danh sách yêu cầu xuất kho"
        description="Vận hành → Xuất kho: tìm kiếm, xem chi tiết, tạo / import / xuất file, hoặc sao chép yêu cầu có sẵn."
        extra={
          <Space wrap>
            <Button
              className="btn-success"
              icon={<UploadOutlined />}
              onClick={() => message.info('Demo: import yêu cầu xuất kho từ Excel/CSV')}
            >
              Import yêu cầu xuất kho
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/client/operations/outbound/create')}
            >
              Tạo xuất kho
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'detail',
                    label: 'Xuất file chi tiết',
                    icon: <FileTextOutlined />,
                    onClick: () =>
                      message.success(
                        `Đã xuất file chi tiết ${selectedKeys.length || filtered.length} yêu cầu (demo)`,
                      ),
                  },
                  {
                    key: 'list',
                    label: 'Xuất file',
                    icon: <DownloadOutlined />,
                    onClick: () =>
                      message.success(
                        `Đã xuất ${selectedKeys.length || filtered.length} yêu cầu xuất kho ra Excel (demo)`,
                      ),
                  },
                ],
              }}
            >
              <Button className="btn-success" icon={<DownloadOutlined />}>
                Xuất Excel
              </Button>
            </Dropdown>
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space.Compact className="inbound-search-bar">
            <Select
              value={searchField}
              style={{ width: 170 }}
              options={outboundSearchFields.map((f) => ({ value: f.value, label: f.label }))}
              onChange={setSearchField}
            />
            <Input
              allowClear
              placeholder={`Tìm kiếm theo ${fieldLabel}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 280 }}
            />
            <Tooltip title="Tìm kiếm nâng cao">
              <Button type="primary" icon={<FilterOutlined />} onClick={() => setAdvancedOpen(true)} />
            </Tooltip>
          </Space.Compact>
          {Object.keys(advFilters).length > 0 ? (
            <Button
              type="link"
              onClick={() => {
                setAdvFilters({})
                advForm.resetFields()
              }}
            >
              Xóa bộ lọc nâng cao
            </Button>
          ) : null}
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1900 }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
          }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} yêu cầu` }}
        />
      </div>

      <Drawer
        title="Tìm kiếm nâng cao"
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        width={400}
        extra={
          <Space>
            <Button
              onClick={() => {
                advForm.resetFields()
                setAdvFilters({})
              }}
            >
              Đặt lại
            </Button>
            <Button
              type="primary"
              onClick={() => {
                const values = advForm.getFieldsValue()
                const range = values.createdRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined
                setAdvFilters({
                  status: values.status,
                  warehouseCode: values.warehouseCode,
                  channel: values.channel,
                  buyerName: values.buyerName?.trim() || undefined,
                  dateFrom: range?.[0]?.format('YYYY-MM-DD'),
                  dateTo: range?.[1]?.format('YYYY-MM-DD'),
                })
                setAdvancedOpen(false)
                message.success('Đã áp dụng bộ lọc nâng cao')
              }}
            >
              Áp dụng
            </Button>
          </Space>
        }
      >
        <Form form={advForm} layout="vertical">
          <Form.Item name="status" label="Trạng thái">
            <Select
              allowClear
              placeholder="Tất cả"
              options={Object.entries(outboundStatusLabel).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item name="warehouseCode" label="Kho xuất">
            <Select allowClear placeholder="Tất cả" options={outboundWarehouseOptions} />
          </Form.Item>
          <Form.Item name="channel" label="Kênh bán hàng">
            <Select
              allowClear
              placeholder="Tất cả"
              options={[
                { value: 'Shopee', label: 'Shopee' },
                { value: 'TikTok', label: 'TikTok' },
                { value: 'Lazada', label: 'Lazada' },
                { value: 'Website', label: 'Website' },
              ]}
            />
          </Form.Item>
          <Form.Item name="buyerName" label="Người mua">
            <Input allowClear placeholder="Nhập người mua" />
          </Form.Item>
          <Form.Item name="createdRange" label="Ngày tạo">
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Kết hợp với ô tìm kiếm nhanh phía trên theo trường đã chọn.
          </Typography.Paragraph>
        </Form>
      </Drawer>
    </div>
  )
}
