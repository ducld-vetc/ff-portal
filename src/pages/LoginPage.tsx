import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Typography, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '../auth/AuthContext'
import { BrandMark } from '../components/PageHeader'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from || '/dashboard'

  return (
    <div className="login-page">
      <Card className="login-card" variant="borderless">
        <div className="login-brand">
          <BrandMark size={54} fontSize={25} />
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              FulfillOne
            </Typography.Title>
            <Typography.Text type="secondary">Fulfillment Control Center</Typography.Text>
          </div>
        </div>

        {error ? (
          <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />
        ) : null}

        <Form
          layout="vertical"
          requiredMark={false}
          initialValues={{ username: 'admin', password: 'ops123456' }}
          onFinish={async (values) => {
            setLoading(true)
            setError(null)
            try {
              await login(values.username, values.password)
              message.success('Đăng nhập thành công')
              navigate(from, { replace: true })
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
            } finally {
              setLoading(false)
            }
          }}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Nhập tên đăng nhập' }]}
          >
            <Input size="large" prefix={<UserOutlined />} placeholder="admin" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Nhập mật khẩu' }]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Đăng nhập
          </Button>
        </Form>
      </Card>
      <span className="login-footer">© 2026 FulfillOne · Vận hành fulfillment thông minh</span>
    </div>
  )
}
