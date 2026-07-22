import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Input, Modal, Space, Table, Tag, message, type TableColumnsType } from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { useRoleGroups, type RoleGroup } from '../data/RoleGroupsContext'
import { ALL_PERMISSION_KEYS } from '../data/permissions'

export default function RoleGroupsPage() {
  const navigate = useNavigate()
  const { roleGroups, deleteGroup } = useRoleGroups()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return roleGroups
    return roleGroups.filter(
      (g) =>
        g.code.toLowerCase().includes(q) ||
        g.name.toLowerCase().includes(q) ||
        (g.description ?? '').toLowerCase().includes(q),
    )
  }, [roleGroups, query])

  const columns: TableColumnsType<RoleGroup> = [
    {
      title: 'Nhóm quyền',
      render: (_, row) => (
        <div className="entity-copy">
          <strong>
            {row.name}{' '}
            {row.isSystem ? (
              <Tag color="gold" icon={<LockOutlined />} style={{ marginLeft: 6 }}>
                Hệ thống
              </Tag>
            ) : null}
          </strong>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.code}</span>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      render: (value?: string) => value || '—',
    },
    {
      title: 'Số quyền',
      width: 120,
      render: (_, row) => (
        <Tag color="blue" className="role-tag">
          {row.isSystem ? ALL_PERMISSION_KEYS.length : row.permissionKeys.length}/
          {ALL_PERMISSION_KEYS.length}
        </Tag>
      ),
    },
    {
      title: 'Nhân sự',
      dataIndex: 'userCount',
      width: 100,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      width: 170,
      render: (value: string) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      render: (_, row) => (
        <Space>
          <IconAction
            title={row.isSystem ? 'Xem / cập nhật tên' : 'Cập nhật'}
            icon={<EditOutlined />}
            onClick={() => navigate(`/staff/roles/${row.id}`)}
          />
          <IconAction
            title={row.isSystem ? 'Không thể xóa nhóm hệ thống' : 'Xóa'}
            danger
            disabled={row.isSystem}
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: `Xóa nhóm quyền ${row.code}?`,
                content: 'Nhân viên đang gán nhóm này sẽ cần được gán lại.',
                okText: 'Xóa',
                okButtonProps: { danger: true },
                cancelText: 'Hủy',
                onOk: () => {
                  if (deleteGroup(row.id)) message.success('Đã xóa nhóm quyền')
                  else message.error('Không thể xóa nhóm này')
                },
              })
            }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Quản lý nhóm quyền"
        description="Tạo và cấu hình quyền theo từng màn hình. SUPER_ADMIN luôn có đầy đủ quyền hệ thống."
        extra={
          <IconAction
            title="Tạo nhóm quyền"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/staff/roles/new')}
          />
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Input
            className="search-input"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm mã nhóm, tên nhóm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Tag icon={<SafetyCertificateOutlined />} color="processing">
            {roleGroups.length} nhóm
          </Tag>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </div>
  )
}
