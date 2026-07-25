import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusOutlined } from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  createStocktakeSession,
  listStocktakeSessions,
  stocktakeKindLabel,
  stocktakePartnerOptions,
  stocktakeRequestTypeLabel,
  stocktakeStatusLabel,
  upsertStocktakeSession,
  type StocktakeKind,
  type StocktakeRequestType,
  type StocktakeSession,
  type StocktakeStatus,
} from '../data/stocktakeSessions'

const { RangePicker } = DatePicker

function fmtDt(v?: string | null, multiline = false) {
  if (!v) return ''
  const d = dayjs(v)
  if (!multiline) return d.format('DD/MM/YYYY HH:mm:ss')
  return (
    <div>
      <div>{d.format('DD/MM/YYYY')}</div>
      <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{d.format('HH:mm:ss')}</div>
    </div>
  )
}

export default function AdminStocktakeListPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listStocktakeSessions())
  const [createdDate, setCreatedDate] = useState<dayjs.Dayjs | null>(null)
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [requestType, setRequestType] = useState<StocktakeRequestType | undefined>()
  const [kind, setKind] = useState<StocktakeKind | undefined>()
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (createdDate) {
        if (!dayjs(row.createdAt).isSame(createdDate, 'day')) return false
      }
      if (range) {
        const start = row.startedAt ? dayjs(row.startedAt) : null
        const end = row.endedAt ? dayjs(row.endedAt) : null
        if (start && start.isBefore(range[0].startOf('day'))) return false
        if (end && end.isAfter(range[1].endOf('day'))) return false
      }
      if (requestType && row.requestType !== requestType) return false
      if (kind && row.kind !== kind) return false
      return true
    })
  }, [rows, createdDate, range, requestType, kind])

  const refresh = () => setRows([...listStocktakeSessions()])

  const cancelSession = (row: StocktakeSession) => {
    Modal.confirm({
      title: 'Hủy phiên kiểm kê',
      content: `Bạn có chắc muốn hủy phiên ${row.code}?`,
      okText: 'Hủy phiên',
      okButtonProps: { danger: true },
      cancelText: 'Đóng',
      onOk: () => {
        upsertStocktakeSession({ ...row, status: 'cancelled' })
        refresh()
        message.success(`Đã hủy ${row.code}`)
      },
    })
  }

  const saveCreate = async () => {
    try {
      const values = await form.validateFields()
      const created = createStocktakeSession({
        requestType: values.requestType,
        kind: values.kind === 'all' ? 'full' : values.kind,
        partnerName: values.requestType === 'partner' ? values.partnerName : '',
        note: values.note,
        skuCount: 10,
        productQty: 25,
        locationCount: 15,
      })
      setCreateOpen(false)
      form.resetFields()
      message.success(`Đã tạo phiên ${created.code}`)
      navigate(`/operations/stocktake/${created.id}`)
    } catch {
      /* validation */
    }
  }

  const requestTypeWatch = Form.useWatch('requestType', form)
  const kindWatch = Form.useWatch('kind', form)
  const partnerNameWatch = Form.useWatch('partnerName', form)
  const canSave =
    !!kindWatch &&
    !!requestTypeWatch &&
    (requestTypeWatch !== 'partner' || !!partnerNameWatch)

  const columns: TableColumnsType<StocktakeSession> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    {
      title: 'Mã kiểm kê',
      dataIndex: 'code',
      width: 190,
      render: (code: string, row) => (
        <Link to={`/operations/stocktake/${row.id}`} className="inbound-ir-link">
          {code}
        </Link>
      ),
    },
    {
      title: 'Ngày tạo phiên',
      dataIndex: 'createdAt',
      width: 120,
      render: (v: string) => fmtDt(v, true),
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestType',
      width: 130,
      render: (v: StocktakeRequestType) => stocktakeRequestTypeLabel[v],
    },
    {
      title: 'Loại',
      dataIndex: 'kind',
      width: 200,
      render: (v: StocktakeKind) => stocktakeKindLabel[v],
    },
    {
      title: 'Đối tác',
      dataIndex: 'partnerName',
      width: 220,
      ellipsis: true,
      render: (v?: string) => v || '',
    },
    { title: 'SKUs', dataIndex: 'skuCount', width: 80, align: 'right' },
    { title: 'SL Sản phẩm', dataIndex: 'productQty', width: 110, align: 'right' },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startedAt',
      width: 150,
      render: (v?: string | null) => fmtDt(v),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endedAt',
      width: 150,
      render: (v?: string | null) => fmtDt(v),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (v: StocktakeStatus) => stocktakeStatusLabel[v],
    },
    {
      title: 'Lệch',
      dataIndex: 'variancePct',
      width: 90,
      align: 'right',
      render: (v: number) => `${v} %`,
    },
    {
      title: '',
      width: 90,
      fixed: 'right',
      render: (_, row) =>
        row.status === 'counting' ? (
          <Button className="btn-warning" size="small" onClick={() => cancelSession(row)}>
            Hủy
          </Button>
        ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Danh sách phiên kiểm kê"
        extra={
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/operations/stocktake/create-sku-bin')}
            >
              Tạo phiên kiểm kê theo SKU, BIN
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/operations/stocktake/create-daily')}
            >
              Tạo phiên kiểm đếm thường nhật
            </Button>
            <Button
              className="btn-success"
              icon={<PlusOutlined />}
              onClick={() => {
                form.setFieldsValue({ kind: 'full', requestType: undefined, partnerName: undefined, note: '' })
                setCreateOpen(true)
              }}
            >
              Tạo phiên kiểm kê
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap>
            <DatePicker
              placeholder="Ngày tạo phiên"
              value={createdDate}
              onChange={setCreatedDate}
              format="DD/MM/YYYY"
            />
            <RangePicker
              placeholder={['Ngày bắt đầu', 'kết thúc']}
              value={range}
              onChange={(v) => setRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
            />
            <Select
              allowClear
              placeholder="Loại yêu cầu"
              style={{ width: 160 }}
              value={requestType}
              onChange={setRequestType}
              options={[
                { value: 'internal', label: 'Nội bộ' },
                { value: 'partner', label: 'Đối tác yêu cầu' },
              ]}
            />
            <Select
              allowClear
              placeholder="Loại"
              style={{ width: 200 }}
              value={kind}
              onChange={setKind}
              options={Object.entries(stocktakeKindLabel)
                .filter(([k]) => ['full', 'count_by_product', 'count_by_location'].includes(k))
                .map(([value, label]) => ({ value, label }))}
            />
            <Button type="primary" onClick={() => message.success(`Tìm thấy ${filtered.length} phiên`)}>
              Tìm kiếm
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1700 }}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </div>

      <Modal
        title="Tạo mới phiên kiểm kê"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        destroyOnHidden
        footer={
          <Space>
            <Button onClick={() => setCreateOpen(false)}>Thoát</Button>
            <Button type="primary" className="btn-success" disabled={!canSave} onClick={() => void saveCreate()}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="kind" label="Loại" rules={[{ required: true, message: 'Chọn loại' }]} initialValue="full">
            <Select
              options={[
                { value: 'full', label: 'Tất cả' },
                { value: 'count_by_product', label: 'Kiểm đếm theo sản phẩm' },
                { value: 'count_by_location', label: 'Kiểm đếm theo vị trí' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="requestType"
            label="Chọn đối tác"
            rules={[{ required: true, message: 'Chọn đối tác' }]}
          >
            <Select
              options={[
                { value: 'internal', label: 'Nội bộ' },
                { value: 'partner', label: 'Đối tác yêu cầu' },
              ]}
            />
          </Form.Item>
          {requestTypeWatch === 'partner' ? (
            <Form.Item
              name="partnerName"
              label="Đối tác"
              rules={[{ required: true, message: 'Chọn đối tác' }]}
            >
              <Select options={stocktakePartnerOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          ) : null}
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
