import { useState } from 'react'
import { Button, InputNumber, message } from 'antd'
import { pdaSamples } from '../../data/pdaSampleData'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

export default function PdaTransferPage() {
  const [src, setSrc] = useState('')
  const [dst, setDst] = useState('')
  const [sku, setSku] = useState('')
  const [qty, setQty] = useState(1)

  const handleScan = (code: string) => {
    if (!src) {
      setSrc(code)
      message.success(`Nguồn: ${code}`)
      return
    }
    if (!sku) {
      setSku(code)
      message.success(`SKU: ${code}`)
      return
    }
    setDst(code)
    message.success(`Đích: ${code}`)
  }

  usePdaSamplePanel(pdaSamples.putaway, handleScan)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Chuyển container / SKU</div>
        <p className="pda-hint">Nguồn → SKU → đích · POST /wms/api/v1/containers/transfer</p>
        <PdaScanBar
          placeholder={!src ? 'Quét container nguồn' : !sku ? 'Quét SKU' : 'Quét vị trí / container đích'}
          onScan={handleScan}
          scanTitle="Transfer"
        />
        <div className="pda-kv" style={{ marginBottom: 12 }}>
          <div>
            <div className="pda-kv-label">Nguồn</div>
            <div className="pda-kv-value mono">{src || '—'}</div>
          </div>
          <div>
            <div className="pda-kv-label">Đích</div>
            <div className="pda-kv-value mono">{dst || '—'}</div>
          </div>
        </div>
        {sku ? (
          <div className="pda-qty-row">
            {sku} · SL <InputNumber min={1} value={qty} onChange={(v) => setQty(v ?? 1)} />
          </div>
        ) : null}
        <div className="pda-actions">
          <Button
            type="primary"
            size="large"
            block
            disabled={!src || !dst}
            onClick={() => {
              message.success('Đã chuyển')
              setSrc('')
              setDst('')
              setSku('')
            }}
          >
            Xác nhận chuyển
          </Button>
        </div>
      </div>
    </div>
  )
}
