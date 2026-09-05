import { useState } from 'react'
import { Button, InputNumber, Select, message } from 'antd'
import { pdaSamples } from '../../data/pdaSampleData'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

const REASONS = [
  { value: 'DAMAGED', label: 'Hư hỏng (DAMAGED)' },
  { value: 'WRONG', label: 'Sai hàng' },
  { value: 'SHORT', label: 'Thiếu hàng' },
]

type Line = { sku: string; qty: number; broken: number }

export default function PdaReturnNotePage() {
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('DAMAGED')
  const [lines, setLines] = useState<Line[]>([])

  const addSku = (sku: string) => {
    setLines((prev) => [...prev, { sku, qty: 1, broken: 0 }])
    message.success(`Thêm ${sku}`)
  }

  usePdaSamplePanel(pdaSamples.inquiry, addSku)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Tạo phiếu trả</div>
        <p className="pda-hint">Return note · /wms/api/v1/return-notes</p>
        <PdaScanBar
          placeholder="Quét ticket / vận đơn"
          onScan={(c) => setTicket(c)}
          scanTitle="Return note"
        />
        {ticket ? <div className="pda-kv-value mono">Ticket # {ticket}</div> : null}
        <div style={{ margin: '12px 0' }}>
          <div className="pda-kv-label" style={{ marginBottom: 6 }}>
            Lý do
          </div>
          <Select style={{ width: '100%' }} size="large" value={reason} onChange={setReason} options={REASONS} />
        </div>
        <PdaScanBar placeholder="Quét SKU thêm dòng" onScan={addSku} scanTitle="SKU" autoFocus={false} />
        {lines.map((line, i) => (
          <div key={`${line.sku}-${i}`} className="pda-line-card">
            <div className="mono">{line.sku}</div>
            <div className="pda-qty-row">
              Tốt <InputNumber min={0} value={line.qty} onChange={(v) => {
                const next = [...lines]
                next[i] = { ...line, qty: v ?? 0 }
                setLines(next)
              }} />
              {'  '}Hỏng{' '}
              <InputNumber min={0} value={line.broken} onChange={(v) => {
                const next = [...lines]
                next[i] = { ...line, broken: v ?? 0 }
                setLines(next)
              }} />
            </div>
          </div>
        ))}
        <div className="pda-actions">
          <Button
            type="primary"
            size="large"
            block
            disabled={!ticket || lines.length === 0}
            onClick={() => message.success('Đã tạo phiếu trả · chờ duyệt')}
          >
            Gửi phiếu trả
          </Button>
        </div>
      </div>
    </div>
  )
}
