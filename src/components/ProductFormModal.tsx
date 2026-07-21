import { useEffect, useState } from 'react'
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
  Upload,
  message,
  type UploadFile,
} from 'antd'
import { customers } from '../data/mock'
import {
  bundleKindOptions,
  categoryOptions,
  countryOptions,
  outboundRuleOptions,
  productFieldHelp,
  productKindOptions,
  storageTypeOptions,
  unitOptions,
  warehouseKindOptions,
  type CatalogProduct,
} from '../data/productCatalog'
import { usePortal } from '../portal/PortalContext'

type FormValues = {
  customerId: string
  sku: string
  partnerSku?: string
  name: string
  storageType: CatalogProduct['storageType']
  productKind: CatalogProduct['productKind']
  bundleKind?: CatalogProduct['bundleKind']
  trackSerialOnOutbound: boolean
  manageByLot: boolean
  hasBarcodeList: boolean
  isPrivate: boolean
  trackExpiry: boolean
  units: string[]
  categories: string[]
  outboundRule: CatalogProduct['outboundRule']
  shelfLifeMonths?: number
  shipBeforeExpiryDays?: number
  expiryNotifyDays?: number
  minInboundShelfLifePercent?: number
  minOutboundShelfLifePercent?: number
  warehouseKind: CatalogProduct['warehouseKind']
  hsCode?: string
  originCountry?: string
  color?: string
  size?: string
  description?: string
  packingNote?: string
  status: CatalogProduct['status']
}

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  initial?: CatalogProduct | null
  defaultCustomerId?: string
  onCancel: () => void
  onSubmit: (product: CatalogProduct) => void
}

function FieldLabel({ text, help }: { text: string; help: string }) {
  return (
    <span className="field-label-with-help">
      {text}
      <Tooltip title={help}>
        <InfoCircleOutlined className="field-help-icon" />
      </Tooltip>
    </span>
  )
}

const customerSelectOptions = customers
  .filter((c) => c.status !== 'draft')
  .map((c) => ({
    value: c.id,
    label: `${c.code} · ${c.legalName || c.name}`,
  }))

export default function ProductFormModal({
  open,
  mode,
  initial,
  defaultCustomerId,
  onCancel,
  onSubmit,
}: Props) {
  const { isCustomer, customerScope } = usePortal()
  const [form] = Form.useForm<FormValues>()
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const storageType = Form.useWatch('storageType', form)
  const productKind = Form.useWatch('productKind', form)
  const trackExpiry = Form.useWatch('trackExpiry', form)

  useEffect(() => {
    if (!open) return
    if (initial) {
      form.setFieldsValue({
        customerId: initial.customerId,
        sku: initial.sku,
        partnerSku: initial.partnerSku,
        name: initial.name,
        storageType: initial.storageType,
        productKind: initial.productKind,
        bundleKind: initial.bundleKind,
        trackSerialOnOutbound: initial.trackSerialOnOutbound,
        manageByLot: initial.manageByLot,
        hasBarcodeList: initial.hasBarcodeList,
        isPrivate: initial.isPrivate,
        trackExpiry: initial.trackExpiry,
        units: initial.units,
        categories: initial.categories,
        outboundRule: initial.outboundRule,
        shelfLifeMonths: initial.shelfLifeMonths,
        shipBeforeExpiryDays: initial.shipBeforeExpiryDays,
        expiryNotifyDays: initial.expiryNotifyDays,
        minInboundShelfLifePercent: initial.minInboundShelfLifePercent,
        minOutboundShelfLifePercent: initial.minOutboundShelfLifePercent,
        warehouseKind: initial.warehouseKind,
        hsCode: initial.hsCode,
        originCountry: initial.originCountry,
        color: initial.color,
        size: initial.size,
        description: initial.description,
        packingNote: initial.packingNote,
        status: initial.status,
      })
      setImageUrl(initial.imageUrl)
      setFileList(
        initial.imageUrl
          ? [
              {
                uid: '-1',
                name: 'product.png',
                status: 'done',
                url: initial.imageUrl,
              },
            ]
          : [],
      )
    } else {
      form.resetFields()
      form.setFieldsValue({
        customerId:
          defaultCustomerId ||
          (isCustomer ? customerScope.customerId : customers.find((c) => c.status === 'active')?.id),
        storageType: 'non_serial',
        productKind: 'single',
        trackSerialOnOutbound: false,
        manageByLot: false,
        hasBarcodeList: false,
        isPrivate: false,
        trackExpiry: false,
        units: ['Cái'],
        categories: [],
        outboundRule: 'none',
        warehouseKind: 'normal',
        status: 'active',
      })
      setImageUrl(undefined)
      setFileList([])
    }
  }, [open, initial, defaultCustomerId, form, isCustomer, customerScope.customerId])

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Không đọc được file ảnh'))
      reader.readAsDataURL(file)
    })

  const beforeUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ hỗ trợ file ảnh (JPG, PNG, WEBP...)')
      return Upload.LIST_IGNORE
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB')
      return Upload.LIST_IGNORE
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setImageUrl(dataUrl)
      setFileList([
        {
          uid: file.name,
          name: file.name,
          status: 'done',
          url: dataUrl,
        },
      ])
    } catch {
      message.error('Không đọc được ảnh')
    }
    return false
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const customer = customers.find((c) => c.id === values.customerId)
      if (!customer) {
        message.error('Vui lòng chọn khách hàng')
        return
      }

      if (values.productKind === 'bundle' && !values.bundleKind) {
        message.error('Vui lòng chọn loại bundle')
        return
      }

      const product: CatalogProduct = {
        id: initial?.id || `cp-${Date.now()}`,
        customerId: customer.id,
        customerCode: customer.code,
        customerName: customer.legalName || customer.name,
        sku: values.sku.trim(),
        partnerSku: values.partnerSku?.trim() || undefined,
        name: values.name.trim(),
        storageType: values.storageType,
        productKind: values.productKind,
        bundleKind: values.productKind === 'bundle' ? values.bundleKind : undefined,
        trackSerialOnOutbound:
          values.storageType === 'non_serial' ? !!values.trackSerialOnOutbound : false,
        manageByLot: !!values.manageByLot,
        hasBarcodeList: !!values.hasBarcodeList,
        isPrivate: !!values.isPrivate,
        trackExpiry: !!values.trackExpiry,
        units: values.units || [],
        categories: values.categories || [],
        outboundRule: values.outboundRule,
        shelfLifeMonths: values.trackExpiry ? values.shelfLifeMonths : undefined,
        shipBeforeExpiryDays: values.trackExpiry ? values.shipBeforeExpiryDays : undefined,
        expiryNotifyDays: values.trackExpiry ? values.expiryNotifyDays : undefined,
        minInboundShelfLifePercent: values.trackExpiry
          ? values.minInboundShelfLifePercent
          : undefined,
        minOutboundShelfLifePercent: values.trackExpiry
          ? values.minOutboundShelfLifePercent
          : undefined,
        warehouseKind: values.warehouseKind,
        hsCode: values.hsCode?.trim() || undefined,
        originCountry: values.originCountry,
        color: values.color?.trim() || undefined,
        size: values.size?.trim() || undefined,
        description: values.description?.trim() || undefined,
        packingNote: values.packingNote?.trim() || undefined,
        imageUrl,
        status: values.status,
        createdAt: initial?.createdAt || new Date().toISOString(),
      }

      onSubmit(product)
      message.success(mode === 'edit' ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm')
    } catch {
      // validation errors shown by form
    }
  }

  return (
    <Modal
      open={open}
      title={
        <span className="modal-title-blue">
          {mode === 'edit' ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        </span>
      }
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Thoát"
      width={920}
      destroyOnHidden
      styles={{ body: { maxHeight: '72vh', overflowY: 'auto', paddingTop: 12 } }}
    >
      <Form form={form} layout="vertical" requiredMark>
        <div className="section-card">
          <div className="section-card-title">Thông tin cơ bản</div>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label={<FieldLabel text="Hình ảnh sản phẩm" help={productFieldHelp.image} />}
              >
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  maxCount={1}
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  onRemove={() => {
                    setImageUrl(undefined)
                    setFileList([])
                  }}
                  className="product-image-upload"
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="customerId"
                    label={<FieldLabel text="Khách hàng" help={productFieldHelp.customer} />}
                    rules={[{ required: true, message: 'Chọn khách hàng' }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      options={customerSelectOptions}
                      disabled={mode === 'edit' || isCustomer}
                      placeholder="Chọn khách hàng"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="sku"
                    label={<FieldLabel text="SKU" help={productFieldHelp.sku} />}
                    rules={[{ required: true, message: 'Nhập SKU' }]}
                  >
                    <Input className="mono-input" placeholder="VD: SKU-CHARGER-20W" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="partnerSku"
                    label={<FieldLabel text="SKU đối tác" help={productFieldHelp.partnerSku} />}
                  >
                    <Input className="mono-input" placeholder="SKU nội bộ đối tác" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="name"
                    label={<FieldLabel text="Tên sản phẩm" help={productFieldHelp.name} />}
                    rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
                  >
                    <Input placeholder="Tên sản phẩm" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        <div className="section-card">
          <div className="section-card-title">Phân loại & lưu trữ</div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="storageType"
                label={<FieldLabel text="Loại lưu trữ" help={productFieldHelp.storageType} />}
                rules={[{ required: true }]}
              >
                <Radio.Group options={storageTypeOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="productKind"
                label={<FieldLabel text="Loại sản phẩm" help={productFieldHelp.productKind} />}
                rules={[{ required: true }]}
              >
                <Radio.Group
                  options={productKindOptions}
                  onChange={(e) => {
                    if (e.target.value !== 'bundle') {
                      form.setFieldValue('bundleKind', undefined)
                    }
                  }}
                />
              </Form.Item>
            </Col>
            {productKind === 'bundle' ? (
              <Col span={24}>
                <Form.Item
                  name="bundleKind"
                  label={<FieldLabel text="Loại bundle" help={productFieldHelp.bundleKind} />}
                  rules={[{ required: true, message: 'Chọn loại bundle' }]}
                >
                  <Radio.Group options={bundleKindOptions} />
                </Form.Item>
              </Col>
            ) : null}
          </Row>
        </div>

        <div className="section-card">
          <div className="section-card-title">Theo dõi vận hành</div>
          <Row gutter={[16, 8]}>
            {storageType === 'non_serial' ? (
              <Col xs={24} md={12}>
                <Form.Item
                  name="trackSerialOnOutbound"
                  label={
                    <FieldLabel
                      text="Theo dõi serial khi xuất"
                      help={productFieldHelp.trackSerialOnOutbound}
                    />
                  }
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                </Form.Item>
              </Col>
            ) : null}
            <Col xs={24} md={12}>
              <Form.Item
                name="manageByLot"
                label={<FieldLabel text="Quản lý theo số lô" help={productFieldHelp.manageByLot} />}
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="hasBarcodeList"
                label={
                  <FieldLabel text="Sản phẩm có mã vạch" help={productFieldHelp.hasBarcodeList} />
                }
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="isPrivate"
                label={
                  <FieldLabel
                    text="Sản phẩm riêng tư/kín đáo"
                    help={productFieldHelp.isPrivate}
                  />
                }
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="trackExpiry"
                label={
                  <FieldLabel text="Theo dõi hạn sử dụng" help={productFieldHelp.trackExpiry} />
                }
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="section-card">
          <div className="section-card-title">Đơn vị & danh mục</div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="units"
                label={<FieldLabel text="Đơn vị tính" help={productFieldHelp.units} />}
                rules={[{ required: true, message: 'Chọn ít nhất 1 đơn vị tính' }]}
              >
                <Select mode="multiple" allowClear options={unitOptions} placeholder="Chọn ĐVT" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="categories"
                label={<FieldLabel text="Danh mục" help={productFieldHelp.categories} />}
              >
                <Select
                  mode="multiple"
                  allowClear
                  options={categoryOptions}
                  placeholder="Chọn danh mục"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="section-card">
          <div className="section-card-title">Xuất kho & hạn sử dụng</div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="outboundRule"
                label={<FieldLabel text="Loại xuất kho" help={productFieldHelp.outboundRule} />}
                rules={[{ required: true }]}
              >
                <Select options={outboundRuleOptions} />
              </Form.Item>
            </Col>
            {trackExpiry ? (
              <>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="shelfLifeMonths"
                    label={
                      <FieldLabel text="Thời hạn sử dụng (tháng)" help={productFieldHelp.shelfLifeMonths} />
                    }
                  >
                    <InputNumber min={1} max={120} style={{ width: '100%' }} placeholder="VD: 24" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="shipBeforeExpiryDays"
                    label={
                      <FieldLabel
                        text="Sản phẩm được xuất kho trước ngày"
                        help={productFieldHelp.shipBeforeExpiryDays}
                      />
                    }
                  >
                    <InputNumber min={0} max={3650} style={{ width: '100%' }} placeholder="Số ngày" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="expiryNotifyDays"
                    label={
                      <FieldLabel
                        text="Gửi thông báo hết hạn (ngày)"
                        help={productFieldHelp.expiryNotifyDays}
                      />
                    }
                  >
                    <InputNumber min={0} max={365} style={{ width: '100%' }} placeholder="Số ngày" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="minInboundShelfLifePercent"
                    label={
                      <FieldLabel
                        text="Thời hạn tối thiểu nhập kho (%)"
                        help={productFieldHelp.minInboundShelfLifePercent}
                      />
                    }
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="VD: 80" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="minOutboundShelfLifePercent"
                    label={
                      <FieldLabel
                        text="Thời hạn tối thiểu xuất kho (%)"
                        help={productFieldHelp.minOutboundShelfLifePercent}
                      />
                    }
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="VD: 60" />
                  </Form.Item>
                </Col>
              </>
            ) : null}
          </Row>
        </div>

        <div className="section-card">
          <div className="section-card-title">Kho & hải quan</div>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="warehouseKind"
                label={<FieldLabel text="Loại kho" help={productFieldHelp.warehouseKind} />}
                rules={[{ required: true }]}
              >
                <Select options={warehouseKindOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="hsCode"
                label={<FieldLabel text="Mã HS" help={productFieldHelp.hsCode} />}
              >
                <Input className="mono-input" placeholder="VD: 850440" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="originCountry"
                label={
                  <FieldLabel text="Mã quốc gia xuất xứ" help={productFieldHelp.originCountry} />
                }
              >
                <Select allowClear showSearch optionFilterProp="label" options={countryOptions} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="section-card">
          <div className="section-card-title">Mô tả & đóng gói</div>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="color"
                label={<FieldLabel text="Màu sắc" help={productFieldHelp.color} />}
              >
                <Input placeholder="Màu sắc" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="size"
                label={<FieldLabel text="Kích thước" help={productFieldHelp.size} />}
              >
                <Input placeholder="Kích thước" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="description"
                label={<FieldLabel text="Mô tả" help={productFieldHelp.description} />}
              >
                <Input placeholder="Mô tả ngắn" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="packingNote"
                label={<FieldLabel text="Ghi chú đóng gói" help={productFieldHelp.packingNote} />}
              >
                <Input.TextArea rows={2} placeholder="Quy cách đóng gói đặc biệt..." />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Space size={4} style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
          <InfoCircleOutlined />
          Di chuột vào biểu tượng (i) để xem giải thích từng trường.
        </Space>
      </Form>
    </Modal>
  )
}
