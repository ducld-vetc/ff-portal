import { useMemo, useState } from 'react'
import {
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
  type TableColumnsType,
} from 'antd'
import { PageHeader } from '../components/PageHeader'
import { staffMembers, type StaffMember } from '../data/mock'
import { useRoleGroups } from '../data/RoleGroupsContext'

type StaffRow = Omit<StaffMember, 'roles'> & { roleGroupCodes: string[] }

function toRows(source: StaffMember[]): StaffRow[] {
  return source.map((item) => ({
    ...item,
    roleGroupCodes: item.roles,
  }))
}

export default function StaffPage() {
  const { options, roleGroups } = useRoleGroups()
  const [rows, setRows] = useState<StaffRow[]>(() => toRows(staffMembers))
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<StaffRow | null>(null)
  const [form] = Form.useForm()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchStatus = status === 'all' || row.status === status
      const matchQuery =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.username.toLowerCase().includes(q) ||
        row.roleGroupCodes.some((r) => r.toLowerCase().includes(q))
      return matchStatus && matchQuery
    })
  }, [rows, query, status])

  const columns: TableColumnsType<StaffRow> = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.name}</strong>
          <span>{row.username}</span>
        </div>
      ),
    },
    {
      title: 'Nhóm quyền',
      dataIndex: 'roleGroupCodes',
      render: (codes: string[]) =>
        codes.length ? (
          <Space size={[0, 4]} wrap>
            {codes.map((code) => {
              const group = roleGroups.find((g) => g.code === code)
              return (
                <Tag key={code} color={group?.isSystem ? 'gold' : 'blue'} className="role-tag">
                  {group?.name ?? code}
                </Tag>
              )
            })}
          </Space>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
        ),
    },
    {
      title: 'Customer scope',
      dataIndex: 'customerScope',
      width: 140,
    },
    {
      title: 'Warehouse scope',
      dataIndex: 'warehouseScope',
      width: 150,
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'lastLoginAt',
      width: 170,
      render: (value: string | null) =>
        value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (value: StaffRow['status']) =>
        value === 'active' ? (
          <span className="status-active">Đang hoạt động</span>
        ) : (
          <span className="status-inactive">Không hoạt động</span>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, row) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(row)
                form.setFieldsValue(row)
                setOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Button
              type="text"
              icon={<LockOutlined />}
              onClick={() => message.success(`Đã gửi mật khẩu tạm cho ${row.username}`)}
            />
          </Tooltip>
          <Tooltip title={row.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              type="text"
              danger={row.status === 'active'}
              icon={<StopOutlined />}
              onClick={() => {
                setRows((prev) =>
                  prev.map((item) =>
                    item.id === row.id
                      ? {
                          ...item,
                          status: item.status === 'active' ? 'inactive' : 'active',
                        }
                      : item,
                  ),
                )
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
        title="Quản lý nhân sự"
        description="Tạo người dùng và gán nhóm quyền đã cấu hình ở Quản lý nhóm quyền."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null)
              form.resetFields()
              form.setFieldsValue({
                roleGroupCodes: [],
                customerScope: 'Toàn cục',
                warehouseScope: 'Toàn cục',
                status: 'active',
              })
              setOpen(true)
            }}
          >
            Tạo nhân viên
          </Button>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <Input
              className="search-input"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm tên, username, nhóm quyền"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              style={{ width: 180 }}
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'inactive', label: 'Không hoạt động' },
              ]}
            />
          </div>
          <Button icon={<ReloadOutlined />} onClick={() => message.info('Đã làm mới danh sách')}>
            Làm mới
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      <Modal
        title={editing ? 'Cập nhật nhân viên' : 'Tạo nhân viên'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? 'Lưu' : 'Tạo'}
        destroyOnHidden
        width={640}
      >
        <Form
          form={form}
          layout="vertical"
          className="form-grid"
          onFinish={(values) => {
            if (editing) {
              setRows((prev) =>
                prev.map((item) => (item.id === editing.id ? { ...item, ...values } : item)),
              )
              message.success('Đã cập nhật nhân viên')
            } else {
              setRows((prev) => [
                {
                  id: String(Date.now()),
                  lastLoginAt: null,
                  ...values,
                },
                ...prev,
              ])
              message.success('Đã tạo nhân viên')
            }
            setOpen(false)
          }}
        >
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="roleGroupCodes"
            label="Nhóm quyền"
            rules={[{ required: true, message: 'Chọn ít nhất một nhóm quyền' }]}
            style={{ gridColumn: '1 / -1' }}
          >
            <Select
              mode="multiple"
              options={options}
              placeholder="Chọn nhóm quyền đã tạo"
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="customerScope" label="Customer scope" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="warehouseScope" label="Warehouse scope" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
