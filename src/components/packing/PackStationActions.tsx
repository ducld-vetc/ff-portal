import { Button, Space } from 'antd'

type Props = {
  disabled?: boolean
  onPartialPack: () => void
  onPause: () => void
  onShortage: () => void
  onVas: () => void
}

export function PackStationActions({
  disabled,
  onPartialPack,
  onPause,
  onShortage,
  onVas,
}: Props) {
  return (
    <div className="ops-pack-actions">
      <Space wrap size={[8, 8]}>
        <Button danger disabled={disabled} onClick={onPartialPack}>
          Đóng gói thiếu
        </Button>
        <Button disabled={disabled} onClick={onPause}>
          Tạm dừng
        </Button>
        <Button danger type="primary" ghost disabled={disabled} onClick={onShortage}>
          Thiếu hàng
        </Button>
        <Button type="primary" disabled={disabled} onClick={onVas}>
          Thêm dịch vụ cộng thêm (VAS)
        </Button>
      </Space>
    </div>
  )
}
