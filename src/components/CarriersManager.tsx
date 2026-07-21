import { useMemo, useState } from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  message,
  type TableColumnsType,
} from 'antd'
import { PageHeader } from './PageHeader'
import { type Carrier } from '../data/shipping'

type Props = {
  initialRows: Carrier[]
}

export default function CarriersManager({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Carrier | null>(null)
  const [form] = Form.useForm()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q),
    )
  }, [rows, query])

  const columns: TableColumnsType<Carrier> = [
    {
      title: 'Đơn vị vận chuyển',
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.name}</strong>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.code}</span>
        </div>
      ),
    },
    { title: 'Dịch vụ', dataIndex: 'service' },
    {
      title: 'COD',
      dataIndex: 'cod',
      width: 100,
      render: (cod: boolean) => (cod ? <Tag color="blue">Có</Tag> : <Tag>Không</Tag>),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (status: Carrier['status']) =>
        status === 'active' ? (
          <span className="status-active">Đang hoạt động</span>
        ) : (
          <span className="status-inactive">Không hoạt động</span>
        ),
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 110,
      render: (_, row) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(row)
                form.setFieldsValue(row)
                setOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: `Xóa ĐVVC ${row.code}?`,
                  okText: 'Xóa',
                  okButtonProps: { danger: true },
                  cancelText: 'Hủy',
                  onOk: () => {
                    setRows((prev) => prev.filter((item) => item.id !== row.id))
                    message.success('Đã xóa ĐVVC')
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
        title="Đơn vị vận chuyển"
        description="Tạo, sửa, xóa đơn vị vận chuyển (carrier) dùng trong hệ thống."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null)
              form.resetFields()
              form.setFieldsValue({ cod: true, status: 'active', service: 'Standard' })
              setOpen(true)
            }}
          >
            Thêm ĐVVC
          </Button>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Input
            className="search-input"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm mã ĐVVC, tên"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} />
      </div>

      <Modal
        title={editing ? 'Cập nhật đơn vị vận chuyển' : 'Thêm đơn vị vận chuyển'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Thoát"
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editing) {
              setRows((prev) =>
                prev.map((item) => (item.id === editing.id ? { ...item, ...values } : item)),
              )
              message.success('Đã cập nhật ĐVVC')
            } else {
              if (rows.some((r) => r.code === values.code)) {
                message.error('Mã ĐVVC đã tồn tại')
                return
              }
              setRows((prev) => [{ id: String(Date.now()), ...values }, ...prev])
              message.success('Đã tạo ĐVVC')
            }
            setOpen(false)
          }}
        >
          <Form.Item name="code" label="Mã ĐVVC" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} style={{ fontFamily: 'var(--font-mono)' }} />
          </Form.Item>
          <Form.Item name="name" label="Tên ĐVVC" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="service" label="Dịch vụ" rules={[{ required: true }]}>
            <Input placeholder="Standard / Express" />
          </Form.Item>
          <Form.Item name="cod" label="Hỗ trợ COD" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'inactive', label: 'Không hoạt động' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
