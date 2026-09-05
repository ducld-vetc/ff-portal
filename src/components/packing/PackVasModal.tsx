import { useEffect, useState } from 'react'
import { Checkbox, Modal, Typography } from 'antd'
import {
  packVasOptions,
  type PackVasCode,
} from '../../data/packingSessions'

type Props = {
  open: boolean
  selected: PackVasCode[]
  onCancel: () => void
  onConfirm: (codes: PackVasCode[]) => void
}

export function PackVasModal({ open, selected, onCancel, onConfirm }: Props) {
  const [codes, setCodes] = useState<PackVasCode[]>(selected)

  useEffect(() => {
    if (open) setCodes(selected)
  }, [open, selected])

  return (
    <Modal
      title="Dịch vụ cộng thêm (VAS)"
      open={open}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnHidden
      onOk={() => onConfirm(codes)}
    >
      <Typography.Paragraph type="secondary">
        Khai báo dịch vụ đặc biệt (niêm phong, chống sốc, bọc PE…) để xử lý đúng yêu cầu và tính phí
        sau này.
      </Typography.Paragraph>
      <Checkbox.Group
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        options={packVasOptions.map((o) => ({ value: o.value, label: o.label }))}
        value={codes}
        onChange={(v) => setCodes(v as PackVasCode[])}
      />
    </Modal>
  )
}
