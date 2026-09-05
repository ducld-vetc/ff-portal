import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, InputNumber, Tag, message } from 'antd'
import { pickListStatusLabel, type PickList } from '../../data/pickingLists'
import { pdaSamples } from '../../data/pdaSampleData'
import {
  pdaAssignTote,
  pdaCompletePickSession,
  pdaConfirmPickLine,
  pdaFindPickSession,
  pdaGetPickSession,
  pdaListPickTasks,
  pdaNextPickLine,
  pdaStartPickSession,
} from '../../data/pdaApi'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'
import { usePda } from '../PdaContext'

function pickProgress(pl: PickList) {
  const total = pl.lines.length
  const done = pl.lines.filter((l) => l.pickedQty >= l.qty).length
  return { total, done }
}

function applyPickSession(
  sessionId: string,
  setPickSessionId: (id: string | null) => void,
  setActivePickList: (pl: PickList | null) => void,
  setToteCode: (code: string) => void,
) {
  const result = pdaGetPickSession(sessionId)
  if (result.error) return false
  setPickSessionId(sessionId)
  setActivePickList(result.data!.pickList)
  setToteCode(result.data!.session.toteCode ?? '')
  return true
}

export default function PdaPickPage() {
  const { auth, pickSessionId, setPickSessionId } = usePda()
  const [tasks, setTasks] = useState<PickList[]>([])
  const [loaded, setLoaded] = useState(false)
  const [activePickList, setActivePickList] = useState<PickList | null>(null)
  const [toteCode, setToteCode] = useState('')
  const [binCode, setBinCode] = useState('')
  const [skuScan, setSkuScan] = useState('')
  const [qty, setQty] = useState(1)
  const [brokenQty, setBrokenQty] = useState(0)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const loadTasks = useCallback(() => {
    if (!auth) return
    const result = pdaListPickTasks(auth.operatorName)
    const nextTasks = result.data || []
    setTasks(nextTasks)
    setLoaded(true)
    if (nextTasks.length === 0) {
      message.warning('Không có pick list ready/picking (B2C). Kiểm tra seed Admin → Lấy hàng.')
    }
  }, [auth])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    if (!pickSessionId) {
      setActivePickList(null)
      setToteCode('')
      setBinCode('')
      setSkuScan('')
      return
    }
    const result = pdaGetPickSession(pickSessionId)
    if (result.error) {
      setPickSessionId(null)
      message.warning('Phiên lấy hàng đã hết hạn. Chọn pick list để bắt đầu lại.')
      return
    }
    setActivePickList(result.data!.pickList)
    setToteCode(result.data!.session.toteCode ?? '')
  }, [pickSessionId, setPickSessionId])

  const line = useMemo(() => {
    if (!pickSessionId) return null
    void tick
    return pdaNextPickLine(pickSessionId).data ?? null
  }, [pickSessionId, tick])

  const progress = activePickList ? pickProgress(activePickList) : null
  const scanStep = !toteCode ? 'tote' : !binCode ? 'bin' : 'sku'

  const startPick = (pl: PickList) => {
    if (!auth) return
    setLoadingId(pl.id)
    const existing = pdaFindPickSession(pl.id, auth.operatorId)
    if (existing) {
      applyPickSession(existing.id, setPickSessionId, setActivePickList, setToteCode)
      setBinCode('')
      setSkuScan('')
      setQty(1)
      setLoadingId(null)
      message.info(`Tiếp tục ${pl.code}`)
      return
    }
    const result = pdaStartPickSession(pl.id, auth.operatorId)
    setLoadingId(null)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    setActivePickList(result.data!.pickList)
    setToteCode('')
    setBinCode('')
    setSkuScan('')
    setQty(1)
    setPickSessionId(result.data!.session.id)
    message.success(`Bắt đầu ${pl.code}`)
  }

  const handleScan = (code: string) => {
    if (!pickSessionId) return
    if (!toteCode) {
      setToteCode(code)
      pdaAssignTote(pickSessionId, code)
      message.success(`Tote: ${code}`)
      return
    }
    if (!line) return
    if (!binCode) {
      setBinCode(code)
      message.success(`Bin: ${code}`)
      return
    }
    setSkuScan(code)
    message.success(`SKU: ${code}`)
  }

  const confirmPick = () => {
    if (!pickSessionId || !line || !binCode || !skuScan) {
      message.warning('Quét tote → bin → SKU')
      return
    }
    setLoadingId('confirm')
    const result = pdaConfirmPickLine(pickSessionId, {
      lineId: line.id,
      binCode,
      sku: skuScan,
      qty,
    })
    setLoadingId(null)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    setActivePickList(result.data!)
    message.success(
      `Đã lấy ${qty} · ${line.sku}` + (brokenQty ? ` · BROKEN ${brokenQty}` : ''),
    )
    setBinCode('')
    setSkuScan('')
    setQty(1)
    setBrokenQty(0)
    setTick((t) => t + 1)
  }

  const complete = () => {
    if (!pickSessionId) return
    setLoadingId('complete')
    const result = pdaCompletePickSession(pickSessionId)
    setLoadingId(null)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    setPickSessionId(null)
    setActivePickList(null)
    setToteCode('')
    setBinCode('')
    setSkuScan('')
    loadTasks()
    message.success('Hoàn tất phiên lấy hàng')
  }

  const cancelSession = () => {
    setPickSessionId(null)
    setActivePickList(null)
    setToteCode('')
    setBinCode('')
    setSkuScan('')
    message.info('Đã thoát phiên (pick list vẫn ở trạng thái picking)')
  }

  usePdaSamplePanel(pdaSamples.pick, pickSessionId ? handleScan : undefined)

  if (!pickSessionId) {
    return (
      <div className="pda-page">
        <div className="pda-section">
          <div className="pda-section-title">Lấy hàng · Pick List</div>
          <p className="pda-hint">Danh sách pick list được phân công (B2C Phase 1).</p>
          <Button type="primary" size="large" block onClick={loadTasks}>
            Tải lại pick list
          </Button>
        </div>

        {loaded && tasks.length === 0 ? (
          <div className="pda-section">
            <p className="pda-hint">
              Không có pick list sẵn sàng. Thử reload trang (Ctrl+R) để nạp lại seed demo{' '}
              <strong>PL260725PDA_DEMO_001</strong>.
            </p>
          </div>
        ) : null}

        {tasks.length > 0 ? (
          <div className="pda-section">
            <div className="pda-section-title">Pick list ({tasks.length})</div>
            {tasks.map((pl) => (
              <div key={pl.id} className="pda-line-card">
                <div className="pda-pick-card-header">
                  <span className="pda-kv-value mono pda-pick-code">{pl.code}</span>
                  <Tag color={pl.status === 'picking' ? 'processing' : 'blue'}>
                    {pickListStatusLabel[pl.status]}
                  </Tag>
                </div>
                <div className="pda-pick-card-meta">
                  {pl.type} · {pl.orderQty} đơn · {pl.productQty} SP
                </div>
                <Button
                  type="primary"
                  block
                  className="pda-pick-card-action"
                  onClick={() => startPick(pl)}
                  loading={loadingId === pl.id}
                >
                  {pl.status === 'picking' ? 'Tiếp tục lấy hàng' : 'Bắt đầu lấy hàng'}
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const sessionBusy = loadingId === 'confirm' || loadingId === 'complete'

  return (
    <div className="pda-page pda-page--pick-session">
      <div className="pda-session-header">
        <div className="pda-session-header-row">
          <span className="pda-session-code mono">{activePickList?.code ?? '…'}</span>
          {activePickList ? <Tag color="processing">{activePickList.type}</Tag> : null}
        </div>
        {progress ? (
          <div className="pda-session-progress">
            Dòng {Math.min(progress.done + (line ? 1 : 0), progress.total)}/{progress.total}
            {toteCode ? ` · Tote ${toteCode}` : ''}
          </div>
        ) : null}
      </div>

      <div className="pda-step-bar">
        <span className={scanStep === 'tote' ? 'active' : toteCode ? 'done' : ''}>1. Tote</span>
        <span className={scanStep === 'bin' ? 'active' : binCode ? 'done' : ''}>2. Bin</span>
        <span className={scanStep === 'sku' ? 'active' : skuScan ? 'done' : ''}>3. SKU</span>
      </div>

      <div className="pda-section">
        <div className="pda-section-title">Directed Pick</div>
        {!toteCode ? (
          <p className="pda-hint">Quét mã tote trước khi đến vị trí lấy hàng.</p>
        ) : null}
        {line ? (
          <div className="pda-line-card active">
            <div className="pda-kv-label">GO TO LOCATION</div>
            <div className="pda-location-display mono">{line.location}</div>
            <div className="pda-pick-product">{line.productName}</div>
            <div className="pda-pick-card-meta">
              {line.sku} · {line.pickedQty}/{line.qty} {line.unit}
            </div>
          </div>
        ) : toteCode ? (
          <div className="pda-result-ok">Đã lấy đủ — bấm Hoàn tất</div>
        ) : null}
        <PdaScanBar
          placeholder={!toteCode ? 'Quét tote' : !binCode ? 'Quét bin' : 'Quét SKU'}
          onScan={handleScan}
          loading={sessionBusy}
        />
        {binCode ? (
          <div className="pda-scan-confirm">
            Bin: <span className="mono">{binCode}</span>
          </div>
        ) : null}
        {skuScan ? (
          <div className="pda-scan-confirm">
            SKU: <span className="mono">{skuScan}</span>
            <div className="pda-qty-row">
              SL tốt <InputNumber min={0} value={qty} onChange={(v) => setQty(v ?? 0)} />
              {'  '}Hỏng{' '}
              <InputNumber min={0} value={brokenQty} onChange={(v) => setBrokenQty(v ?? 0)} />
            </div>
          </div>
        ) : null}
        <div className="pda-actions">
          {line && toteCode ? (
            <>
              <Button type="primary" size="large" block loading={sessionBusy} onClick={confirmPick}>
                Xác nhận lấy
              </Button>
              <Button
                size="large"
                block
                loading={sessionBusy}
                onClick={() => {
                  setQty(0)
                  message.info('SHORT_PICKED — xác nhận SL đã lấy')
                }}
              >
                Short pick
              </Button>
            </>
          ) : null}
          <Button size="large" block loading={sessionBusy} onClick={complete}>
            Hoàn tất phiên
          </Button>
          <Button type="link" block onClick={cancelSession} disabled={sessionBusy}>
            Thoát phiên
          </Button>
        </div>
      </div>
    </div>
  )
}
