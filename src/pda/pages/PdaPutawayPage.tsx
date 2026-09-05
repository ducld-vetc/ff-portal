import { useState } from 'react'
import { Button, InputNumber, message } from 'antd'
import { pdaSamples } from '../../data/pdaSampleData'
import { pdaConfirmPutaway, pdaListPutawayTasks, type PutawayTask } from '../../data/pdaApi'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'
import { usePda } from '../PdaContext'

export default function PdaPutawayPage() {
  const { auth } = usePda()
  const [tasks, setTasks] = useState<PutawayTask[]>(() =>
    auth ? pdaListPutawayTasks(auth.warehouseCode).data || [] : [],
  )
  const [active, setActive] = useState<PutawayTask | null>(null)
  const [binCode, setBinCode] = useState('')
  const [sku, setSku] = useState('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'sku' | 'container'>('sku')

  const refresh = () => {
    if (!auth) return
    setTasks(pdaListPutawayTasks(auth.warehouseCode).data || [])
  }

  const handleScan = (code: string) => {
    if (!active) {
      message.info('Chọn container / task trước')
      return
    }
    if (mode === 'container') {
      setBinCode(code)
      message.success(`Vị trí: ${code}`)
      return
    }
    if (!binCode) {
      setBinCode(code)
      message.success(`Kệ / bin: ${code}`)
      return
    }
    setSku(code)
    message.success(`SKU: ${code}`)
  }

  const confirm = (whole = false) => {
    if (!active || !binCode) {
      message.warning('Quét vị trí đích')
      return
    }
    if (!whole && !sku) {
      message.warning('Quét SKU hoặc chọn Cất cả container')
      return
    }
    setLoading(true)
    const result = pdaConfirmPutaway(active.id, {
      binCode,
      sku: whole ? active.sku : sku,
      qty: whole ? active.qtyRemaining : qty,
    })
    setLoading(false)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    message.success(whole ? `Đã cất cả container vào ${binCode}` : `Đã cất ${qty} vào ${binCode}`)
    setBinCode('')
    setSku('')
    setQty(1)
    if (result.data!.status === 'completed') setActive(null)
    refresh()
  }

  usePdaSamplePanel(pdaSamples.putaway, handleScan)

  return (
    <div>
      {!active ? (
        <div className="pda-section">
          <div className="pda-section-title">Container chờ lưu kho</div>
          <p className="pda-hint">Chọn phiếu sau khi hoàn tất nhận hàng.</p>
          {tasks.length === 0 ? (
            <p className="pda-hint">Không có task mở — hoàn tất IR trước.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="pda-line-card"
                role="button"
                tabIndex={0}
                onClick={() => setActive(task)}
                onKeyDown={(e) => e.key === 'Enter' && setActive(task)}
              >
                <div className="pda-kv-value mono">{task.irCode}</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  {task.sku} · Còn {task.qtyRemaining}
                </div>
                <div style={{ fontSize: 12, color: '#1565c0', marginTop: 4 }}>
                  Gợi ý: {task.suggestedBin}
                </div>
              </div>
            ))
          )}
          <Button size="large" block onClick={refresh} style={{ marginTop: 8 }}>
            Làm mới
          </Button>
        </div>
      ) : (
        <div className="pda-section">
          <div className="pda-section-title">Putaway · {active.sku}</div>
          <div className="pda-chip-row">
            <button
              type="button"
              className={`pda-chip ${mode === 'sku' ? 'active' : ''}`}
              onClick={() => setMode('sku')}
            >
              Theo SKU
            </button>
            <button
              type="button"
              className={`pda-chip ${mode === 'container' ? 'active' : ''}`}
              onClick={() => setMode('container')}
            >
              Cả container
            </button>
          </div>
          <div className="pda-kv" style={{ marginBottom: 12 }}>
            <div>
              <div className="pda-kv-label">IR</div>
              <div className="pda-kv-value mono">{active.irCode}</div>
            </div>
            <div>
              <div className="pda-kv-label">Còn lại</div>
              <div className="pda-kv-value">{active.qtyRemaining}</div>
            </div>
            <div>
              <div className="pda-kv-label">Bin gợi ý</div>
              <div className="pda-kv-value mono">{active.suggestedBin}</div>
            </div>
          </div>
          <PdaScanBar
            placeholder={
              mode === 'container' || !binCode ? 'Quét vị trí (bin / kệ)' : 'Quét SKU'
            }
            onScan={handleScan}
            loading={loading}
            scanTitle="Putaway"
          />
          {binCode ? (
            <div style={{ marginBottom: 8 }}>
              <span className="pda-kv-label">Vị trí: </span>
              <span className="pda-kv-value mono">{binCode}</span>
            </div>
          ) : null}
          {mode === 'sku' && sku ? (
            <div style={{ marginBottom: 8 }}>
              <span className="pda-kv-label">SKU: </span>
              <span className="pda-kv-value mono">{sku}</span>
              <div style={{ marginTop: 8 }}>
                SL{' '}
                <InputNumber
                  min={1}
                  max={active.qtyRemaining}
                  value={qty}
                  onChange={(v) => setQty(v ?? 1)}
                />
              </div>
            </div>
          ) : null}
          <div className="pda-actions">
            {mode === 'container' ? (
              <Button type="primary" size="large" block loading={loading} onClick={() => confirm(true)}>
                Cất cả container
              </Button>
            ) : (
              <Button type="primary" size="large" block loading={loading} onClick={() => confirm(false)}>
                Xác nhận cất
              </Button>
            )}
            <Button size="large" block onClick={() => setActive(null)}>
              Chọn task khác
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
