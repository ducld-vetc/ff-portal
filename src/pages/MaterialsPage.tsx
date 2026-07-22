import { useMemo, useState } from 'react'
import {
  CheckOutlined,
  ClearOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
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
  calcVolumeCm3,
  materialPartners,
  materialTypes,
  ownerTypeLabel,
  seedMaterials,
  type Material,
  type MaterialOwnerType,
} from '../data/materials'

export default function MaterialsPage() {
  const [rows, setRows] = useState<Material[]>(() => [...seedMaterials])
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [partnerFilter, setPartnerFilter] = useState<string | undefined>()
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [ownerFilter, setOwnerFilter] = useState<MaterialOwnerType | undefined>()
  const [filterOpen, setFilterOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [form] = Form.useForm()
  const ownerType = Form.useWatch('ownerType', form) as MaterialOwnerType | undefined

  const [printOpen, setPrintOpen] = useState(false)
  const [printTarget, setPrintTarget] = useState<Material | null>(null)
  const [printQty, setPrintQty] = useState(1)

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return rows.filter((row) => {
      if (partnerFilter && row.partnerCode !== partnerFilter) return false
      if (typeFilter && row.type !== typeFilter) return false
      if (ownerFilter && row.ownerType !== ownerFilter) return false
      if (
        q &&
        !row.code.toLowerCase().includes(q) &&
        !row.name.toLowerCase().includes(q) &&
        !(row.partnerName || '').toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [rows, appliedQuery, partnerFilter, typeFilter, ownerFilter])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      ownerType: 'partner',
      type: 'CARTON',
      lengthCm: 10,
      widthCm: 10,
      heightCm: 10,
      weightGram: 50,
    })
    setFormOpen(true)
  }

  const openEdit = (row: Material) => {
    setEditing(row)
    form.setFieldsValue(row)
    setFormOpen(true)
  }

  const columns: TableColumnsType<Material> = [
    {
      title: '#',
      width: 56,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Thuộc sở hữu',
      dataIndex: 'ownerType',
      width: 120,
      render: (value: MaterialOwnerType) => ownerTypeLabel[value],
    },
    {
      title: 'Đối tác',
      dataIndex: 'partnerName',
      width: 260,
      render: (value?: string) => value || '—',
    },
    { title: 'Tên vật tư', dataIndex: 'name', width: 160 },
    {
      title: 'Mã vật tư',
      dataIndex: 'code',
      width: 140,
      render: (value: string) => (
        <span style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
      ),
    },
    {
      title: 'Khối lượng vật tư (gram)',
      dataIndex: 'weightGram',
      width: 160,
    },
    {
      title: 'DxRxC (cm)',
      width: 140,
      render: (_, row) => `${row.lengthCm}x${row.widthCm}x${row.heightCm}`,
    },
    {
      title: 'Thể tích (cm3)',
      width: 130,
      render: (_, row) => calcVolumeCm3(row.lengthCm, row.widthCm, row.heightCm),
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, row) => (
        <Space size={6}>
          <IconAction
            title="Chỉnh sửa"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(row)}
          />
          <IconAction
            title="Xóa"
            size="small"
            danger
            style={{ background: '#fa8c16', borderColor: '#fa8c16', color: '#fff' }}
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: `Xóa vật tư ${row.code}?`,
                okText: 'Xóa',
                okButtonProps: { danger: true },
                cancelText: 'Hủy',
                onOk: () => {
                  setRows((prev) => prev.filter((item) => item.id !== row.id))
                  message.success('Đã xóa vật tư')
                },
              })
            }}
          />
          <IconAction
            title="In mã vật tư"
            size="small"
            style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
            icon={<PrinterOutlined />}
            onClick={() => {
              setPrintTarget(row)
              setPrintQty(1)
              setPrintOpen(true)
            }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Vật tư"
        description="Quản lý vật tư đóng gói theo đối tác / kho: thêm, sửa, tìm lọc và in mã."
        extra={
          <IconAction title="Thêm" type="primary" icon={<PlusOutlined />} onClick={openCreate} />
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap>
            <Space.Compact style={{ width: 320 }}>
              <Input
                allowClear
                placeholder="Mã, tên vật tư"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={() => setAppliedQuery(query)}
              />
              <IconAction
                title="Tìm kiếm"
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setAppliedQuery(query)}
              />
            </Space.Compact>
            <IconAction
              title="Lọc"
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setFilterOpen(true)}
            />
            {(partnerFilter || typeFilter || ownerFilter || appliedQuery) && (
              <Tag
                closable
                onClose={() => {
                  setPartnerFilter(undefined)
                  setTypeFilter(undefined)
                  setOwnerFilter(undefined)
                  setQuery('')
                  setAppliedQuery('')
                }}
              >
                Đang lọc
              </Tag>
            )}
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      <Drawer
        title="Bộ lọc vật tư"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        width={360}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <IconAction
              title="Xóa lọc"
              icon={<ClearOutlined />}
              onClick={() => {
                setPartnerFilter(undefined)
                setTypeFilter(undefined)
                setOwnerFilter(undefined)
              }}
            />
            <IconAction
              title="Áp dụng"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => setFilterOpen(false)}
            />
          </Space>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Thuộc sở hữu">
            <Select
              allowClear
              placeholder="Tất cả"
              value={ownerFilter}
              onChange={setOwnerFilter}
              options={[
                { value: 'warehouse', label: 'Kho' },
                { value: 'partner', label: 'Đối tác' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Đối tác">
            <Select
              allowClear
              placeholder="Tất cả đối tác"
              value={partnerFilter}
              onChange={setPartnerFilter}
              options={materialPartners}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Loại vật tư">
            <Select
              allowClear
              placeholder="Tất cả loại"
              value={typeFilter}
              onChange={setTypeFilter}
              options={materialTypes}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        open={formOpen}
        title={
          <span className="modal-title-blue">
            {editing ? 'CẬP NHẬT VẬT TƯ' : 'THÊM VẬT TƯ MỚI'}
          </span>
        }
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Thoát"
        width={640}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const partner = materialPartners.find((p) => p.value === values.partnerCode)
            const payload: Material = {
              id: editing?.id || `mat-${Date.now()}`,
              ownerType: values.ownerType,
              partnerCode: values.ownerType === 'partner' ? values.partnerCode : undefined,
              partnerName: values.ownerType === 'partner' ? partner?.label : undefined,
              type: values.type,
              name: values.name,
              code: values.code,
              lengthCm: values.lengthCm,
              widthCm: values.widthCm,
              heightCm: values.heightCm,
              weightGram: values.weightGram,
            }

            if (editing) {
              setRows((prev) => prev.map((item) => (item.id === editing.id ? payload : item)))
              message.success('Đã cập nhật vật tư')
            } else {
              if (rows.some((r) => r.code.toLowerCase() === payload.code.toLowerCase())) {
                message.error('Mã vật tư đã tồn tại')
                return
              }
              setRows((prev) => [payload, ...prev])
              message.success('Đã thêm vật tư mới')
            }
            setFormOpen(false)
          }}
        >
          <Form.Item
            name="ownerType"
            label="Thuộc sở hữu"
            rules={[{ required: true, message: 'Chọn thuộc sở hữu' }]}
          >
            <Radio.Group>
              <Radio value="warehouse">Kho</Radio>
              <Radio value="partner">Đối tác</Radio>
            </Radio.Group>
          </Form.Item>

          {ownerType === 'partner' ? (
            <Form.Item
              name="partnerCode"
              label="Đối tác"
              rules={[{ required: true, message: 'Chọn đối tác' }]}
            >
              <Select
                placeholder="Chọn đối tác"
                options={materialPartners}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          ) : null}

          <Form.Item
            name="type"
            label="Loại vật tư"
            rules={[{ required: true, message: 'Chọn loại vật tư' }]}
          >
            <Select placeholder="Chọn loại vật tư" options={materialTypes} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên vật tư"
            rules={[{ required: true, message: 'Nhập tên vật tư' }]}
          >
            <Input placeholder="Nhập tên vật tư" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã vật tư"
            rules={[{ required: true, message: 'Nhập mã vật tư' }]}
          >
            <Input placeholder="Mã vật tư" style={{ fontFamily: 'var(--font-mono)' }} />
          </Form.Item>

          <Form.Item label="Kích thước (cm)" required>
            <Row gutter={8}>
              <Col span={8}>
                <Form.Item
                  name="lengthCm"
                  rules={[{ required: true, message: 'Nhập dài' }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0.1} style={{ width: '100%' }} placeholder="Dài" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="widthCm"
                  rules={[{ required: true, message: 'Nhập rộng' }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0.1} style={{ width: '100%' }} placeholder="Rộng" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="heightCm"
                  rules={[{ required: true, message: 'Nhập cao' }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0.1} style={{ width: '100%' }} placeholder="Cao" />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item
            name="weightGram"
            label="Khối lượng vật tư (gram)"
            rules={[{ required: true, message: 'Nhập khối lượng' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập khối lượng" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={printOpen}
        title={<span className="modal-title-blue">IN MÃ VẬT TƯ</span>}
        onCancel={() => setPrintOpen(false)}
        footer={
          <Space>
            <IconAction
              title="Thoát"
              icon={<CloseOutlined />}
              onClick={() => setPrintOpen(false)}
            />
            <IconAction
              title="In mã"
              type="primary"
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              icon={<PrinterOutlined />}
              onClick={() => {
                message.success(
                  `Đã gửi in ${printQty} mã cho vật tư ${printTarget?.code} (mock)`,
                )
                setPrintOpen(false)
              }}
            />
          </Space>
        }
        destroyOnHidden
      >
        <div className="print-material-box">
          <div className="section-label">Mã vật tư</div>
          <div className="print-material-code">{printTarget?.code}</div>
          <Form layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item label="Số lượng In" required>
              <InputNumber
                min={1}
                max={999}
                value={printQty}
                onChange={(v) => setPrintQty(v || 1)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}
