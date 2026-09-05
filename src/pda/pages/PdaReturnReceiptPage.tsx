import { useState } from 'react'
import { Button, message } from 'antd'
import { pdaSamples } from '../../data/pdaSampleData'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

type Line = { sku: string; expected: number; scanned: number }

export default function PdaReturnReceiptPage() {
  const [note, setNote] = useState('')
  const [lines, setLines] = useState<Line[]>([])

  const handleScan = (code: string) => {
    if (!note) {
      setNote(code)
      setLines([
        { sku: '2304101', expected: 2, scanned: 0 },
        { sku: 'SKU-CHARGER-20W', expected: 1, scanned: 0 },
      ])
      message.success(`Phiếu nhận trả ${code}`)
      return
    }
    const idx = lines.findIndex((l) => l.sku === code)
    if (idx < 0) {
      message.error('SKU không thuộc phiếu trả')
      return
    }
    const next = [...lines]
    if (next[idx].scanned >= next[idx].expected) {
      message.warning('Đã đủ SL')
      return
    }
    next[idx] = { ...next[idx], scanned: next[idx].scanned + 1 }
    setLines(next)
  }

  usePdaSamplePanel(pdaSamples.receiving, handleScan)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Nhận hàng trả</div>
        <p className="pda-hint">Return receipt · /wms/api/v1/return-receipts</p>
        <PdaScanBar
          placeholder={note ? 'Quét SKU' : 'Quét mã phiếu trả'}
          onScan={handleScan}
          scanTitle="Return receipt"
        />
        {note ? <div className="pda-kv-value mono">RN {note}</div> : null}
        {lines.map((line) => (
          <div key={line.sku} className={`pda-line-card ${line.scanned >= line.expected ? 'done' : ''}`}>
            <div className="mono">{line.sku}</div>
            <div className="pda-pick-card-meta">
              {line.scanned}/{line.expected}
            </div>
          </div>
        ))}
        {lines.length ? (
          <div className="pda-actions">
            <Button
              type="primary"
              size="large"
              block
              disabled={lines.some((l) => l.scanned < l.expected)}
              onClick={() => message.success('Hoàn tất nhận trả')}
            >
              Complete
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
