import { useMemo, useState, type Key } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckOutlined,
  ClearOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  SwapOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import {
  listWaybills,
  updateWaybillStatuses,
  waybillStatusColor,
  waybillStatusLabel,
  type Waybill,
  type WaybillStatus,
} from '../data/waybills'

export default function ClientWaybillListPage() {
  const navigate = useNavigate()
  const [, setTick] = useState(0)
  const rows = listWaybills()
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [query, setQuery] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<WaybillStatus>('ready')
  const [advForm] = Form.useForm()
  const [advFilters, setAdvFilters] = useState<{
    status?: WaybillStatus
    partnerCode?: string
    dateFrom?: string
    dateTo?: string
  }>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const hay = [
          row.code,
          row.partnerWaybillCode,
          row.recipientName,
          row.recipientPhone,
          row.contactName,
          row.contactPhone,
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (advFilters.status && row.status !== advFilters.status) return false
      if (advFilters.partnerCode && row.partnerCode !== advFilters.partnerCode) return false
      if (advFilters.dateFrom && row.createdAt.slice(0, 10) < advFilters.dateFrom) return false
      if (advFilters.dateTo && row.createdAt.slice(0, 10) > advFilters.dateTo) return false
      return true
    })
  }, [rows, query, advFilters])

  const columns: TableColumnsType<Waybill> = [
    {
      title: '#',
      width: 56,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 120,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Mã vận đơn',
      dataIndex: 'code',
      width: 170,
      render: (code: string, row) => (
        <Link to={`/client/operations/waybills/${row.id}`} className="inbound-ir-link">
          {code}
        </Link>
      ),
    },
    { title: 'Mã vận đơn đối tác', dataIndex: 'partnerWaybillCode', width: 150 },
    { title: 'Mã đối tác', dataIndex: 'partnerCode', width: 100 },
    { title: 'Mã địa chỉ lấy', dataIndex: 'pickupAddressCode', width: 130 },
    {
      title: 'Người liên hệ',
      width: 160,
      render: (_, row) => `${row.contactName} ${row.contactPhone}`,
    },
    {
      title: 'Người nhận',
      width: 160,
      render: (_, row) => `${row.recipientName} ${row.recipientPhone}`,
    },
    { title: 'Địa chỉ nhận', dataIndex: 'recipientAddress', width: 280, ellipsis: true },
    {
      title: 'COD',
      dataIndex: 'cod',
      width: 100,
      align: 'right',
      render: (v: number | null) => (v == null ? '—' : v.toLocaleString('vi-VN')),
    },
    {
      title: 'Giá trị đơn hàng',
      dataIndex: 'orderValue',
      width: 130,
      align: 'right',
      render: (v: number | null) => (v == null ? '—' : v.toLocaleString('vi-VN')),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (v: WaybillStatus) => (
        <Tag color={waybillStatusColor[v]}>{waybillStatusLabel[v]}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          <IconAction
            title="Xem chi tiết"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/client/operations/waybills/${row.id}`)}
          />
          <IconAction
            title="In nhãn vận chuyển"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => message.success(`Đã lấy nhãn vận chuyển cho ${row.code} (demo)`)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Danh sách vận đơn"
        description="Tạo kiện hàng và lấy nhãn vận chuyển từ ĐVVC — chuyển hàng giữa cửa hàng hoặc gửi đến khách hàng / người mua."
        extra={
          <Space wrap>
            <IconAction
              title="Import vận đơn"
              className="btn-success"
              icon={<UploadOutlined />}
              onClick={() => message.info('Demo: import nhiều vận đơn từ Excel/CSV')}
            />
            <IconAction
              title="Chuyển trạng thái"
              className="btn-success"
              icon={<SwapOutlined />}
              disabled={selectedKeys.length === 0}
              onClick={() => setStatusOpen(true)}
            />
            <IconAction
              title="Xuất file"
              className="btn-success"
              icon={<DownloadOutlined />}
              onClick={() =>
                message.success(
                  `Đã xuất ${selectedKeys.length || filtered.length} vận đơn ra Excel (demo)`,
                )
              }
            />
            <IconAction
              title="Tạo vận đơn"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/client/operations/waybills/create')}
            />
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space.Compact style={{ maxWidth: '100%' }}>
              <Input
                allowClear
                style={{ width: 480, maxWidth: '100%' }}
                placeholder="Mã vận đơn, mã vận đơn đối tác, tên người nhận, số điện thoại người nhận"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <IconAction
                title="Bộ lọc nâng cao"
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setAdvancedOpen(true)}
              />
            </Space.Compact>
            <Typography.Text type="secondary">
              Tổng số vận đơn: {filtered.length}
            </Typography.Text>
          </Space>
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
          pagination={{ pageSize: 10, showTotal: (t) => `${t} vận đơn` }}
        />
      </div>

      <Drawer
        title="Bộ lọc dữ liệu"
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        width={380}
        extra={
          <Space>
            <IconAction
              title="Đặt lại"
              icon={<ClearOutlined />}
              onClick={() => {
                advForm.resetFields()
                setAdvFilters({})
              }}
            />
            <IconAction
              title="Áp dụng"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                const values = advForm.getFieldsValue()
                setAdvFilters({
                  status: values.status,
                  partnerCode: values.partnerCode,
                })
                setAdvancedOpen(false)
                message.success('Đã áp dụng bộ lọc')
              }}
            />
          </Space>
        }
      >
        <Form form={advForm} layout="vertical">
          <Form.Item name="status" label="Trạng thái">
            <Select
              allowClear
              placeholder="Tất cả"
              options={Object.entries(waybillStatusLabel).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item name="partnerCode" label="Mã đối tác">
            <Select
              allowClear
              placeholder="Tất cả"
              options={[
                { value: 'TGDD', label: 'TGDD' },
                { value: 'AVO', label: 'AVO' },
                { value: 'EC', label: 'EC' },
                { value: 'KHACH', label: 'KHACH' },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Chuyển trạng thái vận đơn"
        open={statusOpen}
        onCancel={() => setStatusOpen(false)}
        onOk={() => {
          updateWaybillStatuses(selectedKeys.map(String), nextStatus)
          setTick((n) => n + 1)
          setSelectedKeys([])
          setStatusOpen(false)
          message.success(
            `Đã chuyển ${selectedKeys.length} vận đơn sang “${waybillStatusLabel[nextStatus]}”`,
          )
        }}
        okText="Cập nhật"
      >
        <Typography.Paragraph>
          Đã chọn <strong>{selectedKeys.length}</strong> vận đơn.
        </Typography.Paragraph>
        <Select
          style={{ width: '100%' }}
          value={nextStatus}
          onChange={setNextStatus}
          options={Object.entries(waybillStatusLabel).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </Modal>
    </div>
  )
}
