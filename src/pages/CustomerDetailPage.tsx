import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  ProductOutlined,
} from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Form,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd'
import CustomerShippingConfig, {
  type CustomerCarrierConfig,
} from '../components/CustomerShippingConfig'
import { getCustomerShipping, setCustomerShipping } from '../data/customerShipping'
import { customers, products, staffMembers, warehouses } from '../data/mock'

function InfoCell({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="info-cell">
      <div className="info-cell-label">{label}</div>
      <div className="info-cell-value">{value === '' || value == null ? '—' : value}</div>
    </div>
  )
}

export default function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const customer = customers.find((c) => c.id === id)

  const [shipping, setShipping] = useState<CustomerCarrierConfig>(() =>
    getCustomerShipping(id || ''),
  )
  const [serviceForm] = Form.useForm()

  const assignedWarehouses = useMemo(
    () => warehouses.filter((w) => w.customer === customer?.legalName || w.customer === customer?.name),
    [customer],
  )

  const customerProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.customer === customer?.name ||
          p.customer === customer?.legalName ||
          (customer?.id === '1' && p.customer.includes('EverCharge')) ||
          (customer?.id === '2' && p.customer.includes('GreenMart')),
      ),
    [customer],
  )

  const customerStaff = useMemo(
    () =>
      staffMembers.filter(
        (s) => s.customerScope === 'Toàn cục' || s.customerScope === customer?.id,
      ),
    [customer],
  )

  if (!customer) {
    return (
      <div className="content-card">
        <Empty description="Không tìm thấy khách hàng" />
        <Button type="link" onClick={() => navigate('/customers')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const statusLabel =
    customer.status === 'active'
      ? 'Đang hoạt động'
      : customer.status === 'draft'
        ? 'Bản nháp'
        : 'Không hoạt động'

  return (
    <div className="customer-detail-page">
      <div className="section-toolbar" style={{ marginBottom: 12 }}>
        <div>
          <Breadcrumb
            items={[
              { title: <Link to="/customers">Khách hàng</Link> },
              { title: customer.name },
            ]}
            style={{ marginBottom: 8 }}
          />
          <h2 style={{ margin: 0 }}>{customer.name}</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)' }}>
            {customer.code} · {customer.legalName}
          </p>
        </div>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>
            Danh sách
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => message.info('Chế độ chỉnh sửa (mock)')}
          >
            Chỉnh sửa
          </Button>
        </Space>
      </div>

      <div className="content-card customer-detail-card">
        <Space wrap style={{ marginBottom: 12 }}>
          <Tag color={customer.status === 'active' ? 'success' : 'default'}>{statusLabel}</Tag>
          {customer.capabilities.map((cap) => (
            <Tag key={cap} color="blue">
              {cap}
            </Tag>
          ))}
        </Space>

        <Tabs
          items={[
            {
              key: 'overview',
              label: 'Tổng quan',
              children: (
                <div className="info-grid">
                  <InfoCell label="Tên pháp lý" value={customer.legalName} />
                  <InfoCell label="Mã số thuế" value={customer.taxCode} />
                  <InfoCell label="Email" value={customer.email} />
                  <InfoCell label="Điện thoại" value={customer.phone} />
                  <InfoCell label="Địa chỉ" value={customer.address} />
                  <InfoCell label="Số sản phẩm" value={customer.productCount} />
                  <InfoCell
                    label="Ngày tạo"
                    value={new Date(customer.createdAt).toLocaleString('vi-VN')}
                  />
                </div>
              ),
            },
            {
              key: 'services',
              label: 'Cấu hình dịch vụ',
              children: (
                <Form
                  form={serviceForm}
                  layout="vertical"
                  initialValues={{
                    services: customer.capabilities,
                  }}
                  onFinish={() => message.success('Đã lưu cấu hình dịch vụ')}
                >
                  <Form.Item name="services" label="Dịch vụ được bật">
                    <Checkbox.Group
                      options={[
                        'Quản lý sản phẩm',
                        'Nhập hàng',
                        'Xuất hàng',
                        'COD',
                        'Hàng hoàn',
                        'Bàn giao ĐVVC',
                      ]}
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Lưu cấu hình
                  </Button>
                </Form>
              ),
            },
            {
              key: 'warehouses',
              label: `Kho được gán (${assignedWarehouses.length || customer.warehouses})`,
              children: (
                <Table
                  rowKey="id"
                  pagination={false}
                  dataSource={assignedWarehouses}
                  locale={{ emptyText: 'Chưa gán kho' }}
                  columns={[
                    {
                      title: 'Kho',
                      render: (_, row) => (
                        <div className="entity-copy">
                          <strong>{row.name}</strong>
                          <span>{row.code}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Địa chỉ',
                      dataIndex: 'address',
                      render: (value: string) => (
                        <span>
                          <EnvironmentOutlined style={{ marginRight: 6 }} />
                          {value}
                        </span>
                      ),
                    },
                    { title: 'Zones', dataIndex: 'zones', width: 90 },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      width: 140,
                      render: (status: string) =>
                        status === 'active' ? (
                          <Tag color="success">Đang hoạt động</Tag>
                        ) : (
                          <Tag>Không hoạt động</Tag>
                        ),
                    },
                  ]}
                />
              ),
            },
            {
              key: 'skus',
              label: 'Danh sách SKU',
              children: (
                <Table
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                  dataSource={customerProducts}
                  locale={{ emptyText: 'Chưa có SKU' }}
                  columns={[
                    {
                      title: 'SKU',
                      render: (_, row) => (
                        <div className="entity-copy">
                          <strong>{row.name}</strong>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.sku}</span>
                        </div>
                      ),
                    },
                    { title: 'Barcode', dataIndex: 'barcode', width: 160 },
                    {
                      title: 'Khối lượng (kg)',
                      dataIndex: 'weightKg',
                      width: 130,
                      render: (v: number) => v.toFixed(2),
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      width: 120,
                      render: (status: string) =>
                        status === 'active' ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
                    },
                  ]}
                />
              ),
            },
            {
              key: 'shipping',
              label: 'Đơn vị vận chuyển',
              children: (
                <CustomerShippingConfig
                  customerId={customer.id}
                  value={shipping}
                  onChange={(next) => {
                    setShipping(next)
                    setCustomerShipping(customer.id, next)
                  }}
                />
              ),
            },
            {
              key: 'contacts',
              label: 'Liên hệ & địa chỉ',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card size="small" title="Người liên hệ">
                      <InfoCell label="Họ tên" value={customer.contact} />
                      <InfoCell label="Email" value={customer.email} />
                      <InfoCell label="Điện thoại" value={customer.phone} />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="Địa chỉ">
                      <InfoCell label="Địa chỉ pháp lý" value={customer.address || 'Chưa cập nhật'} />
                      <InfoCell label="Mã số thuế" value={customer.taxCode} />
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'accounts',
              label: 'Tài khoản',
              children: (
                <Table
                  rowKey="id"
                  pagination={false}
                  dataSource={customerStaff.slice(0, 8)}
                  locale={{ emptyText: 'Chưa có tài khoản gắn với khách hàng' }}
                  columns={[
                    {
                      title: 'Nhân viên',
                      render: (_, row) => (
                        <div className="entity-copy">
                          <strong>{row.name}</strong>
                          <span>{row.username}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Nhóm quyền',
                      render: (_, row) =>
                        row.roles.length ? row.roles.join(', ') : '—',
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      width: 140,
                      render: (status: string) =>
                        status === 'active' ? (
                          <span className="status-active">Đang hoạt động</span>
                        ) : (
                          <span className="status-inactive">Không hoạt động</span>
                        ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>

      <div className="customer-detail-footnote">
        <HomeOutlined /> {assignedWarehouses.length || customer.warehouses} kho ·{' '}
        <ProductOutlined /> {customerProducts.length || customer.productCount} SKU
      </div>
    </div>
  )
}
