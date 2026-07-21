import { useMemo, useState } from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  message,
  type TableColumnsType,
} from 'antd'
import { PageHeader } from '../components/PageHeader'
import CarrierAccountPicker from '../components/CarrierAccountPicker'
import {
  accountTypeLabel,
  carrierAccounts,
  partner3plOptions,
  routes,
  seedShippingPackages,
  type ShippingPackage,
  type WeightTier,
} from '../data/shipping'
import { carriers } from '../data/mock'

function emptyPackage(): Omit<ShippingPackage, 'id'> {
  return {
    route: undefined as unknown as string,
    serviceCode: undefined as unknown as string,
    serviceName: '',
    destination: 'Toàn quốc',
    slaFastHours: 24,
    slaSlowHours: 72,
    partner3pl: undefined,
    applyByDistrict: false,
    weightTiers: [],
    accountIds: [],
    status: 'active',
  }
}

export default function ShippingPackagesPage() {
  const [rows, setRows] = useState(seedShippingPackages)
  const [query, setQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState<string | undefined>()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ShippingPackage | null>(null)
  const [form] = Form.useForm()
  const [weightTiers, setWeightTiers] = useState<WeightTier[]>([])
  const [accountIds, setAccountIds] = useState<string[]>([])
  const [draftTier, setDraftTier] = useState({
    fromGram: undefined as number | undefined,
    toGram: undefined as number | undefined,
    stepGram: undefined as number | undefined,
    feePerStep: undefined as number | undefined,
    cost: undefined as number | undefined,
    partner3pl: undefined as string | undefined,
  })
  const [accountPickerOpen, setAccountPickerOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (serviceFilter && row.serviceCode !== serviceFilter) return false
      if (!q) return true
      return (
        row.serviceName.toLowerCase().includes(q) ||
        row.serviceCode.toLowerCase().includes(q) ||
        row.destination.toLowerCase().includes(q)
      )
    })
  }, [rows, query, serviceFilter])

  const linkedAccounts = useMemo(
    () => carrierAccounts.filter((acc) => accountIds.includes(acc.id)),
    [accountIds],
  )

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(emptyPackage())
    setWeightTiers([])
    setAccountIds([])
    setDraftTier({
      fromGram: undefined,
      toGram: undefined,
      stepGram: undefined,
      feePerStep: undefined,
      cost: undefined,
      partner3pl: undefined,
    })
    setOpen(true)
  }

  const openEdit = (row: ShippingPackage) => {
    setEditing(row)
    form.setFieldsValue(row)
    setWeightTiers(row.weightTiers)
    setAccountIds(row.accountIds)
    setOpen(true)
  }

  const columns: TableColumnsType<ShippingPackage> = [
    {
      title: '#',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Dịch vụ vận chuyển',
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.serviceName}</strong>
          <span>{row.serviceCode}</span>
        </div>
      ),
    },
    { title: 'Đến khu vực', dataIndex: 'destination', width: 140 },
    {
      title: 'SLA (giờ)',
      width: 120,
      render: (_, row) => `${row.slaFastHours} - ${row.slaSlowHours}`,
    },
    {
      title: 'Tài khoản',
      width: 100,
      render: (_, row) => row.accountIds.length,
    },
    {
      title: 'Tác vụ',
      width: 110,
      render: (_, row) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: `Xóa gói ${row.serviceName}?`,
                okText: 'Xóa',
                okButtonProps: { danger: true },
                onOk: () => {
                  setRows((prev) => prev.filter((item) => item.id !== row.id))
                  message.success('Đã xóa gói vận chuyển')
                },
              })
            }}
          />
        </Space>
      ),
    },
  ]

  const weightColumns: TableColumnsType<WeightTier> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    { title: 'Từ trọng lượng (g)', dataIndex: 'fromGram' },
    { title: 'Đến trọng lượng (g)', dataIndex: 'toGram' },
    { title: 'Bước tính (g)', dataIndex: 'stepGram' },
    { title: 'Phí mỗi bước tính (đồng)', dataIndex: 'feePerStep' },
    { title: 'Chi phí (đồng)', dataIndex: 'cost' },
    { title: 'Đối tác 3PL', dataIndex: 'partner3pl', render: (v) => v || '—' },
    {
      title: '',
      width: 60,
      render: (_, row) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => setWeightTiers((prev) => prev.filter((item) => item.id !== row.id))}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Gói vận chuyển"
        description="Cấu hình gói dịch vụ VC, bảng trọng lượng và gắn tài khoản khách hàng."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tạo dịch vụ vận chuyển
          </Button>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap>
            <Select
              allowClear
              placeholder="Dịch vụ vận chuyển"
              style={{ width: 220 }}
              value={serviceFilter}
              onChange={setServiceFilter}
              options={rows.map((r) => ({ value: r.serviceCode, label: r.serviceName }))}
            />
            <Input
              className="search-input"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Space>
        </div>
        <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 8 }} />
      </div>

      <Modal
        open={open}
        title={
          <div className="modal-title-blue">
            {editing ? 'CẬP NHẬT DỊCH VỤ VẬN CHUYỂN' : 'TẠO DỊCH VỤ VẬN CHUYỂN'}
          </div>
        }
        onCancel={() => setOpen(false)}
        width={980}
        destroyOnHidden
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>Thoát</Button>
            <Button type="primary" onClick={() => form.submit()}>
              Lưu
            </Button>
          </Space>
        }
      >
        <div className="section-card">
          <div className="section-card-title">Thông tin chung</div>
          <Form
            form={form}
            layout="vertical"
            requiredMark
            onFinish={(values) => {
              const carrier = carriers.find((c) => c.code === values.serviceCode)
              const routeLabel = routes.find((r) => r.value === values.route)?.label || 'Toàn quốc'
              const payload: ShippingPackage = {
                id: editing?.id || `pkg-${Date.now()}`,
                route: values.route,
                serviceCode: values.serviceCode,
                serviceName: carrier?.name || values.serviceCode,
                destination: routeLabel,
                slaFastHours: values.slaFastHours,
                slaSlowHours: values.slaSlowHours,
                partner3pl: values.partner3pl,
                applyByDistrict: values.applyByDistrict,
                weightTiers,
                accountIds,
                status: 'active',
              }
              if (editing) {
                setRows((prev) => prev.map((item) => (item.id === editing.id ? payload : item)))
                message.success('Đã cập nhật gói vận chuyển')
              } else {
                setRows((prev) => [payload, ...prev])
                message.success('Đã tạo gói vận chuyển')
              }
              setOpen(false)
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="route"
                  label="Tuyến"
                  rules={[{ required: true, message: 'Tuyến yêu cầu nhập' }]}
                >
                  <Select placeholder="Chọn tuyến" options={routes} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="serviceCode"
                  label="Dịch vụ vận chuyển"
                  rules={[{ required: true, message: 'Chọn dịch vụ vận chuyển' }]}
                >
                  <Select
                    placeholder="Chọn dịch vụ"
                    options={carriers.map((c) => ({
                      value: c.code,
                      label: `${c.code} - ${c.name}`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="slaFastHours"
                  label="SLA nhanh nhất (giờ)"
                  rules={[{ required: true, message: 'Nhập SLA nhanh nhất' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="slaSlowHours"
                  label="SLA lâu nhất (giờ)"
                  rules={[{ required: true, message: 'Nhập SLA lâu nhất' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="partner3pl" label="Đối tác 3PL">
                  <Select allowClear placeholder="Chọn TPL" options={partner3plOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="applyByDistrict"
                  label="Áp dụng theo Quận/Huyện"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        <Tabs
          items={[
            {
              key: 'weight',
              label: 'THÔNG TIN TRỌNG LƯỢNG',
              children: (
                <div>
                  <Row gutter={8} style={{ marginBottom: 12 }} align="middle">
                    <Col flex="1">
                      <InputNumber
                        placeholder="Từ TL (g)"
                        style={{ width: '100%' }}
                        value={draftTier.fromGram}
                        onChange={(v) => setDraftTier((s) => ({ ...s, fromGram: v ?? undefined }))}
                      />
                    </Col>
                    <Col flex="1">
                      <InputNumber
                        placeholder="Đến TL (g)"
                        style={{ width: '100%' }}
                        value={draftTier.toGram}
                        onChange={(v) => setDraftTier((s) => ({ ...s, toGram: v ?? undefined }))}
                      />
                    </Col>
                    <Col flex="1">
                      <InputNumber
                        placeholder="Bước (g)"
                        style={{ width: '100%' }}
                        value={draftTier.stepGram}
                        onChange={(v) => setDraftTier((s) => ({ ...s, stepGram: v ?? undefined }))}
                      />
                    </Col>
                    <Col flex="1">
                      <InputNumber
                        placeholder="Phí/bước"
                        style={{ width: '100%' }}
                        value={draftTier.feePerStep}
                        onChange={(v) =>
                          setDraftTier((s) => ({ ...s, feePerStep: v ?? undefined }))
                        }
                      />
                    </Col>
                    <Col flex="1">
                      <InputNumber
                        placeholder="Chi phí"
                        style={{ width: '100%' }}
                        value={draftTier.cost}
                        onChange={(v) => setDraftTier((s) => ({ ...s, cost: v ?? undefined }))}
                      />
                    </Col>
                    <Col flex="1">
                      <Select
                        allowClear
                        placeholder="Chọn TPL"
                        style={{ width: '100%' }}
                        options={partner3plOptions}
                        value={draftTier.partner3pl}
                        onChange={(v) => setDraftTier((s) => ({ ...s, partner3pl: v }))}
                      />
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          if (
                            draftTier.fromGram == null ||
                            draftTier.toGram == null ||
                            draftTier.stepGram == null ||
                            draftTier.feePerStep == null ||
                            draftTier.cost == null
                          ) {
                            message.warning('Nhập đủ thông tin trọng lượng')
                            return
                          }
                          setWeightTiers((prev) => [
                            ...prev,
                            {
                              id: `wt-${Date.now()}`,
                              fromGram: draftTier.fromGram!,
                              toGram: draftTier.toGram!,
                              stepGram: draftTier.stepGram!,
                              feePerStep: draftTier.feePerStep!,
                              cost: draftTier.cost!,
                              partner3pl: draftTier.partner3pl,
                            },
                          ])
                          setDraftTier({
                            fromGram: undefined,
                            toGram: undefined,
                            stepGram: undefined,
                            feePerStep: undefined,
                            cost: undefined,
                            partner3pl: undefined,
                          })
                        }}
                      />
                    </Col>
                  </Row>
                  <Table
                    rowKey="id"
                    size="small"
                    columns={weightColumns}
                    dataSource={weightTiers}
                    locale={{ emptyText: 'Không có dữ liệu' }}
                    pagination={false}
                  />
                </div>
              ),
            },
            {
              key: 'accounts',
              label: 'CẤU HÌNH TÀI KHOẢN',
              children: (
                <div>
                  <div className="table-toolbar">
                    <div className="section-label">Tài khoản đã gắn ({linkedAccounts.length})</div>
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => setAccountPickerOpen(true)}
                    >
                      Thêm tài khoản ĐVVC
                    </Button>
                  </div>
                  <Table
                    rowKey="id"
                    size="small"
                    dataSource={linkedAccounts}
                    locale={{ emptyText: 'Chưa gắn tài khoản' }}
                    pagination={false}
                    columns={[
                      {
                        title: 'Loại tài khoản',
                        dataIndex: 'type',
                        render: (type: keyof typeof accountTypeLabel) => accountTypeLabel[type],
                      },
                      { title: 'Tên tài khoản', dataIndex: 'name' },
                      { title: 'ĐVVC', dataIndex: 'carrierCode', width: 90 },
                      {
                        title: 'Đối tác',
                        render: (_, row) => row.partnerName,
                      },
                      {
                        title: 'Kho',
                        render: (_, row) => row.warehouseName || '—',
                      },
                      {
                        title: '',
                        width: 60,
                        render: (_, row) => (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              setAccountIds((prev) => prev.filter((id) => id !== row.id))
                            }
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <CarrierAccountPicker
        open={accountPickerOpen}
        selectedIds={accountIds}
        onCancel={() => setAccountPickerOpen(false)}
        onSave={(ids) => {
          setAccountIds(ids)
          setAccountPickerOpen(false)
        }}
      />
    </div>
  )
}
