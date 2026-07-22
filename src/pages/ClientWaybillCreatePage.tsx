import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloseOutlined, DeleteOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { seedCatalogProducts } from '../data/productCatalog'
import { goodsConditionLabel } from '../data/outboundRequests'
import {
  deliveryAddressOptions,
  generateWaybillCode,
  pickupAddressOptions,
  shippingPackageOptions,
  upsertWaybill,
  waybillLineAmount,
  waybillPartnerOptions,
  waybillTotal,
  type Waybill,
  type WaybillLine,
} from '../data/waybills'

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="product-thumb-img" />
  return <div className="product-thumb">{label.slice(0, 2).toUpperCase()}</div>
}

export default function ClientWaybillCreatePage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [lines, setLines] = useState<WaybillLine[]>([])
  const [productOpen, setProductOpen] = useState(false)
  const [productQuery, setProductQuery] = useState('')
  const [goodsCondition, setGoodsCondition] = useState<'new' | 'used' | 'damaged'>('new')
  const cod = Form.useWatch('cod', form) ?? 0
  const declaredValue = Form.useWatch('declaredValue', form)

  const catalogHits = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return seedCatalogProducts
    return seedCatalogProducts.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        (p.partnerSku || '').toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q),
    )
  }, [productQuery])

  const total = waybillTotal(lines)

  const addProduct = (productId: string) => {
    const product = seedCatalogProducts.find((p) => p.id === productId)
    if (!product) return
    setLines((prev) => [
      ...prev,
      {
        id: `wbl-${Date.now()}-${product.id}`,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        partnerSku: product.partnerSku,
        imageUrl: product.imageUrl,
        unitLabel: product.units[0] || 'Cái',
        goodsCondition,
        qty: 1,
        unitPrice: 0,
      },
    ])
    setProductOpen(false)
    setProductQuery('')
    message.success(`Đã thêm ${product.sku}`)
  }

  const columns: TableColumnsType<WaybillLine> = [
    { title: '#', width: 48, render: (_, __, i) => i + 1 },
    {
      title: 'Sản phẩm',
      render: (_, row) => (
        <Space align="start">
          <ProductThumb src={row.imageUrl} label={row.sku} />
          <div>
            <div>{row.name}</div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              SKU (barcode): <span style={{ fontFamily: 'var(--font-mono)' }}>{row.sku}</span>
              {row.partnerSku ? (
                <>
                  {' '}
                  · SKU đối tác:{' '}
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{row.partnerSku}</span>
                </>
              ) : null}
            </Typography.Text>
            <div>
              <Tag>
                {row.unitLabel || 'Cái'} · {goodsConditionLabel[row.goodsCondition]}
              </Tag>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số lượng (1)',
      width: 120,
      render: (_, row) => (
        <InputNumber
          min={1}
          value={row.qty}
          style={{ width: '100%' }}
          onChange={(v) =>
            setLines((prev) =>
              prev.map((item) => (item.id === row.id ? { ...item, qty: v ?? 1 } : item)),
            )
          }
        />
      ),
    },
    {
      title: 'Đơn giá (2)',
      width: 130,
      render: (_, row) => (
        <InputNumber
          min={0}
          value={row.unitPrice}
          style={{ width: '100%' }}
          onChange={(v) =>
            setLines((prev) =>
              prev.map((item) =>
                item.id === row.id ? { ...item, unitPrice: v ?? 0 } : item,
              ),
            )
          }
        />
      ),
    },
    {
      title: 'Thành tiền (1)×(2)',
      width: 140,
      align: 'right',
      render: (_, row) => waybillLineAmount(row).toLocaleString('vi-VN'),
    },
    {
      title: '',
      width: 56,
      render: (_, row) => (
        <IconAction
          title="Xóa dòng"
          danger
          icon={<DeleteOutlined />}
          onClick={() => setLines((prev) => prev.filter((item) => item.id !== row.id))}
        />
      ),
    },
  ]

  const submit = async () => {
    try {
      const values = await form.validateFields()
      if (lines.length === 0) {
        message.error('Vui lòng thêm ít nhất một sản phẩm')
        return
      }
      const deliveryLabel =
        deliveryAddressOptions.find((a) => a.value === values.deliveryAddress)?.label ||
        values.deliveryAddress

      const next: Waybill = {
        id: `wb-${Date.now()}`,
        code: generateWaybillCode(),
        partnerWaybillCode: values.internalCode || '',
        partnerCode: values.pickupPartner,
        pickupAddressCode: values.pickupAddress,
        contactName: values.pickupPerson,
        contactPhone: values.pickupPhone,
        recipientName: values.deliveryPerson,
        recipientPhone: values.deliveryPhone,
        recipientAddress: deliveryLabel,
        cod: values.cod != null ? Number(values.cod) : null,
        orderValue: total || null,
        status: 'new',
        createdAt: new Date().toISOString(),
        internalCode: values.internalCode,
        shippingPackage: values.shippingPackage,
        weightKg: Number(values.weightKg) || 0,
        note: values.note,
        declaredValue: Number(values.declaredValue) || total,
        pickupPartner: values.pickupPartner,
        pickupAddress: values.pickupAddress,
        pickupPerson: values.pickupPerson,
        pickupPhone: values.pickupPhone,
        pickupEmail: values.pickupEmail,
        deliveryPartner: values.deliveryPartner,
        deliveryAddress: values.deliveryAddress,
        deliveryPerson: values.deliveryPerson,
        deliveryPhone: values.deliveryPhone,
        deliveryEmail: values.deliveryEmail,
        lines,
      }
      upsertWaybill(next)
      message.success(`Đã tạo vận đơn ${next.code}. Có thể in nhãn vận chuyển từ danh sách.`)
      navigate(`/client/operations/waybills/${next.id}`)
    } catch {
      /* validation */
    }
  }

  return (
    <div>
      <PageHeader
        title="Tạo vận đơn"
        description="Thêm sản phẩm, thông tin lấy/nhận hàng và gói vận chuyển. Các mục * là bắt buộc."
        extra={
          <IconAction
            title="Thoát"
            icon={<CloseOutlined />}
            onClick={() => navigate('/client/operations/waybills')}
          />
        }
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          weightKg: 0,
          cod: 0,
          declaredValue: 0,
          pickupPartner: 'TGDD',
          pickupAddress: 'CHM567028',
          shippingPackage: undefined,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <div className="content-card inbound-section-card">
              <div className="table-toolbar" style={{ marginBottom: 12 }}>
                <h3 className="inbound-section-title" style={{ margin: 0 }}>
                  Chi tiết vận đơn
                </h3>
                <IconAction
                  title="Thêm sản phẩm"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setProductOpen(true)}
                />
              </div>

              <Table
                rowKey="id"
                size="middle"
                pagination={false}
                dataSource={lines}
                columns={columns}
                locale={{ emptyText: 'Chưa có sản phẩm — chọn “+ Thêm sản phẩm”' }}
                scroll={{ x: 900 }}
              />

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col xs={24} md={12}>
                  <Form.Item name="weightKg" label="Trọng lượng (Kg)">
                    <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Ghi chú" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <div className="outbound-totals">
                    <div className="outbound-totals-row">
                      <span>Tổng cộng (A)</span>
                      <strong>{total.toLocaleString('vi-VN')}</strong>
                    </div>
                    <div className="outbound-totals-row">
                      <span>COD</span>
                      <Form.Item name="cod" noStyle>
                        <InputNumber min={0} style={{ width: 140 }} />
                      </Form.Item>
                    </div>
                    <div className="outbound-totals-row">
                      <span>Khai giá</span>
                      <Form.Item name="declaredValue" noStyle>
                        <InputNumber
                          min={0}
                          style={{ width: 140 }}
                          placeholder={String(total)}
                        />
                      </Form.Item>
                    </div>
                    {(Number(cod) > 0 || Number(declaredValue) > 0) && (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        Thu hộ: {(Number(cod) || 0).toLocaleString('vi-VN')} VND
                      </Typography.Text>
                    )}
                  </div>
                </Col>
              </Row>
            </div>

            <div className="content-card inbound-section-card" style={{ marginTop: 16 }}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <h3 className="inbound-section-title">Thông tin lấy hàng</h3>
                  <Form.Item
                    name="pickupPartner"
                    label="Đối tác lấy hàng"
                    rules={[{ required: true, message: 'Chọn đối tác lấy hàng' }]}
                  >
                    <Select options={waybillPartnerOptions} />
                  </Form.Item>
                  <Form.Item
                    name="pickupAddress"
                    label="Địa chỉ lấy hàng"
                    rules={[{ required: true, message: 'Chọn địa chỉ lấy hàng' }]}
                  >
                    <Select options={pickupAddressOptions} />
                  </Form.Item>
                  <Form.Item
                    name="pickupPerson"
                    label="Người lấy"
                    rules={[{ required: true, message: 'Nhập người lấy' }]}
                  >
                    <Input placeholder="Người lấy" />
                  </Form.Item>
                  <Form.Item
                    name="pickupPhone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Nhập số điện thoại' }]}
                  >
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>
                  <Form.Item name="pickupEmail" label="Email">
                    <Input placeholder="Email" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <h3 className="inbound-section-title">Thông tin nhận hàng</h3>
                  <Form.Item
                    name="deliveryAddress"
                    label="Địa chỉ nhận hàng"
                    rules={[{ required: true, message: 'Chọn địa chỉ nhận hàng' }]}
                  >
                    <Select
                      options={deliveryAddressOptions}
                      suffixIcon={<EnvironmentOutlined style={{ color: '#1677ff' }} />}
                    />
                  </Form.Item>
                  <Form.Item
                    name="deliveryPerson"
                    label="Người nhận"
                    rules={[{ required: true, message: 'Nhập người nhận' }]}
                  >
                    <Input placeholder="Người nhận" />
                  </Form.Item>
                  <Form.Item
                    name="deliveryPhone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Nhập số điện thoại' }]}
                  >
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>
                  <Form.Item name="deliveryPartner" label="Đối tác nhận hàng">
                    <Select allowClear options={waybillPartnerOptions} placeholder="Tùy chọn" />
                  </Form.Item>
                  <Form.Item name="deliveryEmail" label="Email">
                    <Input placeholder="Email" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="content-card inbound-section-card">
              <Form.Item name="internalCode" label="Mã vận đơn nội bộ">
                <Input placeholder="Mã vận đơn nội bộ" />
              </Form.Item>
              <Form.Item
                name="shippingPackage"
                label="Gói vận chuyển"
                rules={[{ required: true, message: 'Chọn gói vận chuyển' }]}
              >
                <Select
                  placeholder="Chọn gói vận chuyển"
                  options={shippingPackageOptions}
                />
              </Form.Item>
            </div>

            <div className="inbound-create-footer" style={{ justifyContent: 'flex-start' }}>
              <Space>
                <IconAction
                  title="Thoát"
                  icon={<CloseOutlined />}
                  onClick={() => navigate('/client/operations/waybills')}
                />
                <IconAction
                  title="Thêm"
                  type="primary"
                  className="btn-success"
                  icon={<PlusOutlined />}
                  onClick={submit}
                />
              </Space>
            </div>
          </Col>
        </Row>
      </Form>

      <Modal
        open={productOpen}
        title="Thêm sản phẩm"
        onCancel={() => setProductOpen(false)}
        footer={null}
        width={640}
        destroyOnHidden
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Select
            style={{ width: 200 }}
            value={goodsCondition}
            onChange={setGoodsCondition}
            options={[
              { value: 'new', label: 'Mới' },
              { value: 'used', label: 'Đã qua sử dụng' },
              { value: 'damaged', label: 'Hư hỏng' },
            ]}
          />
          <Select
            showSearch
            autoFocus
            placeholder="Tìm SKU / SKU đối tác / tên sản phẩm"
            style={{ width: '100%' }}
            filterOption={false}
            searchValue={productQuery}
            onSearch={setProductQuery}
            onSelect={(value) => addProduct(String(value))}
            options={catalogHits.map((p) => ({
              value: p.id,
              label: `${p.sku} · ${p.name}`,
            }))}
            optionRender={(option) => {
              const p = seedCatalogProducts.find((item) => item.id === option.value)
              return (
                <Space>
                  <ProductThumb src={p?.imageUrl} label={p?.sku || ''} />
                  <span>
                    <div style={{ fontFamily: 'var(--font-mono)' }}>{p?.sku}</div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {p?.name}
                    </Typography.Text>
                  </span>
                </Space>
              )
            }}
          />
        </Space>
      </Modal>
    </div>
  )
}
