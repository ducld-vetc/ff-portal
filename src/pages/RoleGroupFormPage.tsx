import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Col, Form, Input, Row, Space, Tabs, message } from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import PermissionTree from '../components/PermissionTree'
import { useRoleGroups } from '../data/RoleGroupsContext'
import { ALL_PERMISSION_KEYS } from '../data/permissions'

export default function RoleGroupFormPage() {
  const { id } = useParams()
  const isCreate = id === 'new' || !id
  const navigate = useNavigate()
  const { getById, getByCode, createGroup, updateGroup } = useRoleGroups()
  const existing = !isCreate && id ? getById(id) : undefined
  const [form] = Form.useForm()
  const [permissionKeys, setPermissionKeys] = useState<string[]>([])

  useEffect(() => {
    if (!isCreate && !existing) {
      message.error('Không tìm thấy nhóm quyền')
      navigate('/staff/roles', { replace: true })
      return
    }
    if (existing) {
      form.setFieldsValue({
        code: existing.code,
        name: existing.name,
        description: existing.description,
      })
      setPermissionKeys(existing.isSystem ? [...ALL_PERMISSION_KEYS] : existing.permissionKeys)
    } else {
      form.resetFields()
      setPermissionKeys([])
    }
  }, [existing, form, isCreate, navigate])

  const title = useMemo(() => {
    if (isCreate) return 'Tạo nhóm quyền'
    if (existing?.isSystem) return 'Cập nhật nhóm quyền (hệ thống)'
    return 'Cập nhật nhóm quyền'
  }, [existing?.isSystem, isCreate])

  const onSave = async () => {
    try {
      const values = await form.validateFields()
      const code = String(values.code).trim().toUpperCase().replace(/\s+/g, '_')

      if (isCreate) {
        if (getByCode(code)) {
          message.error('Mã nhóm đã tồn tại')
          return
        }
        if (code === 'SUPER_ADMIN') {
          message.error('SUPER_ADMIN là nhóm hệ thống, không thể tạo thêm')
          return
        }
        if (!permissionKeys.length) {
          message.warning('Chọn ít nhất một quyền')
          return
        }
        const created = createGroup({
          code,
          name: values.name,
          description: values.description,
          permissionKeys,
        })
        message.success('Đã tạo nhóm quyền')
        navigate(`/staff/roles/${created.id}`, { replace: true })
        return
      }

      if (!existing) return

      updateGroup(existing.id, {
        code: existing.isSystem ? existing.code : code,
        name: values.name,
        description: values.description,
        permissionKeys: existing.isSystem ? [...ALL_PERMISSION_KEYS] : permissionKeys,
      })
      message.success('Đã lưu nhóm quyền')
      navigate('/staff/roles')
    } catch {
      /* validation */
    }
  }

  return (
    <div className="role-group-page">
      <PageHeader
        title={title}
        description={
          existing?.isSystem
            ? 'Nhóm SUPER_ADMIN mặc định — luôn thao tác được mọi màn hình.'
            : 'Đặt mã/tên nhóm và chọn quyền theo từng màn hình.'
        }
        extra={
          <Space>
            <IconAction title="Lưu" type="primary" icon={<SaveOutlined />} onClick={onSave} />
            <IconAction
              title="Thoát"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/staff/roles')}
            />
          </Space>
        }
      />

      <div className="content-card role-group-card">
        <Form form={form} layout="vertical" requiredMark>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="code"
                label="Mã nhóm"
                required
                rules={[
                  { required: true, message: 'Nhập mã nhóm' },
                  {
                    pattern: /^[A-Za-z0-9_\-]+$/,
                    message: 'Chỉ dùng chữ, số, gạch dưới/ngang',
                  },
                ]}
              >
                <Input
                  placeholder="VD: WAREHOUSE_OPS"
                  disabled={existing?.isSystem}
                  className="mono-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên nhóm"
                required
                rules={[{ required: true, message: 'Nhập tên nhóm' }]}
              >
                <Input placeholder="VD: Vận hành kho" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={2} placeholder="Mô tả ngắn về phạm vi quyền" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Tabs
          className="role-group-tabs"
          items={[
            {
              key: 'permissions',
              label: 'PHÂN QUYỀN',
              children: (
                <PermissionTree
                  value={permissionKeys}
                  onChange={setPermissionKeys}
                  forceAll={existing?.isSystem}
                  readOnly={existing?.isSystem}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
