import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, InputNumber, Modal, Tag, message } from 'antd'
import {
  inboundStatusLabel,
  inboundTypeLabel,
  getInboundRequest,
  type InboundRequest,
} from '../../data/inboundRequests'
import { pdaSamples } from '../../data/pdaSampleData'
import { pdaCheckInInbound, pdaCompleteInbound, pdaLookupInbound, pdaReceiveLine } from '../../data/pdaApi'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'
import { usePda } from '../PdaContext'

export default function PdaReceivingPage() {
  const { auth, receiveSessionId, setReceiveSessionId } = usePda()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [ir, setIr] = useState<InboundRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sku, setSku] = useState('')
  const [qty, setQty] = useState(1)
  const [brokenQty, setBrokenQty] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tick, setTick] = useState(0)

  const displayIr = useMemo(() => {
    void tick
    if (ir) return ir
    const irId = sessionStorage.getItem('pda-active-ir-id')
    return irId ? getInboundRequest(irId) ?? null : null
  }, [ir, receiveSessionId, tick])

  const handleLookup = (code: string) => {
    setError(null)
    const result = pdaLookupInbound(code)
    if (result.error) {
      setError(result.error.message)
      setIr(null)
      return
    }
    setIr(result.data!)
    message.info(`Đã tìm thấy ${result.data!.code}`)
  }

  const startReceive = () => {
    if (!ir || !auth) return
    setLoading(true)
    const result = pdaCheckInInbound(ir.id, auth.warehouseCode, auth.operatorId)
    setLoading(false)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    setReceiveSessionId(result.data!.session.id)
    sessionStorage.setItem('pda-active-ir-id', result.data!.ir.id)
    message.success('Bắt đầu nhận hàng')
  }

  const openReceiveDialog = (code: string) => {
    setSku(code)
    setQty(1)
    setBrokenQty(0)
    setDialogOpen(true)
  }

  const confirmLine = () => {
    if (!receiveSessionId || !sku.trim()) return
    setLoading(true)
    const result = pdaReceiveLine(receiveSessionId, { sku: sku.trim(), qty: qty + brokenQty })
    setLoading(false)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    message.success(`Đã nhận ${qty} tốt` + (brokenQty ? ` · ${brokenQty} hỏng` : ''))
    setDialogOpen(false)
    setSku('')
    setTick((t) => t + 1)
  }

  const complete = () => {
    if (!receiveSessionId) return
    setLoading(true)
    const result = pdaCompleteInbound(receiveSessionId)
    setLoading(false)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    sessionStorage.removeItem('pda-active-ir-id')
    setReceiveSessionId(null)
    message.success('Hoàn tất — chuyển lưu kho')
    navigate('/pda/putaway')
  }

  usePdaSamplePanel(
    receiveSessionId ? pdaSamples.receiving : pdaSamples.checkIn,
    receiveSessionId ? openReceiveDialog : handleLookup,
  )

  if (!receiveSessionId) {
    return (
      <div>
        <div className="pda-section">
          <div className="pda-section-title">Quét phiếu nhập</div>
          <p className="pda-hint">Quét mã IR / mã đối tác — hoặc tạo phiếu mới trên portal.</p>
          <PdaScanBar placeholder="Mã IR / mã đối tác" onScan={handleLookup} loading={loading} scanTitle="Receiving" />
          {error ? <div className="pda-result-err">{error}</div> : null}
        </div>

        {ir ? (
          <div className="pda-section">
            <div className="pda-section-title">Thông tin phiếu</div>
            <div className="pda-kv">
              <div>
                <div className="pda-kv-label">Mã IR</div>
                <div className="pda-kv-value mono">{ir.code}</div>
              </div>
              <div>
                <div className="pda-kv-label">Trạng thái</div>
                <div className="pda-kv-value">
                  <Tag>{inboundStatusLabel[ir.status]}</Tag>
                </div>
              </div>
              <div>
                <div className="pda-kv-label">Kho</div>
                <div className="pda-kv-value">{ir.warehouseName}</div>
              </div>
              <div>
                <div className="pda-kv-label">Loại</div>
                <div className="pda-kv-value">{inboundTypeLabel[ir.type]}</div>
              </div>
            </div>
            <div className="pda-actions">
              <Button type="primary" size="large" block loading={loading} onClick={startReceive}>
                Bắt đầu nhận hàng
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Receiving</div>
        {displayIr ? (
          <div className="pda-kv" style={{ marginBottom: 8 }}>
            <div>
              <div className="pda-kv-label">Mã IR</div>
              <div className="pda-kv-value mono">{displayIr.code}</div>
            </div>
            <div>
              <div className="pda-kv-label">Thực nhận / Khai báo</div>
              <div className="pda-kv-value">
                {displayIr.receivedQty} / {displayIr.productQty}
              </div>
            </div>
          </div>
        ) : null}
        <div className="pda-progress-bar">
          <div
            className="pda-progress-fill"
            style={{
              width: displayIr
                ? `${Math.min(100, (displayIr.receivedQty / displayIr.productQty) * 100)}%`
                : '0%',
            }}
          />
        </div>
        <PdaScanBar placeholder="Quét SKU / barcode SP" onScan={openReceiveDialog} loading={loading} scanTitle="SKU" />
        <div className="pda-actions">
          <Button size="large" block loading={loading} onClick={complete}>
            Hoàn tất IR
          </Button>
        </div>
      </div>

      {displayIr ? (
        <div className="pda-section">
          <div className="pda-section-title">Dòng sản phẩm</div>
          {displayIr.lines.map((line) => (
            <div key={line.id} className="pda-line-card">
              <div style={{ fontWeight: 600, fontSize: 13 }}>{line.name}</div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {line.sku} · SL khai báo: {line.qty}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Modal
        title="Nhận SKU"
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onOk={confirmLine}
        okText="Xác nhận"
        confirmLoading={loading}
      >
        <div className="pda-kv-label">SKU</div>
        <div className="pda-kv-value mono" style={{ marginBottom: 12 }}>
          {sku}
        </div>
        <div style={{ marginBottom: 10 }}>
          SL tốt{' '}
          <InputNumber min={0} value={qty} onChange={(v) => setQty(v ?? 0)} />
        </div>
        <div>
          SL hỏng (BROKEN){' '}
          <InputNumber min={0} value={brokenQty} onChange={(v) => setBrokenQty(v ?? 0)} />
        </div>
      </Modal>
    </div>
  )
}
