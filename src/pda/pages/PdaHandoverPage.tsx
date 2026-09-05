import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Tag, message } from 'antd'
import {
  createCarrierHandover,
  getCarrierHandover,
  handoverCarrierOptions,
  handoverSessionTypeLabel,
  handoverStatusLabel,
  isOutboundCancelled,
  listCancelledPackagesInSession,
  listCarrierHandovers,
  packageConditionOptions,
  returnTypeOptions,
  type CarrierHandoverSession,
  type HandoverSessionType,
} from '../../data/carrierHandovers'
import { pdaSamples } from '../../data/pdaSampleData'
import {
  pdaConfirmHandover,
  pdaHandoverRemovePackage,
  pdaHandoverScan,
} from '../../data/pdaApi'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'
import { usePda } from '../PdaContext'

const CARRIERS = [...handoverCarrierOptions, { value: 'NJV', label: 'Ninja Van' }]

type Props = {
  mode: HandoverSessionType
}

export default function PdaHandoverPage({ mode }: Props) {
  const navigate = useNavigate()
  const { auth, handoverSessionId, setHandoverSessionId } = usePda()
  const isReceipt = mode === 'receipt'

  const [carrier, setCarrier] = useState(isReceipt ? 'JT' : 'GHN')
  const [session, setSession] = useState<CarrierHandoverSession | null>(null)
  const [returnType, setReturnType] = useState('Hàng trả')
  const [condition, setCondition] = useState('Tốt')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!handoverSessionId) {
      setSession(null)
      return
    }
    const hit = getCarrierHandover(handoverSessionId)
    if (!hit || hit.sessionType !== mode || hit.status === 'handed_over') {
      setHandoverSessionId(null)
      setSession(null)
      return
    }
    setSession(hit)
    setCarrier(hit.carrierCode)
  }, [handoverSessionId, mode, setHandoverSessionId])

  const openSessions = useMemo(
    () =>
      listCarrierHandovers().filter(
        (s) => s.sessionType === mode && s.status !== 'handed_over' && s.status !== 'cancelled',
      ),
    [mode, session?.packageCount, session?.status],
  )

  const cancelledInSession = session ? listCancelledPackagesInSession(session.packages) : []

  const createSession = () => {
    const opt = CARRIERS.find((c) => c.value === carrier)
    const row = createCarrierHandover({
      sessionType: mode,
      carrierCode: carrier,
      carrierName: opt?.label || carrier,
      packages: [],
      createdBy: auth?.operatorName,
    })
    setHandoverSessionId(row.id)
    setSession(row)
    message.success(`Đã tạo ${row.code}`)
  }

  const openExisting = (id: string) => {
    const hit = listCarrierHandovers().find((s) => s.id === id)
    if (!hit || hit.sessionType !== mode) return
    setHandoverSessionId(hit.id)
    setSession(hit)
    setCarrier(hit.carrierCode)
  }

  const refresh = (next: CarrierHandoverSession) => {
    setSession(next)
  }

  const scan = (value: string) => {
    if (!session) {
      message.warning('Tạo hoặc chọn phiên trước')
      return
    }
    setLoading(true)
    const result = pdaHandoverScan(session.id, value, {
      returnType: isReceipt ? returnType : undefined,
      condition: isReceipt ? condition : undefined,
    })
    setLoading(false)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    refresh(result.data!)
    message.success(`Đã thêm · Tổng ${result.data!.packageCount} kiện`)
  }

  const removePkg = (packageCode: string) => {
    if (!session) return
    const result = pdaHandoverRemovePackage(session.id, packageCode)
    if (result.error) {
      message.error(result.error.message)
      return
    }
    refresh(result.data!)
    message.success(`Đã loại ${packageCode}`)
  }

  const doConfirm = (removeCancelled = false) => {
    if (!session) return
    setLoading(true)
    const result = pdaConfirmHandover(session.id, { removeCancelled })
    setLoading(false)
    if (result.error) {
      if (result.error.code === 'HAS_CANCELLED_OR') {
        Modal.confirm({
          title: 'Còn OR đã hủy trong phiên',
          content: result.error.message,
          okText: 'Loại hủy & bàn giao phần còn lại',
          cancelText: 'Đóng',
          onOk: () => doConfirm(true),
        })
        return
      }
      message.error(result.error.message)
      return
    }
    setSession(null)
    setHandoverSessionId(null)
    message.success(`Đã bàn giao ${result.data!.code}`)
  }

  const confirm = () => {
    if (!session) return
    if (session.packageCount === 0) {
      message.warning('Quét ít nhất một kiện')
      return
    }
    doConfirm(false)
  }

  const closeSessionView = () => {
    setSession(null)
    setHandoverSessionId(null)
  }

  usePdaSamplePanel(pdaSamples.handover, session ? scan : undefined)

  if (!session) {
    return (
      <div className="pda-handover-page">
        <div className="pda-section">
          <div className="pda-section-title">Bàn giao 3PL</div>
          <p className="pda-hint">
            {isReceipt
              ? 'Tạo phiên nhận hàng trả từ ĐVVC, quét kiện/OR/vận đơn.'
              : 'Tạo phiên giao kiện cho ĐVVC / 3PL, quét kiện/OR/vận đơn.'}
          </p>

          <div className="pda-mode-switch">
            <button
              type="button"
              className={`pda-chip ${mode === 'delivery' ? 'active' : ''}`}
              onClick={() => navigate('/pda/handover/delivery')}
            >
              Phiên giao
            </button>
            <button
              type="button"
              className={`pda-chip ${mode === 'receipt' ? 'active' : ''}`}
              onClick={() => navigate('/pda/handover/receipt')}
            >
              Phiên nhận
            </button>
          </div>

          <div className="pda-kv-label" style={{ marginTop: 12, marginBottom: 6 }}>
            Đối tác vận chuyển
          </div>
          <div className="pda-chip-row">
            {CARRIERS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`pda-chip ${carrier === c.value ? 'active' : ''}`}
                onClick={() => setCarrier(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <Button type="primary" size="large" block onClick={createSession}>
            Tạo {handoverSessionTypeLabel[mode].toLowerCase()}
          </Button>
        </div>

        {openSessions.length ? (
          <div className="pda-section">
            <div className="pda-section-title">Phiên đang mở</div>
            {openSessions.map((s) => (
              <div
                key={s.id}
                className="pda-line-card"
                role="button"
                tabIndex={0}
                onClick={() => openExisting(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openExisting(s.id)
                }}
              >
                <div className="pda-kv-value mono">{s.code}</div>
                <div className="pda-handover-meta">
                  {s.carrierName} · {s.packageCount} kiện ·{' '}
                  <Tag>{handoverStatusLabel[s.status]}</Tag>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="pda-handover-page">
      <div className="pda-section">
        <div className="pda-section-title">{session.code}</div>
        <div className="pda-kv pda-handover-session-meta">
          <div>
            <div className="pda-kv-label">Loại</div>
            <div className="pda-kv-value">{handoverSessionTypeLabel[session.sessionType]}</div>
          </div>
          <div>
            <div className="pda-kv-label">ĐVVC</div>
            <div className="pda-kv-value">{session.carrierName}</div>
          </div>
          <div>
            <div className="pda-kv-label">Kiện</div>
            <div className="pda-kv-value">{session.packageCount}</div>
          </div>
        </div>

        {isReceipt ? (
          <>
            <div className="pda-kv-label" style={{ marginBottom: 6 }}>
              Loại trả / Tình trạng (áp dụng khi quét)
            </div>
            <div className="pda-chip-row" style={{ marginBottom: 8 }}>
              {returnTypeOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`pda-chip ${returnType === o.value ? 'active' : ''}`}
                  onClick={() => setReturnType(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="pda-chip-row" style={{ marginBottom: 12 }}>
              {packageConditionOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`pda-chip ${condition === o.value ? 'active' : ''}`}
                  onClick={() => setCondition(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <PdaScanBar
          placeholder="Quét kiện / vận đơn / OR"
          onScan={scan}
          loading={loading}
        />

        {cancelledInSession.length ? (
          <div className="pda-handover-warn">
            {cancelledInSession.length} kiện thuộc OR đã hủy — loại trước khi bàn giao.
          </div>
        ) : null}

        <div className="pda-actions">
          <Button
            type="primary"
            size="large"
            block
            disabled={session.packageCount === 0}
            loading={loading}
            onClick={confirm}
          >
            Xác nhận bàn giao
          </Button>
          <Button size="large" block onClick={closeSessionView}>
            Đóng phiên (tạm)
          </Button>
        </div>
      </div>

      {session.packages.length ? (
        <div className="pda-section">
          <div className="pda-section-title">Kiện trong phiên</div>
          {session.packages.map((p) => {
            const cancelled = isOutboundCancelled(p.outboundCode)
            return (
              <div
                key={p.id}
                className={`pda-line-card pda-handover-pkg ${cancelled ? 'cancelled' : 'done'}`}
              >
                <div className="pda-handover-pkg-main">
                  <div className="pda-kv-value mono">{p.packageCode}</div>
                  <div className="pda-handover-meta">
                    {p.outboundCode} · {p.trackingCode}
                    {cancelled ? (
                      <>
                        {' '}
                        · <Tag color="error">OR hủy</Tag>
                      </>
                    ) : null}
                  </div>
                  {isReceipt && (p.returnType || p.condition) ? (
                    <div className="pda-handover-meta">
                      {p.returnType || '—'} · {p.condition || '—'}
                    </div>
                  ) : null}
                </div>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => removePkg(p.packageCode)}
                >
                  Loại
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="pda-section">
          <p className="pda-hint">Chưa có kiện — quét mã kiện, vận đơn hoặc OR.</p>
        </div>
      )}
    </div>
  )
}
