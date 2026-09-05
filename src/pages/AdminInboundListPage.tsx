import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DownloadOutlined, FilterOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
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
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { InboundImportModal } from '../components/InboundImportModal'
import { PageHeader } from '../components/PageHeader'
import { downloadInboundImportTemplate } from '../data/inboundImport'
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

export default function AdminInboundListPage() {
  const navigate = useNavigate()
  const [listVersion, setListVersion] = useState(0)
  const rows = useMemo(() => listInboundRequests(), [listVersion])
  const [searchField, setSearchField] = useState<InboundSearchField>('partnerIrCode')
  const [query, setQuery] = useState('')
  const [createdRange, setCreatedRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ])
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [advForm] = Form.useForm()
  const [advFilters, setAdvFilters] = useState<{
    status?: InboundStatus
    warehouseCode?: string
    type?: string
  }>({})

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
      if (advFilters.status && row.status !== advFilters.status) return false
      if (advFilters.warehouseCode && row.warehouseCode !== advFilters.warehouseCode) return false
      if (advFilters.type && row.type !== advFilters.type) return false
      return true
    })
  }, [rows, query, searchField, createdRange, advFilters])

  const fieldLabel =
    inboundSearchFields.find((f) => f.value === searchField)?.label ?? 'Mã IR đối tác'

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
        <Link to={`/operations/inbound/${row.id}`} className="inbound-ir-link">
          {code}
        </Link>
      ),
    },
    {
      title: 'Đối tác',
      width: 220,
      ellipsis: true,
      render: (_, row) => row.partnerName || row.ownerName,
    },
    { title: 'Mã IR đối tác', dataIndex: 'partnerIrCode', width: 130 },
    { title: 'SL SKU', dataIndex: 'skuCount', width: 80, align: 'right' },
    { title: 'SL Item', dataIndex: 'productQty', width: 80, align: 'right' },
    { title: 'SL thực nhận', dataIndex: 'receivedQty', width: 110, align: 'right' },
    {
      title: 'SL lưu kho',
      width: 100,
      align: 'right',
      render: (_, row) => row.storedQty ?? 0,
    },
    { title: 'Nhà cung cấp', dataIndex: 'supplier', width: 140, ellipsis: true },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 110,
      render: (v: InboundRequest['type']) => inboundTypeLabel[v],
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (v: InboundRequest['status']) => (
        <Tag color={inboundStatusColor[v]}>{inboundStatusLabel[v]}</Tag>
      ),
    },
    {
      title: 'Tình trạng hàng hóa',
      dataIndex: 'goodsCondition',
      width: 140,
      render: (v: InboundRequest['goodsCondition']) => (
        <Tag color={goodsConditionColor[v]}>{goodsConditionLabel[v]}</Tag>
      ),
    },
    {
      title: 'Ngày dự kiến gửi hàng',
      dataIndex: 'expectedAt',
      width: 160,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Check In lần cuối',
      dataIndex: 'lastCheckInAt',
      width: 160,
      render: (v: string | null | undefined) =>
        v ? dayjs(v).format('DD/MM/YYYY HH:mm:ss') : '—',
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_, row) =>
        row.status === 'processing' || row.status === 'new' ? (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/operations/inbound/${row.id}`)}
          >
            Check in
          </Button>
        ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Yêu cầu nhập kho"
        description="Vận hành → Nhập kho: tiếp nhận, check-in và hoàn thành phiếu nhập kho."
        extra={
          <Space wrap>
            <Button icon={<DownloadOutlined />} onClick={downloadInboundImportTemplate}>
              Tải mẫu import
            </Button>
            <Button
              className="btn-success"
              icon={<UploadOutlined />}
              onClick={() => setImportOpen(true)}
            >
              Import phiếu
            </Button>
            <Button type="primary" onClick={() => navigate('/operations/inbound/return')}>
              Tạo trả hàng
            </Button>
            <Button
              className="btn-success"
              onClick={() => message.success(`Đã xuất ${filtered.length} yêu cầu (demo)`)}
            >
              Xuất Excel
            </Button>
            <Button type="primary" onClick={() => message.success('Đã xuất file chi tiết (demo)')}>
              Xuất file chi tiết
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap className="table-toolbar-left">
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
                style={{ width: 260 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => message.success(`Tìm thấy ${filtered.length} kết quả`)}
              >
                Tìm
              </Button>
              <Button type="primary" icon={<FilterOutlined />} onClick={() => setAdvancedOpen(true)}>
                Bộ lọc
              </Button>
            </Space.Compact>
            <Select
              defaultValue="createdAt"
              style={{ width: 130 }}
              options={[{ value: 'createdAt', label: 'Ngày tạo' }]}
            />
            <RangePicker
              value={createdRange}
              onChange={(v) => setCreatedRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
            />
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 2000 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} yêu cầu` }}
        />
      </div>

      <InboundImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => {
          setListVersion((v) => v + 1)
          setCreatedRange([dayjs().subtract(30, 'day'), dayjs()])
        }}
      />

      <Drawer
        title="Bộ lọc nâng cao"
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
                setAdvFilters({
                  status: values.status,
                  warehouseCode: values.warehouseCode,
                  type: values.type,
                })
                setAdvancedOpen(false)
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
          <Form.Item name="type" label="Loại">
            <Select
              allowClear
              placeholder="Tất cả"
              options={Object.entries(inboundTypeLabel).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Kết hợp với ô tìm kiếm và khoảng ngày tạo phía trên.
          </Typography.Paragraph>
        </Form>
      </Drawer>
    </div>
  )
}
