import { useRef, useState } from 'react'
import { BarcodeOutlined, CameraOutlined } from '@ant-design/icons'
import { Button, Input, type InputRef } from 'antd'
import { usePdaScan } from './PdaScannerOverlay'

type Props = {
  placeholder?: string
  onScan: (value: string) => void
  loading?: boolean
  autoFocus?: boolean
  scanTitle?: string
}

export function PdaScanBar({
  placeholder = 'Quét hoặc nhập mã…',
  onScan,
  loading,
  autoFocus = true,
  scanTitle,
}: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<InputRef>(null)
  const { requestScan } = usePdaScan()

  const submit = (raw?: string) => {
    const q = (raw ?? value).trim()
    if (!q) return
    onScan(q)
    setValue('')
    inputRef.current?.focus()
  }

  const openCamera = async () => {
    const code = await requestScan({ title: scanTitle || 'Scan' })
    if (code) submit(code)
  }

  return (
    <div className="pda-scan-bar">
      <Input
        ref={inputRef}
        size="large"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        prefix={<BarcodeOutlined />}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={() => submit()}
        disabled={loading}
      />
      <Button
        className="pda-scan-cam"
        size="large"
        icon={<CameraOutlined />}
        onClick={openCamera}
        disabled={loading}
      />
      <Button type="primary" size="large" loading={loading} onClick={() => submit()}>
        OK
      </Button>
    </div>
  )
}
