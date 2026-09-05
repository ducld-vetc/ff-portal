import { useState } from 'react'
import { Button, InputNumber, message } from 'antd'
import { pdaSamples } from '../../data/pdaSampleData'
import { pdaUniversalScan } from '../../data/pdaApi'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

export default function PdaInventoryPage() {
  const [sku, setSku] = useState('')
  const [systemQty, setSystemQty] = useState<number | null>(null)
  const [counted, setCounted] = useState(0)

  const handleScan = (code: string) => {
    const result = pdaUniversalScan(code)
    const qty = result.data?.rows.reduce((s, r) => s + r.qty, 0) ?? 0
    setSku(code)
    setSystemQty(qty)
    setCounted(qty)
    if (!result.data || result.data.type === 'unknown') {
      message.warning('Không thấy tồn hệ thống — nhập SL đếm')
    } else {
      message.success(`SKU ${code} · tồn ${qty}`)
    }
  }

  usePdaSamplePanel(pdaSamples.inquiry, handleScan)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Verify / đếm tồn</div>
        <p className="pda-hint">Quét SKU trên kệ, nhập SL thực tế rồi gửi verify-bill.</p>
        <PdaScanBar placeholder="Quét SKU" onScan={handleScan} scanTitle="Inventory" />
        {sku ? (
          <>
            <div className="pda-kv" style={{ marginBottom: 12 }}>
              <div>
                <div className="pda-kv-label">SKU</div>
                <div className="pda-kv-value mono">{sku}</div>
              </div>
              <div>
                <div className="pda-kv-label">Tồn hệ thống</div>
                <div className="pda-kv-value">{systemQty ?? '—'}</div>
              </div>
            </div>
            <div className="pda-qty-row">
              SL đếm <InputNumber min={0} value={counted} onChange={(v) => setCounted(v ?? 0)} />
            </div>
            <div className="pda-actions">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => {
                  message.success(`Đã ghi verify-bill · ${sku} = ${counted}`)
                  setSku('')
                }}
              >
                Gửi phiếu kiểm
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
