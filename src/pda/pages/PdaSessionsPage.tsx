import { Button } from 'antd'
import { pdaGetActiveSessions } from '../../data/pdaApi'
import { usePda } from '../PdaContext'

export default function PdaSessionsPage() {
  const { auth, setReceiveSessionId, setPickSessionId, setPackSessionId } = usePda()
  if (!auth) return null

  const active = pdaGetActiveSessions(auth.operatorId)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Phiên đang mở</div>
        <p className="pda-hint">Receive · Pick · Pack trên thiết bị này.</p>
      </div>

      <div className="pda-section">
        <div className="pda-section-title">Nhận hàng ({active.receive.length})</div>
        {active.receive.length === 0 ? (
          <p className="pda-hint">Không có phiên receive.</p>
        ) : (
          active.receive.map((s) => (
            <div key={s.id} className="pda-line-card">
              <div className="mono">{s.id}</div>
              <div style={{ fontSize: 12 }}>IR: {s.irId}</div>
              <Button
                size="small"
                style={{ marginTop: 8 }}
                onClick={() => setReceiveSessionId(s.id)}
              >
                Tiếp tục
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="pda-section">
        <div className="pda-section-title">Lấy hàng ({active.pick.length})</div>
        {active.pick.length === 0 ? (
          <p className="pda-hint">Không có phiên pick.</p>
        ) : (
          active.pick.map((s) => (
            <div key={s.id} className="pda-line-card">
              <div className="mono">{s.id}</div>
              <div style={{ fontSize: 12 }}>Pick list: {s.pickListId}</div>
              {s.toteCode ? <div style={{ fontSize: 12 }}>Tote: {s.toteCode}</div> : null}
              <Button size="small" style={{ marginTop: 8 }} onClick={() => setPickSessionId(s.id)}>
                Tiếp tục
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="pda-section">
        <div className="pda-section-title">Đóng gói ({active.pack.length})</div>
        {active.pack.length === 0 ? (
          <p className="pda-hint">Không có phiên pack.</p>
        ) : (
          active.pack.map((s) => (
            <div key={s.id} className="pda-line-card">
              <div className="mono">{s.id}</div>
              <div style={{ fontSize: 12 }}>Tote: {s.toteCode}</div>
              <Button size="small" style={{ marginTop: 8 }} onClick={() => setPackSessionId(s.id)}>
                Tiếp tục
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
