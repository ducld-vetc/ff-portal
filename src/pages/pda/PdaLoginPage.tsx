import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Form, Input, Select, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { inboundWarehouseOptions } from '../../data/inboundRequests'
import { pdaSamples } from '../../data/pdaSampleData'
import { PdaWorkspaceShell, usePdaSamplePanel } from '../../pda/components/PdaSampleSlot'
import { PdaProvider, usePda } from '../../pda/PdaContext'
import { PdaTheme } from '../../pda/PdaTheme'
import '../../pda/pda.css'

function PdaLoginForm() {
  const { login, auth } = usePda()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  usePdaSamplePanel(pdaSamples.login)

  if (auth) return <Navigate to="/pda/home" replace />

  return (
    <div className="pda-login-page">
      <div className="pda-login-hero">
        <div className="pda-login-mark">
          <InboxOutlined />
        </div>
        <h1>WAREHOUSE OPS</h1>
        <div className="by-ai">BY AI</div>
      </div>

      <div className="pda-login-card">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            username: 'ops',
            password: '1234',
            warehouseCode: 'KBL',
          }}
          onFinish={(values) => {
            const result = login({
              username: values.username,
              password: values.password,
              warehouseCode: values.warehouseCode,
            })
            if (!result.ok) {
              message.error(result.error)
              return
            }
            message.success('Đăng nhập thành công')
            navigate('/pda/home')
          }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Nhập username' }]}
          >
            <Input size="large" placeholder="ops" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Nhập mật khẩu' }]}
          >
            <Input.Password size="large" placeholder="••••" autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="warehouseCode"
            label="Kho (X-Warehouse-Id)"
            rules={[{ required: true, message: 'Chọn kho' }]}
          >
            <Select size="large" options={inboundWarehouseOptions} />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            Đăng nhập
          </Button>
        </Form>

        <div className="pda-footer-link">
          <a href="/login">← Control Center</a>
        </div>
      </div>
    </div>
  )
}

export default function PdaLoginPage() {
  return (
    <PdaProvider>
      <PdaTheme>
        <PdaWorkspaceShell>
          <PdaLoginForm />
        </PdaWorkspaceShell>
      </PdaTheme>
    </PdaProvider>
  )
}
