import { useEffect, useMemo } from 'react'
import { CloseOutlined, InfoCircleOutlined, SaveOutlined } from '@ant-design/icons'
import {
  Checkbox,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from 'antd'
import { IconAction } from './IconAction'
import {
  carrierCatalog,
  getCarrierByCode,
  mapLegacyCarrierCode,
  type CarrierCode,
  type CarrierFieldDef,
} from '../data/carrierAccountFields'
import { type CarrierAccount } from '../data/shipping'
import { warehouses } from '../data/mock'

export type CarrierAccountFormValues = {
  carrierCode: CarrierCode
  name: string
  setupType: 'platform' | 'partner'
  partnerCode?: string
  partnerName?: string
  warehouseCode?: string
  credentials: Record<string, string | boolean | undefined>
}

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  initial?: CarrierAccount | null
  partnerOptions?: { value: string; label: string }[]
  customerId?: string
  onCancel: () => void
  onSubmit: (account: CarrierAccount) => void
}

const defaultPartners = [
  { value: 'GLF', label: 'GLF - GREENLINK' },
  { value: 'HAC', label: 'HAC - CÔNG TY TNHH HAC RETAIL' },
  { value: 'EVC', label: 'EVC - EverCharge Retail' },
  { value: 'GM', label: 'GM - GreenMart Vietnam' },
  { value: 'TPT', label: 'TPT - CÔNG TY TNHH TÂN PHÁT TOOLS' },
  { value: 'NQA', label: 'NQA - HỘ KINH DOANH NGÔ QUỲNH ANH 2003 HĐ' },
]

function CarrierOptionLabel({
  color,
  shortName,
  name,
  compact,
}: {
  color: string
  shortName: string
  name: string
  compact?: boolean
}) {
  return (
    <span className={`carrier-option ${compact ? 'compact' : ''}`}>
      <span className="carrier-logo" style={{ background: color }}>
        {shortName.slice(0, 3)}
      </span>
      <span className="carrier-option-text">
        <strong>{shortName}</strong>
        {!compact ? <span>{name}</span> : null}
      </span>
    </span>
  )
}

function DynamicFields({ fields }: { fields: CarrierFieldDef[] }) {
  return (
    <>
      {fields.map((field) => {
        const labelNode = (
          <Space size={6}>
            <span>{field.label}</span>
            {field.hint ? (
              <Tooltip title={field.hint}>
                <InfoCircleOutlined style={{ color: 'var(--color-text-muted)' }} />
              </Tooltip>
            ) : null}
            {field.guideLink ? (
              <Typography.Link
                onClick={(e) => {
                  e.preventDefault()
                  message.info('Mở hướng dẫn kết nối (mock)')
                }}
              >
                Hướng dẫn
              </Typography.Link>
            ) : null}
          </Space>
        )

        if (field.type === 'checkbox') {
          return (
            <Form.Item
              key={field.name}
              name={['credentials', field.name]}
              valuePropName="checked"
              style={{ marginBottom: field.hint ? 8 : 16 }}
            >
              <Checkbox>{field.label}</Checkbox>
            </Form.Item>
          )
        }

        if (field.type === 'select') {
          return (
            <Form.Item
              key={field.name}
              name={['credentials', field.name]}
              label={labelNode}
              rules={field.required ? [{ required: true, message: `Nhập ${field.label}` }] : undefined}
            >
              <Select
                placeholder={field.placeholder || field.label}
                options={field.options}
                allowClear={!field.required}
              />
            </Form.Item>
          )
        }

        if (field.type === 'password') {
          return (
            <Form.Item
              key={field.name}
              name={['credentials', field.name]}
              label={labelNode}
              rules={field.required ? [{ required: true, message: `Nhập ${field.label}` }] : undefined}
            >
              <Input.Password placeholder={field.placeholder || field.label} />
            </Form.Item>
          )
        }

        return (
          <Form.Item
            key={field.name}
            name={['credentials', field.name]}
            label={labelNode}
            rules={field.required ? [{ required: true, message: `Nhập ${field.label}` }] : undefined}
          >
            <Input placeholder={field.placeholder || field.label} />
          </Form.Item>
        )
      })}
    </>
  )
}

export default function CarrierAccountFormModal({
  open,
  mode,
  initial,
  partnerOptions,
  customerId = '1',
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<CarrierAccountFormValues>()
  const carrierCode = Form.useWatch('carrierCode', form) as CarrierCode | undefined
  const setupType = Form.useWatch('setupType', form)
  const carrier = useMemo(() => getCarrierByCode(carrierCode), [carrierCode])

  const partners = partnerOptions?.length ? partnerOptions : defaultPartners
  const warehouseOptions = warehouses.map((w) => ({
    value: w.code,
    label: `${w.code} - ${w.name}`,
  }))

  useEffect(() => {
    if (!open) return
    if (initial) {
      const code = mapLegacyCarrierCode(initial.carrierCode)
      form.setFieldsValue({
        carrierCode: code,
        name: initial.name,
        setupType: initial.setupType || 'partner',
        partnerCode: initial.partnerCode,
        partnerName: initial.partnerName,
        warehouseCode: initial.warehouseCode,
        credentials: (initial.credentials || {}) as CarrierAccountFormValues['credentials'],
      })
    } else {
      form.setFieldsValue({
        carrierCode: 'GHTK',
        name: undefined,
        setupType: 'platform',
        partnerCode: undefined,
        partnerName: undefined,
        warehouseCode: undefined,
        credentials: {},
      })
    }
  }, [open, initial, form])

  return (
    <Modal
      open={open}
      title={
        <span className="modal-title-blue">
          {mode === 'edit' ? 'Cập nhật tài khoản ĐVVC' : 'Thiết lập tài khoản ĐVVC'}
        </span>
      }
      onCancel={onCancel}
      width={720}
      destroyOnHidden
      footer={
        <Space>
          <IconAction title="Thoát" icon={<CloseOutlined />} onClick={onCancel} />
          <IconAction title="Lưu" type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} />
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark
        onFinish={(values) => {
          const selected = getCarrierByCode(values.carrierCode)
          if (!selected) {
            message.error('Chọn đơn vị vận chuyển')
            return
          }
          const partner =
            values.setupType === 'partner'
              ? partners.find((p) => p.value === values.partnerCode)
              : { value: 'GLF', label: 'GLF - GREENLINK' }

          if (values.setupType === 'partner' && !values.partnerCode) {
            message.error('Chọn đối tác gửi hàng')
            return
          }

          const warehouse = warehouseOptions.find((w) => w.value === values.warehouseCode)
          const account: CarrierAccount = {
            id: initial?.id || `acc-${Date.now()}`,
            name: values.name,
            type: values.warehouseCode ? 'customer_warehouse' : 'customer',
            setupType: values.setupType,
            carrierCode: selected.code,
            carrierLabel: selected.label,
            partnerCode: partner?.value || 'GLF',
            partnerName: partner?.label || values.partnerName || 'GLF - GREENLINK',
            customerId: initial?.customerId || customerId,
            warehouseCode: values.warehouseCode,
            warehouseName: warehouse?.label,
            createdAt: initial?.createdAt || new Date().toISOString().slice(0, 10),
            status: initial?.status || 'active',
            connection: initial?.connection || 'connected',
            credentials: values.credentials || {},
          }
          onSubmit(account)
        }}
      >
        <Form.Item
          name="carrierCode"
          label="Chọn ĐVVC"
          rules={[{ required: true, message: 'Chọn ĐVVC' }]}
        >
          <Select
            showSearch
            placeholder="Chọn đơn vị vận chuyển"
            optionFilterProp="label"
            optionLabelProp="label"
            onChange={() => form.setFieldsValue({ credentials: {} })}
            options={carrierCatalog.map((item) => ({
              value: item.code,
              label: `${item.shortName} ${item.name}`,
              raw: item,
            }))}
            optionRender={(option) => {
              const item = option.data.raw as (typeof carrierCatalog)[number]
              return (
                <CarrierOptionLabel
                  color={item.color}
                  shortName={item.shortName}
                  name={item.name}
                />
              )
            }}
            labelRender={(props) => {
              const item = carrierCatalog.find((c) => c.code === props.value)
              if (!item) return props.label
              return (
                <CarrierOptionLabel
                  color={item.color}
                  shortName={item.shortName}
                  name={item.name}
                  compact
                />
              )
            }}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên tài khoản"
          rules={[{ required: true, message: 'Nhập tên tài khoản' }]}
        >
          <Input placeholder="Tên tài khoản" />
        </Form.Item>

        <Form.Item name="setupType" label="Loại tài khoản thiết lập" initialValue="platform">
          <Radio.Group>
            <Radio value="platform">Tài khoản: GLF-GREENLINK</Radio>
            <Radio value="partner">Tài khoản đối tác gửi hàng(Partner)</Radio>
          </Radio.Group>
        </Form.Item>

        {setupType === 'partner' ? (
          <Form.Item
            name="partnerCode"
            label="Đối tác gửi hàng"
            rules={[{ required: true, message: 'Chọn đối tác' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={partners}
              placeholder="Chọn đối tác"
            />
          </Form.Item>
        ) : null}

        <Form.Item
          name="warehouseCode"
          label="Kho (Nếu để trống sẽ áp dụng cho mọi kho)"
        >
          <Select allowClear placeholder="Kho" options={warehouseOptions} />
        </Form.Item>

        {carrier ? (
          <>
            <div className="carrier-fields-divider">
              Cấu hình {carrier.name} ({carrier.shortName})
            </div>
            <DynamicFields fields={carrier.fields} />
            {carrier.fields.some((f) => f.name === 'useViettelLabel') ? (
              <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
                Khi tùy chỉnh này được chọn thì hệ thống sẽ lấy nhãn vận chuyển được cung cấp bởi
                Viettel Post và bỏ qua các nhãn tùy chỉnh riêng.
              </Typography.Paragraph>
            ) : null}
          </>
        ) : null}
      </Form>
    </Modal>
  )
}
