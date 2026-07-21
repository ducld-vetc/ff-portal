import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  generateInboundCode,
  getInboundRequest,
  inboundTypeLabel,
  inboundWarehouseOptions,
  upsertInboundRequest,
  buildInboundSerials,
  type InboundLine,
  type InboundRequest,
} from '../data/inboundRequests'
import { seedCatalogProducts } from '../data/productCatalog'
import { InboundSerialModal } from '../components/InboundSerialModal'

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="product-thumb-img" />
  return <div className="product-thumb">{label.slice(0, 2).toUpperCase()}</div>
}

export default function ClientInboundCreatePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const copyFrom = params.get('copyFrom')
  const source = copyFrom ? getInboundRequest(copyFrom) : undefined

  const [form] = Form.useForm()
  const [productQuery, setProductQuery] = useState('')
  const [lines, setLines] = useState<InboundLine[]>(() =>
    source ? source.lines.map((line) => ({ ...line })) : [],
  )
  const [serialLine, setSerialLine] = useState<InboundLine | null>(null)

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

  const addProduct = (productId: string) => {
    const product = seedCatalogProducts.find((p) => p.id === productId)
    if (!product) return
    if (lines.some((l) => l.productId === product.id)) {
      message.warning('Sản phẩm đã có trong danh sách')
      return
    }
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${product.id}`,
        productId: product.id,
        name: product.name,
        partnerSku: product.partnerSku || '',
        sku: product.sku,
        unit: product.units[0] || 'PCS',
        imageUrl: product.imageUrl,
        qty: 1,
        unitPrice: 0,
      },
    ])
    setProductQuery('')
    message.success(`Đã thêm ${product.sku}`)
  }

  const columns: TableColumnsType<InboundLine> = [
    {
      title: '#',
      width: 48,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Hình ảnh',
      width: 72,
      render: (_, row) => <ProductThumb src={row.imageUrl} label={row.sku} />,
    },
    { title: 'Tên sản phẩm', dataIndex: 'name', ellipsis: true },
    { title: 'SKU đối tác', dataIndex: 'partnerSku', width: 120 },
    { title: 'SKU (barcode)', dataIndex: 'sku', width: 140 },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    {
      title: 'Số lượng',
      width: 130,
      render: (_, row) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <InputNumber
            min={1}
            value={row.qty}
            style={{ width: '100%' }}
            onChange={(value) => {
              const qty = value ?? 1
              setLines((prev) =>
                prev.map((item) =>
                  item.id === row.id
                    ? {
                        ...item,
                        qty,
                        serials: buildInboundSerials(item.sku, qty, item.serials),
                      }
                    : item,
                ),
              )
            }}
          />
          <button
            type="button"
            className="inbound-qty-serial-link"
            onClick={() => setSerialLine(row)}
          >
            Xem {row.qty} serial
          </button>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      width: 130,
      render: (_, row) => (
        <InputNumber
          min={0}
          value={row.unitPrice}
          style={{ width: '100%' }}
          onChange={(value) =>
            setLines((prev) =>
              prev.map((item) =>
                item.id === row.id ? { ...item, unitPrice: value ?? 0 } : item,
              ),
            )
          }
        />
      ),
    },
    {
      title: (
        <span>
          Thành tiền <Typography.Text type="secondary">(VND)</Typography.Text>
        </span>
      ),
      width: 130,
      align: 'right',
      render: (_, row) => (row.qty * row.unitPrice).toLocaleString('vi-VN'),
    },
    {
      title: '',
      width: 56,
      render: (_, row) => (
        <Button
          danger
          type="text"
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
      const wh = inboundWarehouseOptions.find((w) => w.value === values.warehouseCode)
      const productQty = lines.reduce((sum, line) => sum + line.qty, 0)
      const next: InboundRequest = {
        id: `ir-${Date.now()}`,
        code: generateInboundCode(),
        partnerIrCode: values.partnerIrCode || '',
        country: 'VN',
        warehouseCode: values.warehouseCode,
        warehouseName: wh?.label || values.warehouseCode,
        status: 'new',
        skuCount: lines.length,
        productQty,
        receivedQty: 0,
        goodsCondition: values.goodsCondition,
        supplier: values.supplier || '',
        type: values.type,
        expectedAt: values.expectedAt.format('YYYY-MM-DD'),
        receivedAt: null,
        createdAt: new Date().toISOString(),
        expiredAt: values.expiredAt ? values.expiredAt.format('YYYY-MM-DD') : null,
        referenceCode: values.referenceCode,
        driver: values.driver,
        vehicleNo: values.vehicleNo,
        containerNo: values.containerNo,
        note: values.note,
        ownerName: 'Bella Nguyễn',
        ownerPhone: '0909092212',
        lines: lines.map((line) => ({
          ...line,
          serials: buildInboundSerials(line.sku, line.qty, line.serials),
        })),
      }
      upsertInboundRequest(next)
      message.success(`Đã tạo yêu cầu nhập kho ${next.code}`)
      navigate(`/client/operations/inbound/${next.id}`)
    } catch {
      /* validation */
    }
  }

  return (
    <div>
      <PageHeader
        title="Tạo yêu cầu nhập kho"
        description="Nhập thông tin phiếu, sản phẩm (số lượng / đơn giá), rồi tạo mới."
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          warehouseCode: source?.warehouseCode || 'KBL',
          expectedAt: source?.expectedAt ? dayjs(source.expectedAt) : dayjs().add(1, 'day'),
          partnerIrCode: source?.partnerIrCode,
          expiredAt: source?.expiredAt ? dayjs(source.expiredAt) : undefined,
          supplier: source?.supplier || 'SHEIN',
          type: source?.type || 'inbound',
          goodsCondition: source?.goodsCondition || 'new',
          referenceCode: source?.referenceCode,
          driver: source?.driver,
          vehicleNo: source?.vehicleNo,
          containerNo: source?.containerNo,
          note: source?.note,
        }}
      >
        <Row gutter={[16, 16]} className="inbound-create-layout">
          <Col xs={24} lg={16}>
            <div className="content-card inbound-section-card">
              <h3 className="inbound-section-title">Thông tin nhập kho</h3>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="warehouseCode"
                    label="Nhập kho"
                    rules={[{ required: true, message: 'Chọn kho nhập' }]}
                  >
                    <Select options={inboundWarehouseOptions} placeholder="Chọn kho" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="expectedAt"
                    label="Ngày dự kiến đến"
                    rules={[{ required: true, message: 'Chọn ngày dự kiến' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="partnerIrCode" label="Mã IR đối tác">
                    <Input placeholder="Mã IR đối tác" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="expiredAt" label="Ngày hết hạn">
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      placeholder="Ngày hết hạn"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="supplier" label="Nhà cung cấp">
                    <Input placeholder="Nhà cung cấp" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="content-card inbound-section-card" style={{ marginTop: 16 }}>
              <h3 className="inbound-section-title">Sản phẩm nhập kho</h3>
              <Select
                showSearch
                allowClear
                value={null}
                placeholder="Tìm kiếm theo SKU, SKU đối tác, tên sản phẩm"
                style={{ width: '100%', marginBottom: 12 }}
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
                          {p?.partnerSku} · {p?.name}
                        </Typography.Text>
                      </span>
                    </Space>
                  )
                }}
                suffixIcon={<SearchOutlined />}
              />
              <Table
                rowKey="id"
                size="middle"
                pagination={false}
                dataSource={lines}
                columns={columns}
                scroll={{ x: 1100 }}
                locale={{ emptyText: 'Chưa có sản phẩm — tìm và chọn ở ô phía trên' }}
              />
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="content-card inbound-section-card">
              <h3 className="inbound-section-title">Phụ trách đơn hàng</h3>
              <div className="inbound-owner">
                <div className="inbound-owner-name">Bella Nguyễn</div>
                <div className="inbound-owner-phone">0909092212</div>
              </div>
              <Form.Item
                name="type"
                label="Loại nhập kho"
                rules={[{ required: true, message: 'Chọn loại' }]}
              >
                <Select
                  options={Object.entries(inboundTypeLabel).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="goodsCondition"
                label="Tình trạng hàng hóa"
                rules={[{ required: true, message: 'Chọn tình trạng' }]}
              >
                <Select
                  options={[
                    { value: 'new', label: 'Mới' },
                    { value: 'used', label: 'Đã qua sử dụng' },
                    { value: 'damaged', label: 'Hư hỏng' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="referenceCode" label="Mã tham chiếu">
                <Input placeholder="Mã tham chiếu" />
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
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Ghi chú" />
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>

      <div className="inbound-create-footer">
        <Space>
          <Button onClick={() => navigate('/client/operations/inbound')}>Thoát</Button>
          <Button type="primary" onClick={submit}>
            Tạo mới
          </Button>
        </Space>
      </div>

      <InboundSerialModal
        open={!!serialLine}
        line={serialLine}
        editable
        onClose={() => setSerialLine(null)}
        onSave={(serials) => {
          if (!serialLine) return
          setLines((prev) =>
            prev.map((item) => (item.id === serialLine.id ? { ...item, serials } : item)),
          )
        }}
      />
    </div>
  )
}
