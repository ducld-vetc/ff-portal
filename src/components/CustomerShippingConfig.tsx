import { useMemo, useState } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined, SelectOutlined } from '@ant-design/icons'
import { Card, Form, Select, Space, Table, message } from 'antd'
import { IconAction } from './IconAction'
import CarrierAccountPicker from './CarrierAccountPicker'
import CarrierAccountFormModal from './CarrierAccountFormModal'
import { carrierCatalog } from '../data/carrierAccountFields'
import { accountTypeLabel, carrierAccounts, type CarrierAccount } from '../data/shipping'

export type CustomerCarrierConfig = {
  carrierCodes: string[]
  accountIds: string[]
}

type Props = {
  value: CustomerCarrierConfig
  onChange: (value: CustomerCarrierConfig) => void
  customerId?: string
}

export default function CustomerShippingConfig({ value, onChange, customerId }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CarrierAccount | null>(null)

  const selectedCarriers = carrierCatalog.filter((c) => value.carrierCodes.includes(c.code))
  const selectedAccounts = useMemo(
    () => carrierAccounts.filter((acc) => value.accountIds.includes(acc.id)),
    [value.accountIds],
  )

  return (
    <div className="customer-shipping-config stacked">
      <Card size="small" title="Đơn vị vận chuyển" className="dashboard-card">
        <Form.Item label="Chọn ĐVVC áp dụng" style={{ marginBottom: 12 }}>
          <Select
            mode="multiple"
            placeholder="Chọn đơn vị vận chuyển"
            value={value.carrierCodes}
            onChange={(carrierCodes) => onChange({ ...value, carrierCodes })}
            options={carrierCatalog.map((c) => ({
              value: c.code,
              label: `${c.code} · ${c.name}`,
            }))}
          />
        </Form.Item>
        <Table
          size="small"
          rowKey="code"
          pagination={false}
          dataSource={selectedCarriers}
          locale={{ emptyText: 'Chưa chọn ĐVVC' }}
          columns={[
            { title: 'Mã', dataIndex: 'code', width: 90 },
            { title: 'Tên', dataIndex: 'name' },
          ]}
        />
      </Card>

      <Card
        size="small"
        className="dashboard-card"
        title="Tài khoản đơn vị vận chuyển"
        extra={
          <Space>
            <IconAction
              title="Chọn có sẵn"
              size="small"
              icon={<SelectOutlined />}
              onClick={() => setPickerOpen(true)}
            />
            <IconAction
              title="Thiết lập mới"
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            />
          </Space>
        }
      >
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={selectedAccounts}
          locale={{ emptyText: 'Chưa gắn tài khoản ĐVVC' }}
          columns={[
            {
              title: 'Loại',
              dataIndex: 'type',
              width: 200,
              render: (type: CarrierAccount['type']) => accountTypeLabel[type],
            },
            { title: 'Tên tài khoản', dataIndex: 'name' },
            { title: 'ĐVVC', dataIndex: 'carrierCode', width: 100 },
            {
              title: '',
              width: 90,
              render: (_, row) => (
                <Space size={4}>
                  <IconAction
                    title="Sửa"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditing(row)
                      setFormOpen(true)
                    }}
                  />
                  <IconAction
                    title="Xóa"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      onChange({
                        ...value,
                        accountIds: value.accountIds.filter((id) => id !== row.id),
                      })
                    }
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <CarrierAccountPicker
        open={pickerOpen}
        selectedIds={value.accountIds}
        customerId={customerId}
        onCancel={() => setPickerOpen(false)}
        onSave={(ids) => {
          const codes = carrierAccounts
            .filter((acc) => ids.includes(acc.id))
            .map((acc) => acc.carrierCode)
          onChange({
            accountIds: ids,
            carrierCodes: Array.from(new Set([...value.carrierCodes, ...codes])),
          })
          setPickerOpen(false)
        }}
      />

      <CarrierAccountFormModal
        open={formOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        customerId={customerId || 'new'}
        onCancel={() => setFormOpen(false)}
        onSubmit={(account) => {
          if (editing) {
            const idx = carrierAccounts.findIndex((item) => item.id === editing.id)
            if (idx >= 0) carrierAccounts[idx] = account
            message.success('Đã cập nhật tài khoản ĐVVC')
            onChange({
              ...value,
              accountIds: value.accountIds.includes(account.id)
                ? value.accountIds
                : [...value.accountIds, account.id],
              carrierCodes: value.carrierCodes.includes(account.carrierCode)
                ? value.carrierCodes
                : [...value.carrierCodes, account.carrierCode],
            })
          } else {
            carrierAccounts.unshift(account)
            message.success('Đã thiết lập tài khoản ĐVVC')
            onChange({
              accountIds: [...value.accountIds, account.id],
              carrierCodes: value.carrierCodes.includes(account.carrierCode)
                ? value.carrierCodes
                : [...value.carrierCodes, account.carrierCode],
            })
          }
          setFormOpen(false)
        }}
      />
    </div>
  )
}
