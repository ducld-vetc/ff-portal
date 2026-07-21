import { useMemo, useState } from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
  type TableColumnsType,
} from 'antd'
import { PageHeader } from '../components/PageHeader'
import CarrierAccountFormModal from '../components/CarrierAccountFormModal'
import { carrierCatalog } from '../data/carrierAccountFields'
import {
  accountTypeLabel,
  carrierAccounts as seedAccounts,
  type CarrierAccount,
} from '../data/shipping'
import { warehouses } from '../data/mock'
import { usePortal } from '../portal/PortalContext'

export default function CarrierAccountsPage() {
  const { isCustomer, customerScope } = usePortal()
  const [rows, setRows] = useState<CarrierAccount[]>(() => [...seedAccounts])
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [carrierFilter, setCarrierFilter] = useState<string | undefined>()
  const [partnerFilter, setPartnerFilter] = useState<string | undefined>()
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CarrierAccount | null>(null)

  const partnerOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const row of rows) map.set(row.partnerCode, row.partnerName)
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [rows])

  const warehouseOptions = useMemo(() => {
    const fromRows = rows
      .filter((r) => r.warehouseCode && r.warehouseName)
      .map((r) => ({ value: r.warehouseCode!, label: r.warehouseName! }))
    const fromWarehouses = warehouses.map((w) => ({
      value: w.code,
      label: `${w.code} - ${w.name}`,
    }))
    const map = new Map<string, string>()
    for (const item of [...fromWarehouses, ...fromRows]) map.set(item.value, item.label)
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [rows])

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return rows.filter((row) => {
      if (typeFilter && row.type !== typeFilter) return false
      if (carrierFilter && row.carrierCode !== carrierFilter) return false
      if (!isCustomer && partnerFilter && row.partnerCode !== partnerFilter) return false
      if (warehouseFilter && row.warehouseCode !== warehouseFilter) return false
      if (q && !row.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [rows, appliedQuery, typeFilter, carrierFilter, partnerFilter, warehouseFilter, isCustomer])

  const columns: TableColumnsType<CarrierAccount> = [
    { title: '#', width: 56, render: (_, __, index) => index + 1 },
    { title: 'Tên tài khoản', dataIndex: 'name', width: 150 },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 200,
      render: (type: CarrierAccount['type']) => accountTypeLabel[type],
    },
    {
      title: 'ĐVVC',
      dataIndex: 'carrierLabel',
      width: 220,
      render: (label: string) => <a className="link-copy">{label}</a>,
    },
    ...(!isCustomer
      ? ([{ title: 'Đối tác gửi hàng', dataIndex: 'partnerName', width: 260 }] as TableColumnsType<CarrierAccount>)
      : []),
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      width: 220,
      render: (value?: string) => value || '—',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 120,
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: CarrierAccount['status']) =>
        status === 'active' ? <Tag color="success">Hoạt động</Tag> : <Tag>Không hoạt động</Tag>,
    },
    {
      title: 'Kết nối',
      dataIndex: 'connection',
      width: 110,
      render: (connection: CarrierAccount['connection']) =>
        connection === 'connected' ? (
          <Tag color="success">Kết nối</Tag>
        ) : (
          <Tag color="default">Ngắt</Tag>
        ),
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, row) => (
        <Space size={6}>
          <Tooltip title={row.connection === 'connected' ? 'Ngắt kết nối' : 'Kết nối lại'}>
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={() => {
                setRows((prev) =>
                  prev.map((item) =>
                    item.id === row.id
                      ? {
                          ...item,
                          connection:
                            item.connection === 'connected' ? 'disconnected' : 'connected',
                        }
                      : item,
                  ),
                )
              }}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(row)
                setOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              size="small"
              danger
              style={{ background: '#fa8c16', borderColor: '#fa8c16', color: '#fff' }}
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: `Xóa tài khoản ${row.name}?`,
                  okText: 'Xóa',
                  okButtonProps: { danger: true },
                  cancelText: 'Hủy',
                  onOk: () => {
                    setRows((prev) => prev.filter((item) => item.id !== row.id))
                    message.success('Đã xóa tài khoản ĐVVC')
                  },
                })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tài khoản đơn vị vận chuyển"
        description="Quản lý tài khoản kết nối với từng ĐVVC; form cấu hình đổi theo đơn vị đã chọn."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            Thêm tài khoản ĐVVC
          </Button>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space.Compact style={{ width: 360 }}>
            <Input
              allowClear
              placeholder="Tìm kiếm tên tài khoản"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPressEnter={() => setAppliedQuery(query)}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={() => setAppliedQuery(query)} />
          </Space.Compact>
        </div>

        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Select
              allowClear
              placeholder="Loại"
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'customer', label: 'Tài khoản của khách hàng' },
                { value: 'customer_warehouse', label: 'Tài khoản của khách hàng và kho' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              allowClear
              placeholder="Đơn vị vận chuyển"
              style={{ width: '100%' }}
              value={carrierFilter}
              onChange={setCarrierFilter}
              options={carrierCatalog.map((c) => ({ value: c.code, label: c.label }))}
            />
          </Col>
          {!isCustomer ? (
            <Col xs={24} sm={12} md={6}>
              <Select
                allowClear
                placeholder="Đối tác gửi hàng"
                style={{ width: '100%' }}
                value={partnerFilter}
                onChange={setPartnerFilter}
                options={partnerOptions}
              />
            </Col>
          ) : null}
          <Col xs={24} sm={12} md={6}>
            <Select
              allowClear
              placeholder="Kho"
              style={{ width: '100%' }}
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={warehouseOptions}
            />
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      <CarrierAccountFormModal
        open={open}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        partnerOptions={partnerOptions}
        customerId={isCustomer ? customerScope.customerId : undefined}
        onCancel={() => setOpen(false)}
        onSubmit={(account) => {
          if (editing) {
            setRows((prev) => prev.map((item) => (item.id === editing.id ? account : item)))
            const idx = seedAccounts.findIndex((item) => item.id === editing.id)
            if (idx >= 0) seedAccounts[idx] = account
            message.success('Đã cập nhật tài khoản ĐVVC')
          } else {
            setRows((prev) => [account, ...prev])
            seedAccounts.unshift(account)
            message.success('Đã thêm tài khoản ĐVVC')
          }
          setOpen(false)
        }}
      />
    </div>
  )
}
