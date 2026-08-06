import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  EditOutlined,
  HomeOutlined,
  InboxOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { warehouses } from '../data/mock'
import {
  getLocationSetup,
  setLocationSetup,
  suggestBinCode,
  type LocationSetupSnapshot,
  type WarehouseBin,
  type WarehouseDevice,
  type WarehouseZone,
} from '../data/warehouseLocations'

type EntityTab = 'zones' | 'devices' | 'bins'

type EditingState =
  | { type: 'zones'; row: WarehouseZone }
  | { type: 'devices'; row: WarehouseDevice }
  | { type: 'bins'; row: WarehouseBin }
  | null

function PriorityCell({ value }: { value: number }) {
  return (
    <span className={`loc-priority ${value === 1 ? 'is-top' : ''}`}>
      <span className="loc-priority-num">{value}</span>
      {value === 1 ? <span className="loc-priority-hint">cao nhất</span> : null}
    </span>
  )
}

function CodeCell({ value }: { value?: string }) {
  return <span className="loc-code">{value || '—'}</span>
}

export default function WarehouseLocationsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const warehouse = warehouses.find((w) => w.id === id)

  const [setup, setSetup] = useState<LocationSetupSnapshot>(() => getLocationSetup(id))
  const [tab, setTab] = useState<EntityTab>('zones')
  const [modalType, setModalType] = useState<EntityTab | null>(null)
  const [editing, setEditing] = useState<EditingState>(null)
  const [form] = Form.useForm()

  const persist = (next: LocationSetupSnapshot) => {
    setSetup(next)
    setLocationSetup(id, next)
  }

  const isReady = setup.zones.length > 0 && setup.devices.length > 0 && setup.bins.length > 0

  const zoneOptions = setup.zones.map((r) => ({
    value: r.id,
    label: r.name ? `${r.code} · ${r.name}` : r.code,
  }))
  const deviceOptions = setup.devices.map((r) => {
    const zone = setup.zones.find((z) => z.id === r.zoneId)
    return {
      value: r.id,
      label: `${zone?.code || '?'}.${r.code}${r.name ? ` · ${r.name}` : ''}`,
    }
  })

  if (!warehouse) {
    return (
      <div>
        <PageHeader title="Không tìm thấy kho" />
        <IconAction
          title="Quay lại danh sách kho"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/warehouses')}
        />
      </div>
    )
  }

  const closeModal = () => {
    setModalType(null)
    setEditing(null)
    form.resetFields()
  }

  const openCreate = (key: EntityTab) => {
    setEditing(null)
    setModalType(key)
    form.resetFields()
    if (key === 'zones') {
      form.setFieldsValue({ pickPriority: setup.zones.length + 1 })
    }
    if (key === 'devices') {
      form.setFieldsValue({
        zoneId: setup.zones[0]?.id,
        pickPriority: setup.devices.length + 1,
      })
    }
    if (key === 'bins') {
      const zone = setup.zones[0]
      const device = setup.devices[0]
      const seq = setup.bins.filter((b) => b.deviceId === device?.id).length + 1
      form.setFieldsValue({
        zoneId: zone?.id,
        deviceId: device?.id,
        pickPriority: seq,
        maxSku: 7,
        nonPickable: false,
        fastMoving: false,
        code:
          zone && device
            ? suggestBinCode({ zoneCode: zone.code, deviceCode: device.code, seq })
            : '',
      })
    }
  }

  const openEdit = (state: NonNullable<EditingState>) => {
    setEditing(state)
    setModalType(state.type)
    form.setFieldsValue({ ...state.row })
  }

  const submitModal = async () => {
    try {
      const values = await form.validateFields()
      const type = modalType
      if (!type) return

      if (type === 'zones') {
        const duplicate = setup.zones.some(
          (r) => r.code === values.code && r.id !== editing?.row.id,
        )
        if (duplicate) {
          message.error('Mã zone đã tồn tại')
          return
        }
        if (editing?.type === 'zones') {
          persist({
            ...setup,
            zones: setup.zones.map((r) =>
              r.id === editing.row.id
                ? {
                    ...r,
                    code: values.code,
                    name: values.name?.trim() || undefined,
                    pickPriority: values.pickPriority,
                  }
                : r,
            ),
          })
          message.success(`Đã cập nhật zone ${values.code}`)
        } else {
          const row: WarehouseZone = {
            id: `zone-${Date.now()}`,
            warehouseId: id,
            code: values.code,
            name: values.name?.trim() || undefined,
            pickPriority: values.pickPriority,
          }
          persist({ ...setup, zones: [...setup.zones, row] })
          message.success(`Đã tạo zone ${row.code}`)
        }
        closeModal()
        return
      }

      if (type === 'devices') {
        if (!values.zoneId) {
          message.error('Chọn zone')
          return
        }
        const duplicate = setup.devices.some(
          (r) =>
            r.zoneId === values.zoneId &&
            r.code === values.code &&
            r.id !== editing?.row.id,
        )
        if (duplicate) {
          message.error('Mã thiết bị đã tồn tại trong zone')
          return
        }
        if (editing?.type === 'devices') {
          persist({
            ...setup,
            devices: setup.devices.map((r) =>
              r.id === editing.row.id
                ? {
                    ...r,
                    zoneId: values.zoneId,
                    code: values.code,
                    name: values.name?.trim() || undefined,
                    pickPriority: values.pickPriority,
                  }
                : r,
            ),
          })
          message.success(`Đã cập nhật thiết bị ${values.code}`)
        } else {
          const row: WarehouseDevice = {
            id: `dev-${Date.now()}`,
            warehouseId: id,
            zoneId: values.zoneId,
            code: values.code,
            name: values.name?.trim() || undefined,
            pickPriority: values.pickPriority,
          }
          persist({ ...setup, devices: [...setup.devices, row] })
          message.success(`Đã tạo thiết bị ${row.code}`)
        }
        closeModal()
        return
      }

      if (type === 'bins') {
        const duplicate = setup.bins.some(
          (r) => r.code === values.code && r.id !== editing?.row.id,
        )
        if (duplicate) {
          message.error('Mã ô kệ đã tồn tại')
          return
        }
        const device = setup.devices.find((d) => d.id === values.deviceId)
        if (!device) {
          message.error('Chọn thiết bị')
          return
        }
        const patch: Omit<WarehouseBin, 'id' | 'warehouseId'> = {
          zoneId: device.zoneId,
          deviceId: device.id,
          code: values.code.trim(),
          pickPriority: values.pickPriority,
          maxSku: values.maxSku,
          nonPickable: !!values.nonPickable,
          fastMoving: !!values.fastMoving,
          lengthCm: values.lengthCm,
          widthCm: values.widthCm,
          heightCm: values.heightCm,
          skuOnHand: editing?.type === 'bins' ? editing.row.skuOnHand : 0,
          hasPickDemand: editing?.type === 'bins' ? editing.row.hasPickDemand : false,
        }
        if (editing?.type === 'bins') {
          persist({
            ...setup,
            bins: setup.bins.map((b) =>
              b.id === editing.row.id ? { ...b, ...patch } : b,
            ),
          })
          message.success(`Đã cập nhật ô kệ ${values.code}`)
        } else {
          const row: WarehouseBin = {
            id: `bin-${Date.now()}`,
            warehouseId: id,
            ...patch,
          }
          persist({ ...setup, bins: [...setup.bins, row] })
          message.success(`Đã tạo ô kệ ${row.code}`)
        }
        closeModal()
      }
    } catch {
      /* form errors */
    }
  }

  const editBtn = (onClick: () => void) => (
    <IconAction title="Sửa" size="small" icon={<EditOutlined />} onClick={onClick} />
  )

  const zoneColumns: TableColumnsType<WarehouseZone> = [
    { title: 'Mã zone', dataIndex: 'code', width: 120, render: (v) => <CodeCell value={v} /> },
    { title: 'Tên', dataIndex: 'name', render: (v?: string) => v || '—' },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'pickPriority',
      width: 140,
      render: (v: number) => <PriorityCell value={v} />,
    },
    {
      title: '',
      width: 64,
      render: (_, row) => editBtn(() => openEdit({ type: 'zones', row })),
    },
  ]

  const deviceColumns: TableColumnsType<WarehouseDevice> = [
    {
      title: 'Zone',
      width: 100,
      render: (_, row) => <CodeCell value={setup.zones.find((z) => z.id === row.zoneId)?.code} />,
    },
    { title: 'Mã thiết bị', dataIndex: 'code', width: 120, render: (v) => <CodeCell value={v} /> },
    { title: 'Tên', dataIndex: 'name', render: (v?: string) => v || '—' },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'pickPriority',
      width: 140,
      render: (v: number) => <PriorityCell value={v} />,
    },
    {
      title: '',
      width: 64,
      render: (_, row) => editBtn(() => openEdit({ type: 'devices', row })),
    },
  ]

  const binColumns: TableColumnsType<WarehouseBin> = [
    {
      title: 'Mã ô kệ',
      dataIndex: 'code',
      width: 150,
      render: (v) => <CodeCell value={v} />,
    },
    {
      title: 'Zone',
      width: 90,
      render: (_, row) => <CodeCell value={setup.zones.find((z) => z.id === row.zoneId)?.code} />,
    },
    {
      title: 'Thiết bị',
      width: 100,
      render: (_, row) => (
        <CodeCell value={setup.devices.find((d) => d.id === row.deviceId)?.code} />
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'pickPriority',
      width: 100,
      render: (v: number) => <PriorityCell value={v} />,
    },
    { title: 'Max SKU', dataIndex: 'maxSku', width: 90, align: 'right' },
    {
      title: 'Cờ',
      width: 160,
      render: (_, row) => (
        <Space size={4} wrap>
          {row.nonPickable ? <Tag>Không lấy</Tag> : null}
          {row.fastMoving ? <Tag color="orange">Fast</Tag> : null}
          {!row.nonPickable && !row.fastMoving ? <Typography.Text type="secondary">—</Typography.Text> : null}
        </Space>
      ),
    },
    {
      title: '',
      width: 64,
      render: (_, row) => editBtn(() => openEdit({ type: 'bins', row })),
    },
  ]

  const titles: Record<EntityTab, [string, string]> = {
    zones: ['Thêm zone', 'Sửa zone'],
    devices: ['Thêm thiết bị', 'Sửa thiết bị'],
    bins: ['Thêm ô kệ', 'Sửa ô kệ'],
  }

  const summary = [
    { key: 'zones', label: 'Zone', value: setup.zones.length, hint: 'Khu vực' },
    { key: 'devices', label: 'Thiết bị', value: setup.devices.length, hint: 'Kệ / thiết bị chứa' },
    { key: 'bins', label: 'Ô kệ', value: setup.bins.length, hint: 'Bin' },
  ] as const

  return (
    <div>
      <PageHeader
        title={`Quản lý vị trí — ${warehouse.code}`}
        description="Cấu trúc tối giản 3 cấp: Zone → Thiết bị → Ô kệ. Độ ưu tiên số nhỏ = lấy trước."
        extra={
          <IconAction
            title="Quay lại danh sách kho"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/warehouses')}
          />
        }
      />

      <div className="content-card loc-summary-card" style={{ marginBottom: 16 }}>
        <div className="loc-summary-head">
          <Space>
            <HomeOutlined />
            <strong>
              {warehouse.name} · {warehouse.code}
            </strong>
            {isReady ? <Tag color="success">Đủ cấu hình</Tag> : <Tag color="warning">Chưa đủ</Tag>}
          </Space>
          <Typography.Text type="secondary">
            Thứ tự thiết lập: Zone → Thiết bị (thuộc Zone) → Ô kệ (thuộc Thiết bị)
          </Typography.Text>
        </div>
        <div className="loc-summary-grid">
          {summary.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`loc-summary-item ${tab === item.key ? 'is-active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <span className="loc-summary-value">{item.value}</span>
              <span className="loc-summary-label">{item.label}</span>
              <span className="loc-summary-hint">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="content-card">
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as EntityTab)}
          items={[
            {
              key: 'zones',
              label: `Zone (${setup.zones.length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Khu vực vật lý trong kho (picking, lưu trữ, inbound…).
                    </Typography.Text>
                    <IconAction
                      title="Thêm zone"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => openCreate('zones')}
                    />
                  </div>
                  <Table
                    className="loc-data-table"
                    rowKey="id"
                    size="middle"
                    columns={zoneColumns}
                    dataSource={[...setup.zones].sort((a, b) => a.pickPriority - b.pickPriority)}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'devices',
              label: `Thiết bị (${setup.devices.length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Thiết bị chứa hàng (kệ, pallet rack…) thuộc một Zone.
                    </Typography.Text>
                    <IconAction
                      title="Thêm thiết bị"
                      type="primary"
                      icon={<PlusOutlined />}
                      disabled={!setup.zones.length}
                      onClick={() => openCreate('devices')}
                    />
                  </div>
                  {!setup.zones.length ? (
                    <Typography.Text type="secondary">Tạo Zone trước khi thêm thiết bị.</Typography.Text>
                  ) : (
                    <Table
                      className="loc-data-table"
                      rowKey="id"
                      size="middle"
                      columns={deviceColumns}
                      dataSource={[...setup.devices].sort((a, b) => a.pickPriority - b.pickPriority)}
                      pagination={false}
                    />
                  )}
                </>
              ),
            },
            {
              key: 'bins',
              label: `Ô kệ (${setup.bins.length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Ô chứa trên thiết bị — đơn vị nhỏ nhất để put-away / picking.
                    </Typography.Text>
                    <Space>
                      <IconAction
                        title="Import"
                        icon={<UploadOutlined />}
                        onClick={() => message.info('Demo: import nhiều ô kệ từ Excel')}
                      />
                      <IconAction
                        title="Thêm ô kệ"
                        type="primary"
                        icon={<PlusOutlined />}
                        disabled={!setup.devices.length}
                        onClick={() => openCreate('bins')}
                      />
                    </Space>
                  </div>
                  {!setup.devices.length ? (
                    <Typography.Text type="secondary">Tạo Thiết bị trước khi thêm ô kệ.</Typography.Text>
                  ) : (
                    <Table
                      className="loc-data-table"
                      rowKey="id"
                      size="middle"
                      columns={binColumns}
                      dataSource={[...setup.bins].sort((a, b) => a.pickPriority - b.pickPriority)}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      scroll={{ x: 800 }}
                    />
                  )}
                </>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={Boolean(modalType)}
        title={
          <span className="modal-title-blue">
            {modalType ? titles[modalType][editing ? 1 : 0] : ''}
          </span>
        }
        onCancel={closeModal}
        onOk={() => void submitModal()}
        okText={editing ? 'Cập nhật' : 'Lưu'}
        cancelText="Thoát"
        width={modalType === 'bins' ? 560 : 480}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark>
          {modalType === 'zones' ? (
            <>
              <Form.Item
                name="code"
                label="Mã zone"
                rules={[
                  { required: true, message: 'Nhập mã zone' },
                  { max: 10, message: 'Tối đa 10 ký tự' },
                ]}
              >
                <Input className="mono-input" maxLength={10} placeholder="VD: Z1" />
              </Form.Item>
              <Form.Item name="name" label="Tên zone">
                <Input placeholder="VD: Khu picking nhanh" />
              </Form.Item>
              <Form.Item
                name="pickPriority"
                label="Độ ưu tiên"
                rules={[{ required: true, message: 'Nhập độ ưu tiên' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null}

          {modalType === 'devices' ? (
            <>
              <Form.Item
                name="zoneId"
                label="Zone"
                rules={[{ required: true, message: 'Chọn zone' }]}
              >
                <Select options={zoneOptions} placeholder="Chọn zone" />
              </Form.Item>
              <Form.Item
                name="code"
                label="Mã thiết bị"
                rules={[
                  { required: true, message: 'Nhập mã thiết bị' },
                  { max: 15, message: 'Tối đa 15 ký tự' },
                ]}
              >
                <Input className="mono-input" maxLength={15} placeholder="VD: KE01" />
              </Form.Item>
              <Form.Item name="name" label="Tên thiết bị">
                <Input placeholder="VD: Kệ A — hàng đi" />
              </Form.Item>
              <Form.Item name="pickPriority" label="Độ ưu tiên" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null}

          {modalType === 'bins' ? (
            <>
              <Form.Item
                name="deviceId"
                label="Thiết bị"
                rules={[{ required: true, message: 'Chọn thiết bị' }]}
              >
                <Select
                  options={deviceOptions}
                  placeholder="Chọn thiết bị"
                  onChange={(deviceId) => {
                    const device = setup.devices.find((d) => d.id === deviceId)
                    const zone = setup.zones.find((z) => z.id === device?.zoneId)
                    const seq = setup.bins.filter((b) => b.deviceId === deviceId).length + 1
                    if (zone && device) {
                      form.setFieldsValue({
                        zoneId: zone.id,
                        code: suggestBinCode({
                          zoneCode: zone.code,
                          deviceCode: device.code,
                          seq,
                        }),
                        pickPriority: seq,
                      })
                    }
                  }}
                />
              </Form.Item>
              <Form.Item name="zoneId" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="code"
                label="Mã ô kệ"
                rules={[{ required: true, message: 'Nhập mã ô kệ' }]}
              >
                <Input className="mono-input" maxLength={20} placeholder="Z1.KE01.03" />
              </Form.Item>
              <Form.Item name="pickPriority" label="Độ ưu tiên" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="maxSku" label="Số SKU tối đa" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Space size={24} style={{ marginBottom: 16 }}>
                <Form.Item name="nonPickable" valuePropName="checked" noStyle>
                  <Checkbox>Không lấy hàng</Checkbox>
                </Form.Item>
                <Form.Item name="fastMoving" valuePropName="checked" noStyle>
                  <Checkbox>Fast moving</Checkbox>
                </Form.Item>
              </Space>
              <Space wrap>
                <Form.Item name="lengthCm" label="Dài (cm)">
                  <InputNumber min={0} style={{ width: 100 }} />
                </Form.Item>
                <Form.Item name="widthCm" label="Rộng (cm)">
                  <InputNumber min={0} style={{ width: 100 }} />
                </Form.Item>
                <Form.Item name="heightCm" label="Cao (cm)">
                  <InputNumber min={0} style={{ width: 100 }} />
                </Form.Item>
              </Space>
            </>
          ) : null}
        </Form>
      </Modal>

      <div style={{ marginTop: 12 }}>
        <Typography.Text type="secondary">
          <InboxOutlined /> Lộ trình picker dùng ưu tiên Zone → Thiết bị → Ô kệ, xem tại Phân công
          lấy hàng.
        </Typography.Text>
      </div>
    </div>
  )
}
