import { useMemo, useState } from 'react'
import { CloseOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons'
import { Modal, Select, Space, Table, message, type TableColumnsType } from 'antd'
import { IconAction } from './IconAction'
import {
  accountTypeLabel,
  carrierAccounts,
  type CarrierAccount,
} from '../data/shipping'
import { carriers } from '../data/mock'

type Props = {
  open: boolean
  selectedIds: string[]
  onCancel: () => void
  onSave: (ids: string[]) => void
  customerId?: string
}

export default function CarrierAccountPicker({
  open,
  selectedIds,
  onCancel,
  onSave,
  customerId,
}: Props) {
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [carrierFilter, setCarrierFilter] = useState<string | undefined>()
  const [checked, setChecked] = useState<string[]>(selectedIds)

  const data = useMemo(() => {
    return carrierAccounts.filter((acc) => {
      if (customerId && acc.customerId !== customerId) return false
      if (typeFilter && acc.type !== typeFilter) return false
      if (carrierFilter && acc.carrierCode !== carrierFilter) return false
      return true
    })
  }, [typeFilter, carrierFilter, customerId])

  const columns: TableColumnsType<CarrierAccount> = [
    {
      title: 'Loại tài khoản',
      dataIndex: 'type',
      width: 220,
      render: (type: CarrierAccount['type']) => accountTypeLabel[type],
    },
    { title: 'Tên tài khoản', dataIndex: 'name' },
    {
      title: 'ĐVVC',
      dataIndex: 'carrierLabel',
      width: 200,
      render: (label: string, row) => label || row.carrierCode,
    },
    {
      title: 'Đối tác',
      render: (_, row) => `${row.partnerCode} - ${row.partnerName.replace(/^.*- /, '')}`,
      width: 240,
    },
    {
      title: 'Kho',
      render: (_, row) => row.warehouseName || '—',
      width: 220,
    },
  ]

  return (
    <Modal
      open={open}
      title={
        <div>
          <div className="modal-title-blue">CẬP NHẬT DỊCH VỤ VẬN CHUYỂN</div>
          <div className="modal-subtitle-blue">THÊM TÀI KHOẢN ĐVVC</div>
        </div>
      }
      onCancel={onCancel}
      width={980}
      destroyOnHidden
      afterOpenChange={(visible) => {
        if (visible) setChecked(selectedIds)
      }}
      footer={
        <Space>
          <IconAction title="Thoát" icon={<CloseOutlined />} onClick={onCancel} />
          <IconAction
            title="Lưu"
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => {
              onSave(checked)
              message.success(`Đã gắn ${checked.length} tài khoản`)
            }}
          />
        </Space>
      }
    >
      <Space wrap style={{ marginBottom: 12 }}>
        <Select
          allowClear
          placeholder="Loại"
          style={{ width: 220 }}
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: 'customer', label: 'Tài khoản của khách hàng' },
            { value: 'customer_warehouse', label: 'Tài khoản của khách hàng và kho' },
          ]}
        />
        <Select
          allowClear
          placeholder="Đơn vị vận chuyển"
          style={{ width: 200 }}
          value={carrierFilter}
          onChange={setCarrierFilter}
          options={carriers.map((c) => ({ value: c.code, label: c.code }))}
        />
        <IconAction title="Tìm" type="primary" icon={<SearchOutlined />} />
      </Space>

      <div className="section-label">Danh sách tài khoản</div>
      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 6 }}
        rowSelection={{
          selectedRowKeys: checked,
          onChange: (keys) => setChecked(keys as string[]),
        }}
      />
    </Modal>
  )
}
