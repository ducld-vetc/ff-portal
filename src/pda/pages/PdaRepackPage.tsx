import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, InputNumber, message } from 'antd'
import { pdaSamples } from '../../data/pdaSampleData'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

export default function PdaRepackPage() {
  const [params] = useSearchParams()
  const mode = params.get('mode') === 'consolidate' ? 'consolidate' : 'break'
  const [container, setContainer] = useState('')
  const [sku, setSku] = useState('')
  const [qty, setQty] = useState(1)

  const handleScan = (code: string) => {
    if (!container) {
      setContainer(code)
      return
    }
    setSku(code)
  }

  usePdaSamplePanel(pdaSamples.putaway, handleScan)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">
          {mode === 'consolidate' ? 'Gom hàng' : 'Tách hàng'}
        </div>
        <p className="pda-hint">
          {mode === 'consolidate'
            ? 'POST /repack/consolidate — gộp SKU vào container'
            : 'POST /repack/break — bóc pallet / thùng'}
        </p>
        <PdaScanBar
          placeholder={!container ? 'Quét container' : 'Quét SKU'}
          onScan={handleScan}
          scanTitle="Repack"
        />
        <div className="pda-kv" style={{ marginBottom: 12 }}>
          <div>
            <div className="pda-kv-label">Container</div>
            <div className="pda-kv-value mono">{container || '—'}</div>
          </div>
          <div>
            <div className="pda-kv-label">SKU</div>
            <div className="pda-kv-value mono">{sku || '—'}</div>
          </div>
        </div>
        <div className="pda-qty-row">
          SL <InputNumber min={1} value={qty} onChange={(v) => setQty(v ?? 1)} />
        </div>
        <div className="pda-actions">
          <Button
            type="primary"
            size="large"
            block
            disabled={!container || !sku}
            onClick={() => message.success(mode === 'consolidate' ? 'Đã gom hàng' : 'Đã tách hàng')}
          >
            {mode === 'consolidate' ? 'Consolidate' : 'Break'}
          </Button>
        </div>
      </div>
    </div>
  )
}
