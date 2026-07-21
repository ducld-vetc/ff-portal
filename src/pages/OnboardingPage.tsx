import { useState } from 'react'
import { CheckCircleOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Row, Select, Steps, message } from 'antd'
import { PageHeader } from '../components/PageHeader'
import CustomerShippingConfig, {
  type CustomerCarrierConfig,
} from '../components/CustomerShippingConfig'

const steps = [
  { title: 'Hồ sơ khách hàng', content: 'Thông tin pháp lý & liên hệ' },
  { title: 'Gán kho', content: 'Chọn kho vận hành' },
  { title: 'Cấu hình dịch vụ', content: 'Inbound / outbound / COD' },
  { title: 'ĐVVC & tài khoản', content: 'Đơn vị VC và tài khoản' },
  { title: 'Hoàn tất', content: 'Kích hoạt tenant' },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()
  const [shipping, setShipping] = useState<CustomerCarrierConfig>({
    carrierCodes: [],
    accountIds: [],
  })

  return (
    <div>
      <PageHeader
        title="Onboarding khách hàng mới"
        description="Wizard khởi tạo customer, gán kho, dịch vụ và cấu hình đơn vị vận chuyển."
      />

      <div className="content-card wizard-card">
        <Steps className="wizard-steps" current={current} items={steps} />

        {current === 0 && (
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="code" label="Mã khách hàng" rules={[{ required: true }]}>
                  <Input placeholder="CUS-004" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true }]}>
                  <Input placeholder="Công ty ABC" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="taxCode" label="Mã số thuế">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="contact" label="Người liên hệ">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="email" label="Email vận hành">
                  <Input type="email" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}

        {current === 1 && (
          <Form layout="vertical">
            <Form.Item label="Kho được gán" required>
              <Select
                mode="multiple"
                placeholder="Chọn kho"
                options={[
                  { value: 'WH-HCM-01', label: 'WH-HCM-01 · Kho HCM Quận 7' },
                  { value: 'WH-HN-01', label: 'WH-HN-01 · Kho Hà Nội Đông Anh' },
                  { value: 'WH-DN-01', label: 'WH-DN-01 · Kho Đà Nẵng' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Kho nhập mặc định">
              <Select
                options={[
                  { value: 'WH-HCM-01', label: 'WH-HCM-01' },
                  { value: 'WH-HN-01', label: 'WH-HN-01' },
                ]}
              />
            </Form.Item>
          </Form>
        )}

        {current === 2 && (
          <div className="form-grid">
            {[
              ['Nhập hàng', 'Receiving & putaway'],
              ['Lấy hàng', 'Wave picking'],
              ['Đóng gói', 'Packing station'],
              ['Bàn giao', 'Carrier handover'],
              ['COD', 'Thu hộ'],
              ['Hàng hoàn', 'Return flow'],
            ].map(([title, desc]) => (
              <Card key={title} size="small" className="dashboard-card">
                <strong>{title}</strong>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 4 }}>
                  {desc}
                </div>
              </Card>
            ))}
          </div>
        )}

        {current === 3 && (
          <CustomerShippingConfig value={shipping} onChange={setShipping} customerId="new" />
        )}

        {current === 4 && (
          <Card>
            <CheckCircleOutlined style={{ fontSize: 42, color: '#16a34a' }} />
            <h3 style={{ marginTop: 12 }}>Sẵn sàng kích hoạt</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>
              Kiểm tra lại thông tin rồi bấm hoàn tất để tạo customer trên Control Center.
            </p>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              ĐVVC đã chọn: <strong>{shipping.carrierCodes.join(', ') || '—'}</strong>
              {' · '}
              Tài khoản: <strong>{shipping.accountIds.length}</strong>
            </p>
          </Card>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <Button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            Quay lại
          </Button>
          {current < steps.length - 1 ? (
            <Button type="primary" icon={<RightOutlined />} onClick={() => setCurrent((c) => c + 1)}>
              Tiếp tục
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                message.success('Đã hoàn tất onboarding (mock)')
                setCurrent(0)
                form.resetFields()
                setShipping({ carrierCodes: [], accountIds: [] })
              }}
            >
              Hoàn tất
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
