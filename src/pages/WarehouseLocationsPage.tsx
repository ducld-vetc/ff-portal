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
  type WarehouseAisle,
  type WarehouseBin,
  type WarehouseLevel,
  type WarehouseRack,
  type WarehouseRoom,
} from '../data/warehouseLocations'

type EntityTab = 'rooms' | 'levels' | 'aisles' | 'racks' | 'bins'
type TabKey = EntityTab

type EditingState =
  | { type: 'rooms'; row: WarehouseRoom }
  | { type: 'levels'; row: WarehouseLevel }
  | { type: 'aisles'; row: WarehouseAisle }
  | { type: 'racks'; row: WarehouseRack }
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
  const [tab, setTab] = useState<TabKey>('rooms')
  const [modalType, setModalType] = useState<EntityTab | null>(null)
  const [editing, setEditing] = useState<EditingState>(null)
  const [form] = Form.useForm()
  const watchedRoomId = Form.useWatch('roomId', form)

  const persist = (next: LocationSetupSnapshot) => {
    setSetup(next)
    setLocationSetup(id, next)
  }

  const isReady =
    setup.rooms.length > 0 &&
    setup.levels.length > 0 &&
    setup.aisles.length > 0 &&
    setup.racks.length > 0 &&
    setup.bins.length > 0

  const roomOptions = setup.rooms.map((r) => ({ value: r.id, label: r.code }))
  const levelOptions = setup.levels.map((r) => ({ value: r.id, label: r.code }))
  const aisleOptions = setup.aisles.map((r) => ({
    value: r.id,
    label: `${setup.rooms.find((x) => x.id === r.roomId)?.code || '?'}.${r.code}`,
  }))
  const rackOptions = setup.racks.map((r) => ({ value: r.id, label: r.code }))


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
    if (key === 'rooms') form.setFieldsValue({ pickPriority: setup.rooms.length + 1 })
    if (key === 'levels') form.setFieldsValue({ pickPriority: setup.levels.length + 1 })
    if (key === 'aisles') {
      form.setFieldsValue({
        roomId: setup.rooms[0]?.id,
        pickPriority: setup.aisles.length + 1,
      })
    }
    if (key === 'racks') {
      form.setFieldsValue({
        roomId: setup.rooms[0]?.id,
        aisleId: setup.aisles[0]?.id,
        pickPriority: 1,
      })
    }
    if (key === 'bins') {
      const room = setup.rooms[0]
      const rack = setup.racks[0]
      const level = setup.levels[0]
      const seq = setup.bins.filter((b) => b.rackId === rack?.id).length + 1
      form.setFieldsValue({
        roomId: room?.id,
        levelId: level?.id,
        aisleId: rack?.aisleId || setup.aisles[0]?.id,
        rackId: rack?.id,
        pickPriority: seq,
        maxSku: 7,
        nonPickable: false,
        fastMoving: false,
        code:
          room && rack && level
            ? suggestBinCode({
                roomCode: room.code,
                rackCode: rack.code,
                levelCode: level.code,
                seq,
              })
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

      if (type === 'rooms') {
        const duplicate = setup.rooms.some(
          (r) => r.code === values.code && r.id !== editing?.row.id,
        )
        if (duplicate) {
          message.error('Mã phòng đã tồn tại')
          return
        }
        if (editing?.type === 'rooms') {
          persist({
            ...setup,
            rooms: setup.rooms.map((r) =>
              r.id === editing.row.id
                ? { ...r, code: values.code, pickPriority: values.pickPriority }
                : r,
            ),
          })
          message.success(`Đã cập nhật phòng ${values.code}`)
        } else {
          const row: WarehouseRoom = {
            id: `room-${Date.now()}`,
            warehouseId: id,
            code: values.code,
            pickPriority: values.pickPriority,
          }
          persist({ ...setup, rooms: [...setup.rooms, row] })
          message.success(`Đã tạo phòng ${row.code}`)
        }
      }

      if (type === 'levels') {
        const duplicate = setup.levels.some(
          (r) => r.code === values.code && r.id !== editing?.row.id,
        )
        if (duplicate) {
          message.error('Mã tầng đã tồn tại')
          return
        }
        if (editing?.type === 'levels') {
          persist({
            ...setup,
            levels: setup.levels.map((r) =>
              r.id === editing.row.id
                ? { ...r, code: values.code, pickPriority: values.pickPriority }
                : r,
            ),
          })
          message.success(`Đã cập nhật tầng ${values.code}`)
        } else {
          const row: WarehouseLevel = {
            id: `lv-${Date.now()}`,
            warehouseId: id,
            code: values.code,
            pickPriority: values.pickPriority,
          }
          persist({ ...setup, levels: [...setup.levels, row] })
          message.success(`Đã tạo tầng ${row.code}`)
        }
      }

      if (type === 'aisles') {
        if (editing?.type === 'aisles') {
          persist({
            ...setup,
            aisles: setup.aisles.map((r) =>
              r.id === editing.row.id
                ? {
                    ...r,
                    roomId: values.roomId,
                    code: values.code,
                    pickPriority: values.pickPriority,
                  }
                : r,
            ),
          })
          message.success(`Đã cập nhật lối đi ${values.code}`)
        } else {
          const row: WarehouseAisle = {
            id: `aisle-${Date.now()}`,
            warehouseId: id,
            roomId: values.roomId,
            code: values.code,
            pickPriority: values.pickPriority,
          }
          persist({ ...setup, aisles: [...setup.aisles, row] })
          message.success(`Đã tạo lối đi ${row.code}`)
        }
      }

      if (type === 'racks') {
        const aisle = setup.aisles.find((a) => a.id === values.aisleId)
        if (aisle && aisle.roomId !== values.roomId) {
          message.error('Lối đi phải thuộc cùng phòng với dãy kệ')
          return
        }
        if (editing?.type === 'racks') {
          persist({
            ...setup,
            racks: setup.racks.map((r) =>
              r.id === editing.row.id
                ? {
                    ...r,
                    roomId: values.roomId,
                    aisleId: values.aisleId,
                    code: values.code,
                    pickPriority: values.pickPriority,
                  }
                : r,
            ),
          })
          message.success(`Đã cập nhật dãy kệ ${values.code}`)
        } else {
          const row: WarehouseRack = {
            id: `rack-${Date.now()}`,
            warehouseId: id,
            roomId: values.roomId,
            aisleId: values.aisleId,
            code: values.code,
            pickPriority: values.pickPriority,
          }
          persist({ ...setup, racks: [...setup.racks, row] })
          message.success(`Đã tạo dãy kệ ${row.code}`)
        }
      }

      if (type === 'bins') {
        const duplicate = setup.bins.some(
          (b) => b.code === values.code && b.id !== editing?.row.id,
        )
        if (duplicate) {
          message.error('Mã vị trí đã tồn tại')
          return
        }
        const rack = setup.racks.find((r) => r.id === values.rackId)
        if (rack && (rack.roomId !== values.roomId || rack.aisleId !== values.aisleId)) {
          message.error('Dãy kệ phải khớp phòng và lối đi đã chọn')
          return
        }
        const patch: Omit<WarehouseBin, 'id' | 'warehouseId'> = {
          roomId: values.roomId,
          levelId: values.levelId,
          aisleId: values.aisleId,
          rackId: values.rackId,
          code: values.code,
          pickPriority: values.pickPriority,
          maxSku: values.maxSku ?? 7,
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
          message.success(`Đã cập nhật vị trí ${values.code}`)
        } else {
          const row: WarehouseBin = {
            id: `bin-${Date.now()}`,
            warehouseId: id,
            ...patch,
          }
          persist({ ...setup, bins: [...setup.bins, row] })
          message.success(`Đã tạo vị trí ${row.code}`)
        }
      }

      closeModal()
    } catch {
      /* validation */
    }
  }

  const editBtn = (onClick: () => void) => (
    <IconAction title="Chỉnh sửa" size="small" icon={<EditOutlined />} onClick={onClick} />
  )

  const roomColumns: TableColumnsType<WarehouseRoom> = [
    {
      title: 'Mã phòng',
      dataIndex: 'code',
      width: 140,
      render: (v: string) => <CodeCell value={v} />,
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'pickPriority',
      width: 160,
      render: (v: number) => <PriorityCell value={v} />,
    },
    {
      title: 'Ghi chú',
      render: (_, row) =>
        row.pickPriority === 1 ? (
          <Typography.Text type="secondary">Ưu tiên lấy hàng trước các phòng khác</Typography.Text>
        ) : (
          <Typography.Text type="secondary">Thứ tự lấy sau phòng ưu tiên thấp hơn</Typography.Text>
        ),
    },
    {
      title: '',
      width: 64,
      align: 'center',
      render: (_, row) => editBtn(() => openEdit({ type: 'rooms', row })),
    },
  ]

  const levelColumns: TableColumnsType<WarehouseLevel> = [
    {
      title: 'Mã tầng',
      dataIndex: 'code',
      width: 140,
      render: (v: string) => <CodeCell value={v} />,
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'pickPriority',
      width: 160,
      render: (v: number) => <PriorityCell value={v} />,
    },
    {
      title: 'Ghi chú',
      render: (_, row) => (
        <Typography.Text type="secondary">
          {row.pickPriority === 1
            ? 'Thường là tầng trệt / thấp — lấy trước'
            : 'Tầng cao hơn — lấy sau khi hết tầng ưu tiên thấp'}
        </Typography.Text>
      ),
    },
    {
      title: '',
      width: 64,
      align: 'center',
      render: (_, row) => editBtn(() => openEdit({ type: 'levels', row })),
    },
  ]

  const aisleColumns: TableColumnsType<WarehouseAisle> = [
    {
      title: 'Phòng',
      width: 110,
      render: (_, row) => (
        <CodeCell value={setup.rooms.find((r) => r.id === row.roomId)?.code} />
      ),
    },
    {
      title: 'Mã lối đi',
      dataIndex: 'code',
      width: 140,
      render: (v: string) => <CodeCell value={v} />,
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'pickPriority',
      width: 160,
      render: (v: number) => <PriorityCell value={v} />,
    },
    {
      title: '',
      width: 64,
      align: 'center',
      render: (_, row) => editBtn(() => openEdit({ type: 'aisles', row })),
    },
  ]

  const rackColumns: TableColumnsType<WarehouseRack> = [
    {
      title: 'Phòng',
      width: 100,
      render: (_, row) => (
        <CodeCell value={setup.rooms.find((r) => r.id === row.roomId)?.code} />
      ),
    },
    {
      title: 'Lối đi',
      width: 100,
      render: (_, row) => (
        <CodeCell value={setup.aisles.find((r) => r.id === row.aisleId)?.code} />
      ),
    },
    {
      title: 'Mã dãy kệ',
      dataIndex: 'code',
      width: 140,
      render: (v: string) => <CodeCell value={v} />,
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'pickPriority',
      width: 160,
      render: (v: number) => <PriorityCell value={v} />,
    },
    {
      title: '',
      width: 64,
      align: 'center',
      render: (_, row) => editBtn(() => openEdit({ type: 'racks', row })),
    },
  ]

  const binColumns: TableColumnsType<WarehouseBin> = [
    {
      title: 'Mã vị trí',
      dataIndex: 'code',
      width: 170,
      fixed: 'left',
      render: (v: string) => <CodeCell value={v} />,
    },
    {
      title: 'Phòng',
      width: 88,
      render: (_, row) => (
        <CodeCell value={setup.rooms.find((r) => r.id === row.roomId)?.code} />
      ),
    },
    {
      title: 'Tầng',
      width: 72,
      render: (_, row) => (
        <CodeCell value={setup.levels.find((r) => r.id === row.levelId)?.code} />
      ),
    },
    {
      title: 'Lối',
      width: 72,
      render: (_, row) => (
        <CodeCell value={setup.aisles.find((r) => r.id === row.aisleId)?.code} />
      ),
    },
    {
      title: 'Kệ',
      width: 88,
      render: (_, row) => (
        <CodeCell value={setup.racks.find((r) => r.id === row.rackId)?.code} />
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'pickPriority',
      width: 110,
      align: 'center',
      render: (v: number) => <PriorityCell value={v} />,
    },
    {
      title: 'Max SKU',
      dataIndex: 'maxSku',
      width: 96,
      align: 'right',
    },
    {
      title: 'Kích thước (cm)',
      width: 130,
      render: (_, row) =>
        row.lengthCm || row.widthCm || row.heightCm ? (
          <span className="loc-dim">
            {row.lengthCm ?? '—'}×{row.widthCm ?? '—'}×{row.heightCm ?? '—'}
          </span>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Thuộc tính',
      width: 220,
      render: (_, row) => (
        <Space size={4} wrap>
          {row.nonPickable ? <Tag>Không lấy hàng</Tag> : null}
          {row.fastMoving ? <Tag color="orange">Fast Moving</Tag> : null}
          {!row.nonPickable && !row.fastMoving ? (
            <Typography.Text type="secondary">—</Typography.Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: '',
      width: 64,
      fixed: 'right',
      align: 'center',
      render: (_, row) => editBtn(() => openEdit({ type: 'bins', row })),
    },
  ]

  const modalTitle = (() => {
    const isEdit = !!editing
    const map: Record<EntityTab, [string, string]> = {
      rooms: ['Thêm phòng lưu trữ', 'Sửa phòng lưu trữ'],
      levels: ['Thêm tầng kệ', 'Sửa tầng kệ'],
      aisles: ['Thêm lối đi', 'Sửa lối đi'],
      racks: ['Thêm dãy kệ', 'Sửa dãy kệ'],
      bins: ['Thêm vị trí (bin)', 'Sửa vị trí (bin)'],
    }
    if (!modalType) return ''
    return map[modalType][isEdit ? 1 : 0]
  })()

  const stats = [
    { key: 'rooms', label: 'Phòng', value: setup.rooms.length, hint: 'Room' },
    { key: 'levels', label: 'Tầng', value: setup.levels.length, hint: 'Level' },
    { key: 'aisles', label: 'Lối đi', value: setup.aisles.length, hint: 'Aisle' },
    { key: 'racks', label: 'Dãy kệ', value: setup.racks.length, hint: 'Rack' },
    { key: 'bins', label: 'Vị trí bin', value: setup.bins.length, hint: 'Bin' },
  ] as const

  return (
    <div>
      <PageHeader
        title={`Quản lý vị trí — ${warehouse.code}`}
        description={`${warehouse.name}. Thiết lập / chỉnh sửa layout: Phòng → Tầng → Lối đi → Dãy kệ → Bin (độ ưu tiên). Lộ trình lấy hàng xem tại Phân công lấy hàng theo từng wave.`}
        extra={
          <Space>
            <IconAction
              title="Danh sách kho"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/warehouses')}
            />
            <IconAction
              title="Thiết bị chứa hàng"
              icon={<InboxOutlined />}
              onClick={() => navigate('/warehouses/storage-devices')}
            />
          </Space>
        }
      />

      <div className="loc-summary-card">
        <div className="loc-summary-top">
          <div className="loc-summary-identity">
            <span className="loc-summary-icon">
              <HomeOutlined />
            </span>
            <div>
              <div className="loc-summary-name">{warehouse.name}</div>
              <div className="loc-summary-code">{warehouse.code}</div>
            </div>
          </div>
          <div className={`loc-summary-status ${isReady ? 'is-ready' : 'is-pending'}`}>
            <span className="loc-summary-status-dot" />
            {isReady ? 'Sẵn sàng vận hành' : 'Chưa đủ cấu trúc'}
          </div>
        </div>
        <div className="loc-summary-stats">
          {stats.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`loc-stat ${tab === item.key ? 'is-active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <span className="loc-stat-value">{item.value}</span>
              <span className="loc-stat-label">{item.label}</span>
              <span className="loc-stat-hint">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="content-card loc-table-card">
        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as TabKey)}
          items={[
            {
              key: 'rooms',
              label: `Phòng (${setup.rooms.length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Max 5 ký tự. Có thể sửa mã và độ ưu tiên sau khi tạo.
                    </Typography.Text>
                    <IconAction
                      title="Thêm phòng"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => openCreate('rooms')}
                    />
                  </div>
                  <Table
                    className="loc-data-table"
                    rowKey="id"
                    size="middle"
                    columns={roomColumns}
                    dataSource={[...setup.rooms].sort((a, b) => a.pickPriority - b.pickPriority)}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'levels',
              label: `Tầng (${setup.levels.length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Max 3 ký tự. Tầng trệt nên ưu tiên số nhỏ hơn tầng cao.
                    </Typography.Text>
                    <IconAction
                      title="Thêm tầng"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => openCreate('levels')}
                    />
                  </div>
                  <Table
                    className="loc-data-table"
                    rowKey="id"
                    size="middle"
                    columns={levelColumns}
                    dataSource={[...setup.levels].sort((a, b) => a.pickPriority - b.pickPriority)}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'aisles',
              label: `Lối đi (${setup.aisles.length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Aisle phục vụ put-away & picking. Sửa được phòng gắn / mã / ưu tiên.
                    </Typography.Text>
                    <Space>
                      <IconAction
                        title="Import"
                        icon={<UploadOutlined />}
                        onClick={() => message.info('Demo: import nhiều lối đi từ Excel')}
                      />
                      <IconAction
                        title="Thêm lối đi"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => openCreate('aisles')}
                      />
                    </Space>
                  </div>
                  <Table
                    className="loc-data-table"
                    rowKey="id"
                    size="middle"
                    columns={aisleColumns}
                    dataSource={[...setup.aisles].sort((a, b) => a.pickPriority - b.pickPriority)}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'racks',
              label: `Dãy kệ (${setup.racks.length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Cùng lối: so priority kệ. Khác lối: ưu tiên lối đi trước.
                    </Typography.Text>
                    <Space>
                      <IconAction
                        title="Import"
                        icon={<UploadOutlined />}
                        onClick={() => message.info('Demo: import nhiều dãy kệ từ Excel')}
                      />
                      <IconAction
                        title="Thêm dãy kệ"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => openCreate('racks')}
                      />
                    </Space>
                  </div>
                  <Table
                    className="loc-data-table"
                    rowKey="id"
                    size="middle"
                    columns={rackColumns}
                    dataSource={[...setup.racks].sort((a, b) => a.pickPriority - b.pickPriority)}
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'bins',
              label: `Vị trí bin (${setup.bins.length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Max 15 ký tự. Có thể sửa toàn bộ tiêu chí (ưu tiên, cờ, kích thước…).
                    </Typography.Text>
                    <Space>
                      <IconAction
                        title="Import"
                        icon={<UploadOutlined />}
                        onClick={() => message.info('Demo: import nhiều vị trí từ Excel')}
                      />
                      <IconAction
                        title="Thêm vị trí"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => openCreate('bins')}
                      />
                    </Space>
                  </div>
                  <Table
                    className="loc-data-table"
                    rowKey="id"
                    size="middle"
                    columns={binColumns}
                    dataSource={[...setup.bins].sort((a, b) => a.pickPriority - b.pickPriority)}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    scroll={{ x: 1180 }}
                  />
                </>
              ),
            }
          ]}
        />
      </div>

      <Modal
        open={!!modalType}
        title={modalTitle}
        onCancel={closeModal}
        onOk={submitModal}
        okText={editing ? 'Cập nhật' : 'Lưu'}
        destroyOnHidden
        width={modalType === 'bins' ? 560 : 480}
      >
        <Form form={form} layout="vertical">
          {modalType === 'rooms' ? (
            <>
              <Form.Item
                name="code"
                label="Mã phòng"
                rules={[
                  { required: true, message: 'Nhập mã phòng' },
                  { max: 5, message: 'Tối đa 5 ký tự' },
                ]}
              >
                <Input placeholder="VD: R1" maxLength={5} />
              </Form.Item>
              <Form.Item
                name="pickPriority"
                label="Độ ưu tiên"
                rules={[{ required: true, message: 'Nhập độ ưu tiên' }]}
                extra="Số 1 = ưu tiên cao nhất"
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null}

          {modalType === 'levels' ? (
            <>
              <Form.Item
                name="code"
                label="Mã tầng"
                rules={[
                  { required: true, message: 'Nhập mã tầng' },
                  { max: 3, message: 'Tối đa 3 ký tự' },
                ]}
              >
                <Input placeholder="VD: A" maxLength={3} />
              </Form.Item>
              <Form.Item name="pickPriority" label="Độ ưu tiên" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null}

          {modalType === 'aisles' ? (
            <>
              <Form.Item name="roomId" label="Mã phòng" rules={[{ required: true }]}>
                <Select options={roomOptions} />
              </Form.Item>
              <Form.Item
                name="code"
                label="Mã lối đi"
                rules={[{ required: true }, { max: 10, message: 'Tối đa 10 ký tự' }]}
              >
                <Input maxLength={10} />
              </Form.Item>
              <Form.Item name="pickPriority" label="Độ ưu tiên" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null}

          {modalType === 'racks' ? (
            <>
              <Form.Item name="roomId" label="Mã phòng" rules={[{ required: true }]}>
                <Select
                  options={roomOptions}
                  onChange={() => form.setFieldsValue({ aisleId: undefined })}
                />
              </Form.Item>
              <Form.Item name="aisleId" label="Mã lối đi" rules={[{ required: true }]}>
                <Select
                  options={setup.aisles
                    .filter((a) => a.roomId === watchedRoomId)
                    .map((a) => ({ value: a.id, label: a.code }))}
                />
              </Form.Item>
              <Form.Item
                name="code"
                label="Mã giá / dãy kệ"
                rules={[{ required: true }, { max: 10 }]}
              >
                <Input maxLength={10} />
              </Form.Item>
              <Form.Item name="pickPriority" label="Độ ưu tiên" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null}

          {modalType === 'bins' ? (
            <>
              <Form.Item
                name="code"
                label="Mã vị trí"
                rules={[{ required: true }, { max: 15, message: 'Tối đa 15 ký tự' }]}
              >
                <Input maxLength={15} placeholder="R1.A01.A.03" />
              </Form.Item>
              <Form.Item name="roomId" label="Mã phòng" rules={[{ required: true }]}>
                <Select options={roomOptions} />
              </Form.Item>
              <Form.Item name="levelId" label="Mã tầng" rules={[{ required: true }]}>
                <Select options={levelOptions} />
              </Form.Item>
              <Form.Item name="aisleId" label="Mã lối đi" rules={[{ required: true }]}>
                <Select options={aisleOptions} />
              </Form.Item>
              <Form.Item name="rackId" label="Mã dãy kệ" rules={[{ required: true }]}>
                <Select options={rackOptions} />
              </Form.Item>
              <Form.Item name="pickPriority" label="Độ ưu tiên" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="maxSku" label="Số SKU tối đa" extra="Khuyến nghị tối ưu ~7 SKU/bin">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="nonPickable" valuePropName="checked">
                <Checkbox>Không thể lấy hàng (chỉ lưu trữ)</Checkbox>
              </Form.Item>
              <Form.Item name="fastMoving" valuePropName="checked">
                <Checkbox>Vị trí Fast Moving</Checkbox>
              </Form.Item>
              <Space>
                <Form.Item name="lengthCm" label="Dài (cm)">
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item name="widthCm" label="Rộng (cm)">
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item name="heightCm" label="Cao (cm)">
                  <InputNumber min={0} />
                </Form.Item>
              </Space>
            </>
          ) : null}
        </Form>
      </Modal>
    </div>
  )
}
