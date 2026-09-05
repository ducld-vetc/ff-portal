import { useState } from 'react'
import { Form, Input, Modal, Typography } from 'antd'
import { getPartialPackPin } from '../../data/packingSessions'

type Props = {
  open: boolean
  onCancel: () => void
  onConfirm: (pin: string) => void
}

export function PackPartialPinModal({ open, onCancel, onConfirm }: Props) {
  const [pin, setPin] = useState('')

  const close = () => {
    setPin('')
    onCancel()
  }

  return (
    <Modal
      title="Xác nhận đóng gói thiếu"
      open={open}
      onCancel={close}
      okText="Xác nhận"
      cancelText="Hủy"
      destroyOnHidden
      onOk={() => {
        onConfirm(pin)
        setPin('')
      }}
    >
      <Typography.Paragraph type="secondary">
        Dùng khi shop/khách đồng ý giao phần hàng còn lại. Cần mật khẩu supervisor (demo:{' '}
        <Typography.Text code>{getPartialPackPin()}</Typography.Text>).
      </Typography.Paragraph>
      <Form layout="vertical">
        <Form.Item label="Mật khẩu" required>
          <Input.Password
            value={pin}
            autoFocus
            placeholder="Nhập mật khẩu"
            onChange={(e) => setPin(e.target.value)}
            onPressEnter={() => onConfirm(pin)}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
