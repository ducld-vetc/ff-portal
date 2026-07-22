import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CloseOutlined, DeleteOutlined, FormOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import {
  deliveryMethodLabel,
  generateOutboundCode,
  getOutboundRequest,
  goodsConditionLabel,
  lineAmount,
  outboundPriorityLabel,
  outboundTotals,
  outboundWarehouseOptions,
  productAvailableQty,
  shippingPackageOptions,
  upsertOutboundRequest,
  vnProvinces,
  type GoodsCondition,
  type OutboundLine,
  type OutboundRequest,
} from '../data/outboundRequests'
import { seedCatalogProducts } from '../data/productCatalog'

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="product-thumb-img" />
  return <div className="product-thumb">{label.slice(0, 2).toUpperCase()}</div>
}

export default function ClientOutboundCreatePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const copyFrom = params.get('copyFrom')
  const source = copyFrom ? getOutboundRequest(copyFrom) : undefined

  const [form] = Form.useForm()
  const province = Form.useWatch('province', form)
  const district = Form.useWatch('district', form)
  const paidAmount = Form.useWatch('paidAmount', form) ?? 0
  const cod = Form.useWatch('cod', form) ?? 0

  const [goodsCondition, setGoodsCondition] = useState<GoodsCondition>('new')
  const [productQuery, setProductQuery] = useState('')
  const [lines, setLines] = useState<OutboundLine[]>(() =>
    source ? source.lines.map((line) => ({ ...line, id: `orl-${Date.now()}-${line.id}` })) : [],
  )

  const provinceOptions = vnProvinces.map((p) => ({ value: p.value, label: p.label }))
  const districtOptions =
    vnProvinces.find((p) => p.value === province)?.districts.map((d) => ({
      value: d.value,
      label: d.label,
    })) ?? []
  const wardOptions =
    vnProvinces
      .find((p) => p.value === province)
      ?.districts.find((d) => d.value === district)
      ?.wards.map((w) => ({ value: w.value, label: w.label })) ?? []

  const catalogHits = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return seedCatalogProducts.slice(0, 8)
    return seedCatalogProducts.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        (p.partnerSku || '').toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q),
    )
  }, [productQuery])

  const totals = outboundTotals(lines, Number(paidAmount) || 0)

  const addProduct = (productId: string) => {
    const product = seedCatalogProducts.find((p) => p.id === productId)
    if (!product) return
    if (lines.some((l) => l.productId === product.id && l.goodsCondition === goodsCondition)) {
      message.warning('Sản phẩm với tình trạng này đã có trong danh sách')
      return
    }
    setLines((prev) => [
      ...prev,
      {
        id: `orl-${Date.now()}-${product.id}`,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        partnerSku: product.partnerSku,
        imageUrl: product.imageUrl,
        goodsCondition,
        qty: 1,
        availableQty: productAvailableQty(product.sku),
        assignedQty: 0,
        unitPrice: 0,
        discount: 0,
      },
    ])
    setProductQuery('')
    message.success(`Đã thêm ${product.sku}`)
  }

  const updateLine = (id: string, patch: Partial<OutboundLine>) => {
    setLines((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const columns: TableColumnsType<OutboundLine> = [
    { title: '#', width: 48, render: (_, __, i) => i + 1 },
    {
      title: 'Sản phẩm',
      width: 280,
      render: (_, row) => (
        <Space>
          <ProductThumb src={row.imageUrl} label={row.sku} />
          <div>
            <div>{row.name}</div>
            <Typography.Text type="secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {row.sku}
            </Typography.Text>{' '}
            <Tag>{goodsConditionLabel[row.goodsCondition]}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'SL (1)',
      width: 100,
      render: (_, row) => (
        <InputNumber
          min={1}
          max={row.availableQty}
          value={row.qty}
          style={{ width: '100%' }}
          onChange={(v) => updateLine(row.id, { qty: v ?? 1 })}
        />
      ),
    },
    {
      title: 'SL khả dụng',
      dataIndex: 'availableQty',
      width: 110,
      align: 'right',
      render: (v: number) => <span className="outbound-available-qty">{v}</span>,
    },
    {
      title: 'SL chỉ định',
      dataIndex: 'assignedQty',
      width: 100,
      align: 'right',
    },
    {
      title: 'Đơn giá (VND) (2)',
      width: 130,
      render: (_, row) => (
        <InputNumber
          min={0}
          value={row.unitPrice}
          style={{ width: '100%' }}
          onChange={(v) => updateLine(row.id, { unitPrice: v ?? 0 })}
        />
      ),
    },
    {
      title: 'Giảm giá (VND) (3)',
      width: 130,
      render: (_, row) => (
        <InputNumber
          min={0}
          value={row.discount}
          style={{ width: '100%' }}
          onChange={(v) => updateLine(row.id, { discount: v ?? 0 })}
        />
      ),
    },
    {
      title: 'Thành tiền (VND)',
      width: 140,
      align: 'right',
      render: (_, row) => (
        <div>
          <div>{lineAmount(row).toLocaleString('vi-VN')}</div>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            (1)×[(2)−(3)]
          </Typography.Text>
        </div>
      ),
    },
    {
      title: '',
      width: 80,
      render: (_, row) => (
        <Space>
          <IconAction
            title="Ghi chú dòng"
            icon={<FormOutlined />}
            onClick={() => {
              const note = window.prompt('Ghi chú dòng sản phẩm', row.note || '') ?? row.note
              updateLine(row.id, { note: note || undefined })
            }}
          />
          <IconAction
            title="Xóa dòng"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setLines((prev) => prev.filter((item) => item.id !== row.id))}
          />
        </Space>
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
      const wh = outboundWarehouseOptions.find((w) => w.value === values.warehouseCode)
      const next: OutboundRequest = {
        id: `or-${Date.now()}`,
        code: generateOutboundCode(),
        partnerOrCode: values.partnerOrCode || values.internalCode || '',
        internalCode: values.internalCode,
        warehouseCode: values.warehouseCode,
        warehouseName: wh?.label || values.warehouseCode,
        deliveryMethod: values.deliveryMethod,
        shippingPackage: values.shippingPackage,
        status: 'new',
        isB2b: !!values.isB2b,
        buyerName: values.buyerName || '',
        buyerPhone: values.buyerPhone || '',
        buyerEmail: values.buyerEmail,
        note: values.note,
        province: values.province,
        district: values.district,
        ward: values.ward,
        address: values.address || '',
        priority: values.priority,
        referenceCode: values.referenceCode,
        expectedDeliveryAt: values.expectedDeliveryAt
          ? values.expectedDeliveryAt.format('YYYY-MM-DD')
          : null,
        requireDocuments: !!values.requireDocuments,
        noPacking: !!values.noPacking,
        packingNote: values.packingNote,
        driver: values.driver,
        vehicleNo: values.vehicleNo,
        containerNo: values.containerNo,
        channel: 'Website',
        storeName: '—',
        occurredAt: new Date().toISOString(),
        slaChannel: '—',
        paidAmount: Number(values.paidAmount) || 0,
        cod: Number(values.cod) || 0,
        declaredValue:
          values.declaredValue != null ? Number(values.declaredValue) : totals.total,
        createdAt: new Date().toISOString(),
        lines,
      }
      upsertOutboundRequest(next)
      message.success(`Đã tạo yêu cầu xuất kho ${next.code}`)
      navigate(`/client/operations/outbound/${next.id}`)
    } catch {
      /* validation */
    }
  }

  return (
    <div>
      <PageHeader
        title="Tạo yêu cầu xuất kho"
        description="Nhập thông tin kho / người nhận / đơn hàng / sản phẩm, rồi chọn Thêm để hoàn tất."
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          warehouseCode: source?.warehouseCode || 'KQ2',
          deliveryMethod: source?.deliveryMethod || 'pickup',
          internalCode: source?.internalCode,
          shippingPackage: source?.shippingPackage || 'Standard',
          isB2b: source?.isB2b || false,
          buyerName: source?.buyerName,
          buyerPhone: source?.buyerPhone,
          buyerEmail: source?.buyerEmail,
          note: source?.note,
          province: source?.province || 'HCM',
          district: source?.district || 'Q7',
          ward: source?.ward || 'PTT',
          address: source?.address,
          priority: source?.priority || 'normal',
          referenceCode: source?.referenceCode,
          expectedDeliveryAt: source?.expectedDeliveryAt
            ? dayjs(source.expectedDeliveryAt)
            : undefined,
          requireDocuments: source?.requireDocuments || false,
          noPacking: source?.noPacking || false,
          packingNote: source?.packingNote,
          driver: source?.driver,
          vehicleNo: source?.vehicleNo,
          containerNo: source?.containerNo,
          paidAmount: source?.paidAmount ?? 0,
          cod: source?.cod ?? 0,
          declaredValue: source?.declaredValue,
          partnerOrCode: source?.partnerOrCode,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <div className="content-card inbound-section-card">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="warehouseCode"
                    label="Kho xuất"
                    rules={[{ required: true, message: 'Chọn kho xuất' }]}
                  >
                    <Select options={outboundWarehouseOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="deliveryMethod"
                    label="Hình thức nhận hàng"
                    rules={[{ required: true, message: 'Chọn hình thức' }]}
                  >
                    <Select
                      options={Object.entries(deliveryMethodLabel).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="internalCode" label="Mã xuất kho nội bộ">
                    <Input placeholder="Mã xuất kho nội bộ" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="shippingPackage"
                    label="Gói vận chuyển"
                    rules={[{ required: true, message: 'Chọn gói vận chuyển' }]}
                  >
                    <Select options={shippingPackageOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="content-card inbound-section-card" style={{ marginTop: 16 }}>
              <Form.Item name="isB2b" valuePropName="checked" style={{ marginBottom: 12 }}>
                <Checkbox>Đơn hàng B2B</Checkbox>
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="buyerName" label="Người mua">
                    <Input placeholder="Người mua" />
                  </Form.Item>
                  <Form.Item name="buyerPhone" label="Số điện thoại">
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>
                  <Form.Item name="buyerEmail" label="Email">
                    <Input placeholder="Email" />
                  </Form.Item>
                  <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Ghi chú" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="province"
                    label="Tỉnh/Thành phố"
                    rules={[{ required: true, message: 'Chọn tỉnh/thành' }]}
                  >
                    <Select
                      options={provinceOptions}
                      onChange={() => form.setFieldsValue({ district: undefined, ward: undefined })}
                    />
                  </Form.Item>
                  <Form.Item
                    name="district"
                    label="Quận/Huyện"
                    rules={[{ required: true, message: 'Chọn quận/huyện' }]}
                  >
                    <Select
                      options={districtOptions}
                      onChange={() => form.setFieldsValue({ ward: undefined })}
                    />
                  </Form.Item>
                  <Form.Item
                    name="ward"
                    label="Phường/Xã"
                    rules={[{ required: true, message: 'Chọn phường/xã' }]}
                  >
                    <Select options={wardOptions} />
                  </Form.Item>
                  <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Địa chỉ" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="content-card inbound-section-card" style={{ marginTop: 16 }}>
              <Row gutter={12} style={{ marginBottom: 12 }} align="bottom">
                <Col xs={24} md={8}>
                  <div className="section-label">
                    Tình trạng hàng hóa <span style={{ color: '#ff4d4f' }}>*</span>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    value={goodsCondition}
                    onChange={setGoodsCondition}
                    options={Object.entries(goodsConditionLabel).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                </Col>
                <Col xs={24} md={16}>
                  <div className="section-label">
                    Sản phẩm <span style={{ color: '#ff4d4f' }}>*</span>
                  </div>
                  <Select
                    showSearch
                    allowClear
                    value={null}
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
                    suffixIcon={<SearchOutlined />}
                  />
                </Col>
              </Row>

              <Table
                rowKey="id"
                size="middle"
                pagination={false}
                dataSource={lines}
                columns={columns}
                scroll={{ x: 1200 }}
                locale={{ emptyText: 'Chưa có sản phẩm' }}
              />

              <div className="outbound-totals">
                <div className="outbound-totals-row">
                  <span>Tổng cộng (A)</span>
                  <strong>{totals.total.toLocaleString('vi-VN')}</strong>
                </div>
                <div className="outbound-totals-row">
                  <span>Tổng giảm giá (B)</span>
                  <strong>{totals.totalDiscount.toLocaleString('vi-VN')}</strong>
                </div>
                <div className="outbound-totals-row">
                  <span>Đã thanh toán (C)</span>
                  <Form.Item name="paidAmount" noStyle>
                    <InputNumber min={0} style={{ width: 140 }} />
                  </Form.Item>
                </div>
                <div className="outbound-totals-row">
                  <span>Còn lại = (A) − (B) − (C)</span>
                  <strong>{totals.remaining.toLocaleString('vi-VN')}</strong>
                </div>
                <div className="outbound-totals-row">
                  <span>COD</span>
                  <Form.Item name="cod" noStyle>
                    <InputNumber min={0} style={{ width: 140 }} />
                  </Form.Item>
                </div>
                <div className="outbound-totals-row">
                  <span>Khai giá (VND)</span>
                  <Form.Item name="declaredValue" noStyle>
                    <InputNumber min={0} style={{ width: 140 }} placeholder={String(totals.total)} />
                  </Form.Item>
                </div>
                {(cod > 0 || paidAmount > 0) && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    COD hiện tại: {(Number(cod) || 0).toLocaleString('vi-VN')} VND
                  </Typography.Text>
                )}
              </div>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="content-card inbound-section-card">
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                rules={[{ required: true, message: 'Chọn độ ưu tiên' }]}
              >
                <Select
                  options={Object.entries(outboundPriorityLabel).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Form.Item>
              <Form.Item name="referenceCode" label="Mã tham chiếu">
                <Input placeholder="Mã tham chiếu" />
              </Form.Item>
              <Form.Item name="expectedDeliveryAt" label="Dự kiến giao hàng">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item name="requireDocuments" valuePropName="checked">
                <Checkbox>Yêu cầu chứng từ</Checkbox>
              </Form.Item>
              <Form.Item name="noPacking" valuePropName="checked">
                <Checkbox>Không đóng gói</Checkbox>
              </Form.Item>
              <Form.Item name="packingNote" label="Ghi chú đóng gói">
                <Input.TextArea rows={3} placeholder="Ghi chú đóng gói" />
              </Form.Item>
              <Form.Item name="driver" label="Tài xế">
                <Input placeholder="Tài xế" />
              </Form.Item>
              <Form.Item name="vehicleNo" label="Số xe">
                <Input placeholder="Số xe" />
              </Form.Item>
              <Form.Item name="containerNo" label="Số container">
                <Input placeholder="Số container" />
              </Form.Item>
              <Form.Item name="partnerOrCode" label="Mã OR đối tác" hidden>
                <Input />
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>

      <div className="inbound-create-footer">
        <Space>
          <IconAction
            title="Thoát"
            icon={<CloseOutlined />}
            onClick={() => navigate('/client/operations/outbound')}
          />
          <IconAction title="Thêm" type="primary" icon={<PlusOutlined />} onClick={submit} />
        </Space>
      </div>
    </div>
  )
}
