import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, InputNumber, Select, message } from 'antd'
import { pdaSamples } from '../../data/pdaSampleData'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

const UOMS = [
  { value: 'PCS', label: 'PCS — Cái' },
  { value: 'INNER', label: 'INNER — Lốc' },
  { value: 'CTN', label: 'CTN — Thùng' },
  { value: 'PALLET', label: 'PALLET' },
]

export default function PdaConversionPage() {
  const location = useLocation()
  const isCondition = location.pathname.includes('condition')
  const [sku, setSku] = useState('')
  const [qty, setQty] = useState(1)
  const [fromUom, setFromUom] = useState('CTN')
  const [toUom, setToUom] = useState('PCS')
  const [direction, setDirection] = useState<'GOOD_TO_BROKEN' | 'BROKEN_TO_GOOD'>('GOOD_TO_BROKEN')

  usePdaSamplePanel(pdaSamples.inquiry, setSku)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">{isCondition ? 'Đổi tình trạng' : 'Đổi đơn vị tính'}</div>
        <PdaScanBar placeholder="Quét SKU" onScan={setSku} scanTitle="Conversion" />
        {sku ? <div className="pda-kv-value mono" style={{ marginBottom: 12 }}>{sku}</div> : null}

        {isCondition ? (
          <div className="pda-chip-row">
            <button
              type="button"
              className={`pda-chip ${direction === 'GOOD_TO_BROKEN' ? 'active' : ''}`}
              onClick={() => setDirection('GOOD_TO_BROKEN')}
            >
              GOOD → BROKEN
            </button>
            <button
              type="button"
              className={`pda-chip ${direction === 'BROKEN_TO_GOOD' ? 'active' : ''}`}
              onClick={() => setDirection('BROKEN_TO_GOOD')}
            >
              BROKEN → GOOD
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 10 }}>
              <div className="pda-kv-label">Từ UoM</div>
              <Select style={{ width: '100%' }} size="large" value={fromUom} onChange={setFromUom} options={UOMS} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div className="pda-kv-label">Sang UoM</div>
              <Select style={{ width: '100%' }} size="large" value={toUom} onChange={setToUom} options={UOMS} />
            </div>
          </>
        )}

        <div className="pda-qty-row">
          SL <InputNumber min={1} value={qty} onChange={(v) => setQty(v ?? 1)} />
        </div>
        <div className="pda-actions">
          <Button
            type="primary"
            size="large"
            block
            disabled={!sku}
            onClick={() =>
              message.success(isCondition ? `Đã ${direction} ×${qty}` : `Đã đổi ${fromUom} → ${toUom}`)
            }
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  )
}
