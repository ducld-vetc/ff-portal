import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DisconnectOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
  type TableColumnsType,
} from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import {
  connectableChannels,
  salesChannelOptions,
  storeRows as seedStores,
  storeStatusColor,
  storeStatusLabel,
  type SalesStore,
  type StoreStatus,
} from '../data/stores'
import { usePortal } from '../portal/PortalContext'

type StoreTab = 'all' | 'active' | 'expired_connection' | 'error_orders' | 'disconnected'

const tabs: { key: StoreTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Hoạt động' },
  { key: 'expired_connection', label: 'Hết hạn - lỗi kết nối' },
  { key: 'error_orders', label: 'Đơn lỗi' },
  { key: 'disconnected', label: 'Ngắt kết nối' },
]

export default function StoresPage() {
  const navigate = useNavigate()
  const { isCustomer, customerScope } = usePortal()
  const [rows, setRows] = useState<SalesStore[]>(() => [...seedStores])
  const [partner, setPartner] = useState<string>('all')
  const [channel, setChannel] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<StoreTab>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [form] = Form.useForm()

  const partnerOptions = useMemo(
    () => [
      { value: 'all', label: 'Tất cả đối tác' },
      ...Array.from(
        new Map(
          rows.map((item) => [
            item.partnerName,
            { value: item.partnerName, label: item.partnerName },
          ]),
        ).values(),
      ),
    ],
    [rows],
  )

  const scopedRows = useMemo(() => {
    if (!isCustomer) return rows
    return rows.filter((row) => row.partnerName === customerScope.partnerName)
  }, [rows, isCustomer, customerScope.partnerName])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scopedRows.filter((row) => {
      if (!isCustomer && partner !== 'all' && row.partnerName !== partner) return false
      if (channel !== 'all' && row.channel.toLowerCase() !== channel.toLowerCase()) return false
      if (tab !== 'all' && row.status !== tab) return false
      if (
        q &&
        !row.shopCode.toLowerCase().includes(q) &&
        !row.shopName.toLowerCase().includes(q) &&
        !row.shopId.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [scopedRows, partner, channel, query, tab, isCustomer])

  const detailBase = isCustomer ? '/client/stores' : '/customers/stores'

  const disconnectStore = (row: SalesStore) => {
    Modal.confirm({
      title: `Ngắt kết nối cửa hàng ${row.shopCode}?`,
      content:
        'OMS sẽ ngừng đồng bộ đơn hàng / tồn kho với kênh bán hàng. Bạn có thể kết nối lại sau.',
      okText: 'Ngắt kết nối',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  status: 'disconnected',
                  syncOrders: false,
                  syncInventory: false,
                  daysRemaining: null,
                }
              : item,
          ),
        )
        message.success(`Đã ngắt kết nối ${row.shopCode}`)
      },
    })
  }

  const columns: TableColumnsType<SalesStore> = [
    ...(!isCustomer
      ? ([
          { title: 'Đối tác', dataIndex: 'partnerName', width: 230 },
        ] as TableColumnsType<SalesStore>)
      : []),
    { title: 'Kênh bán hàng', dataIndex: 'channel', width: 110 },
    { title: 'ID cửa hàng', dataIndex: 'shopId', width: 120 },
    {
      title: 'Mã cửa hàng',
      dataIndex: 'shopCode',
      width: 120,
      render: (value: string, row) => (
        <button
          type="button"
          className="link-btn"
          onClick={() => navigate(`${detailBase}/${row.id}`)}
        >
          {value}
        </button>
      ),
    },
    { title: 'Tên cửa hàng', dataIndex: 'shopName', width: 180 },
    {
      title: 'Kết nối',
      dataIndex: 'status',
      width: 130,
      render: (status: StoreStatus) => (
        <Tag color={storeStatusColor[status]} bordered={false}>
          {storeStatusLabel[status]}
        </Tag>
      ),
    },
    {
      title: 'Thời gian kết nối',
      dataIndex: 'connectedAt',
      width: 140,
      render: (value: string) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: 'Thời gian hết hạn',
      dataIndex: 'expiredAt',
      width: 140,
      render: (value: string | null) =>
        value ? new Date(value).toLocaleString('vi-VN') : 'Không giới hạn',
    },
    {
      title: 'Ngày còn lại',
      dataIndex: 'daysRemaining',
      width: 100,
      align: 'right',
      render: (value: number | null) =>
        value === null ? 'Không giới hạn' : value.toLocaleString('vi-VN'),
    },
    {
      title: 'Đơn lỗi',
      dataIndex: 'errorOrders',
      width: 90,
      align: 'right',
      render: (value: number) => (
        <span style={{ color: value ? '#f59e0b' : '#2563eb', fontWeight: 600 }}>{value}</span>
      ),
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, row) => (
        <Space size={6}>
          <IconAction
            title="Xem cửa hàng"
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`${detailBase}/${row.id}`)}
          />
          <IconAction
            title="Ngắt kết nối"
            danger
            size="small"
            icon={<DisconnectOutlined />}
            disabled={row.status === 'disconnected'}
            onClick={() => disconnectStore(row)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Danh sách cửa hàng"
        description={
          isCustomer
            ? 'Quản lý cửa hàng kênh bán hàng của bạn: thêm, xem chi tiết và ngắt kết nối.'
            : 'Theo dõi trạng thái kết nối shop theo đối tác và kênh bán hàng.'
        }
        extra={
          <IconAction
            title="Thêm cửa hàng"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddOpen(true)}
          />
        }
      />

      <div className="content-card">
        <div className="table-toolbar table-toolbar-left">
          {!isCustomer ? (
            <Select
              value={partner}
              onChange={setPartner}
              options={partnerOptions}
              style={{ minWidth: 240 }}
            />
          ) : null}
          <Select
            value={channel}
            onChange={setChannel}
            options={salesChannelOptions}
            style={{ minWidth: 200 }}
          />
          <Space.Compact style={{ minWidth: 360 }}>
            <Input
              allowClear
              placeholder="Tìm kiếm mã cửa hàng, tên cửa hàng, ID cửa hàng"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <IconAction title="Tìm kiếm" type="primary" icon={<SearchOutlined />} />
          </Space.Compact>
        </div>

        <div className="store-tabs" role="tablist" aria-label="Store status tabs">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`store-tab ${tab === item.key ? 'is-active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: isCustomer ? 1300 : 1500 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      <Modal
        open={addOpen}
        title={<span className="modal-title-blue">Thêm cửa hàng</span>}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
        okText="Kết nối & lưu"
        cancelText="Thoát"
        destroyOnHidden
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ channel: 'Shopee' }}
          onFinish={(values) => {
            const prefixMap: Record<string, string> = {
              Shopee: 'SHO',
              TikTok: 'TIK',
              Lazada: 'LAZ',
              Tiki: 'TIKI',
              Sendo: 'SEN',
              Facebook: 'FB',
              Instagram: 'IG',
              Website: 'WEB',
            }
            const prefix = prefixMap[values.channel] || 'SHP'
            const code = `${prefix}SHP${Math.floor(100 + Math.random() * 900)}`
            const shopId = String(Date.now()).slice(-9)
            const next: SalesStore = {
              id: `store-${Date.now()}`,
              partnerName: isCustomer
                ? customerScope.partnerName
                : values.partnerName || customerScope.partnerName,
              channel: values.channel,
              shopId,
              shopCode: code,
              shopName: values.shopName,
              status: 'active',
              connectedAt: new Date().toISOString(),
              expiredAt: new Date(Date.now() + 365 * 86400000).toISOString(),
              daysRemaining: 365,
              errorOrders: 0,
              syncProducts: true,
              syncOrders: true,
              syncInventory: false,
              lastSyncProductsAt: new Date().toISOString(),
              lastSyncOrdersAt: null,
              lastSyncInventoryAt: null,
              warehouseLinked: false,
            }
            setRows((prev) => [next, ...prev])
            setAddOpen(false)
            form.resetFields()
            message.success(
              `Đã kết nối cửa hàng ${code} trên ${values.channel}. Tiếp tục liên kết kho & sản phẩm trong chi tiết.`,
            )
            navigate(`${detailBase}/${next.id}`)
          }}
        >
          <Form.Item
            name="channel"
            label="Kênh bán hàng"
            rules={[{ required: true, message: 'Chọn kênh bán hàng' }]}
            extra="Tìm và chọn kênh (Shopee, TikTok, Lazada, Facebook…), rồi đăng nhập cửa hàng trên sàn."
          >
            <Select
              showSearch
              placeholder="Tìm kênh bán hàng…"
              optionFilterProp="label"
              options={connectableChannels.map((item) => ({
                value: item.value,
                label: item.label,
                group: item.group,
              }))}
              optionRender={(option) => {
                const meta = connectableChannels.find((c) => c.value === option.value)
                return (
                  <Space>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: meta?.color || '#94a3b8',
                        display: 'inline-block',
                      }}
                    />
                    <span>{meta?.label}</span>
                    <Tag style={{ marginInlineStart: 'auto' }}>{meta?.group}</Tag>
                  </Space>
                )
              }}
            />
          </Form.Item>
          {!isCustomer ? (
            <Form.Item
              name="partnerName"
              label="Đối tác"
              rules={[{ required: true, message: 'Chọn đối tác' }]}
            >
              <Select
                options={partnerOptions.filter((p) => p.value !== 'all')}
                placeholder="Chọn đối tác"
              />
            </Form.Item>
          ) : null}
          <Form.Item
            name="shopName"
            label="Tên cửa hàng"
            rules={[{ required: true, message: 'Nhập tên cửa hàng' }]}
          >
            <Input placeholder="Tên cửa hàng trên kênh bán hàng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
