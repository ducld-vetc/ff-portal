import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CopyOutlined,
  DownloadOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Drawer,
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
  goodsConditionColor,
  goodsConditionLabel,
  inboundSearchFields,
  inboundStatusColor,
  inboundStatusLabel,
  inboundTypeLabel,
  inboundWarehouseOptions,
  listInboundRequests,
  type InboundRequest,
  type InboundSearchField,
  type InboundStatus,
} from '../data/inboundRequests'

const { RangePicker } = DatePicker

export default function ClientInboundListPage() {
  const navigate = useNavigate()
  const rows = listInboundRequests()
  const [searchField, setSearchField] = useState<InboundSearchField>('partnerIrCode')
  const [query, setQuery] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advForm] = Form.useForm()
  const [advFilters, setAdvFilters] = useState<{
    status?: InboundStatus
    warehouseCode?: string
    supplier?: string
    type?: string
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
      if (advFilters.supplier) {
        if (!row.supplier.toLowerCase().includes(advFilters.supplier.toLowerCase())) return false
      }
      if (advFilters.type && row.type !== advFilters.type) return false
      if (advFilters.dateFrom && row.expectedAt < advFilters.dateFrom) return false
      if (advFilters.dateTo && row.expectedAt > advFilters.dateTo) return false
      return true
    })
  }, [rows, query, searchField, advFilters])

  const copyRequest = (row: InboundRequest) => {
    navigate(`/client/operations/inbound/create?copyFrom=${row.id}`)
  }

  const columns: TableColumnsType<InboundRequest> = [
    {
      title: '#',
      width: 56,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã IR',
      dataIndex: 'code',
      width: 150,
      render: (code: string, row) => (
        <Link to={`/client/operations/inbound/${row.id}`} className="inbound-ir-link">
          {code}
        </Link>
      ),
    },
    { title: 'Mã IR đối tác', dataIndex: 'partnerIrCode', width: 130 },
    { title: 'Quốc gia', dataIndex: 'country', width: 80 },
    { title: 'Kho nhập', dataIndex: 'warehouseName', width: 200, ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (v: InboundRequest['status']) => (
        <Tag color={inboundStatusColor[v]}>{inboundStatusLabel[v]}</Tag>
      ),
    },
    { title: 'SL SKU', dataIndex: 'skuCount', width: 80, align: 'right' },
    { title: 'SL sản phẩm', dataIndex: 'productQty', width: 110, align: 'right' },
    { title: 'SL thực nhận', dataIndex: 'receivedQty', width: 110, align: 'right' },
    {
      title: 'TTHH',
      dataIndex: 'goodsCondition',
      width: 100,
      render: (v: InboundRequest['goodsCondition']) => (
        <Tag color={goodsConditionColor[v]}>{goodsConditionLabel[v]}</Tag>
      ),
    },
    { title: 'Nhà cung cấp', dataIndex: 'supplier', width: 140, ellipsis: true },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 120,
      render: (v: InboundRequest['type']) => inboundTypeLabel[v],
    },
    {
      title: 'Ngày dự kiến đến',
      dataIndex: 'expectedAt',
      width: 140,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày nhận hàng thực tế',
      dataIndex: 'receivedAt',
      width: 160,
      render: (v: string | null) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 140,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      fixed: 'right',
      render: (_, row) => (
        <Tooltip title="Sao chép tạo nhanh yêu cầu nhập kho">
          <Button
            type="primary"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyRequest(row)}
          />
        </Tooltip>
      ),
    },
  ]

  const fieldLabel =
    inboundSearchFields.find((f) => f.value === searchField)?.label ?? 'Mã IR đối tác'

  return (
    <div>
      <PageHeader
        title="Danh sách yêu cầu nhập kho"
        description="Vận hành → Nhập kho: tìm kiếm, xem chi tiết, tạo / import / xuất Excel, hoặc sao chép yêu cầu có sẵn."
        extra={
          <Space wrap>
            <Button
              className="btn-success"
              icon={<UploadOutlined />}
              onClick={() =>
                message.info('Demo: chọn file Excel/CSV để import yêu cầu nhập kho')
              }
            >
              Import yêu cầu nhập kho
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/client/operations/inbound/create')}
            >
              Tạo nhập kho
            </Button>
            <Button
              className="btn-success"
              icon={<DownloadOutlined />}
              onClick={() =>
                message.success(`Đã xuất ${filtered.length} yêu cầu nhập kho ra Excel (demo)`)
              }
            >
              Xuất Excel
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space.Compact className="inbound-search-bar">
            <Select
              value={searchField}
              style={{ width: 170 }}
              options={inboundSearchFields.map((f) => ({ value: f.value, label: f.label }))}
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
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setAdvancedOpen(true)}
              />
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
          scroll={{ x: 1800 }}
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
                const range = values.expectedRange as
                  | [dayjs.Dayjs, dayjs.Dayjs]
                  | undefined
                setAdvFilters({
                  status: values.status,
                  warehouseCode: values.warehouseCode,
                  supplier: values.supplier?.trim() || undefined,
                  type: values.type,
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
              options={Object.entries(inboundStatusLabel).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item name="warehouseCode" label="Kho nhập">
            <Select allowClear placeholder="Tất cả" options={inboundWarehouseOptions} />
          </Form.Item>
          <Form.Item name="type" label="Loại nhập kho">
            <Select
              allowClear
              placeholder="Tất cả"
              options={Object.entries(inboundTypeLabel).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item name="supplier" label="Nhà cung cấp">
            <Input allowClear placeholder="Nhập nhà cung cấp" />
          </Form.Item>
          <Form.Item name="expectedRange" label="Ngày dự kiến đến">
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
