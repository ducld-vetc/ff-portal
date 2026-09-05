import { useMemo, useState } from 'react'
import { Button, Modal, Progress, Tag, Typography, message } from 'antd'
import { PackPartialPinModal } from '../../components/packing/PackPartialPinModal'
import { PackVasModal } from '../../components/packing/PackVasModal'
import {
  addPackVas,
  getCurrentPackOrder,
  markPackShortage,
  packDemoToteHints,
  partialPackWithPin,
  pausePackSession,
  scanPackProduct,
  sessionProgress,
  startOrResumePackSession,
  type PackOrder,
  type PackOrderLine,
  type PackToteSession,
  type PackVasCode,
} from '../../data/packingSessions'
import { pickListTypeLabel } from '../../data/pickingLists'
import { pdaSamples } from '../../data/pdaSampleData'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'
import { usePda } from '../PdaContext'

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="pda-pack-thumb" />
  return <div className="pda-pack-thumb pda-pack-thumb-fallback">{label.slice(0, 2).toUpperCase()}</div>
}

function LineCard({ line, emphasize }: { line: PackOrderLine; emphasize?: boolean }) {
  const done = line.scannedQty >= line.qty
  return (
    <div
      className={`pda-line-card pda-pack-line${done ? ' done' : ''}${emphasize ? ' active' : ''}`}
    >
      <ProductThumb src={line.imageUrl} label={line.sku} />
      <div className="pda-pack-line-body">
        <div className="pda-pack-line-name">{line.name}</div>
        <div className="pda-pack-line-meta">
          <span className="mono">{line.sku}</span> · {line.scannedQty}/{line.qty} {line.unit}
        </div>
        {line.note ? <div className="pda-pack-line-note">{line.note}</div> : null}
        {line.status === 'shortage' ? <Tag color="red">Thiếu</Tag> : null}
        {line.status === 'skipped' ? <Tag>Bỏ qua</Tag> : null}
        {done && line.status !== 'skipped' ? <Tag color="green">Đủ</Tag> : null}
      </div>
    </div>
  )
}

export default function PdaPackPage() {
  const { setPackSessionId } = usePda()
  const [session, setSession] = useState<PackToteSession | null>(null)
  const [lastPacked, setLastPacked] = useState<PackOrder | null>(null)
  const [labelOpen, setLabelOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [vasOpen, setVasOpen] = useState(false)

  const progress = useMemo(
    () => (session ? sessionProgress(session) : { done: 0, total: 0 }),
    [session],
  )
  const currentOrder = session ? getCurrentPackOrder(session) : null

  const syncSession = (next: PackToteSession | null) => {
    setSession(
      next
        ? {
            ...next,
            orders: next.orders.map((o) => ({ ...o, lines: o.lines.map((l) => ({ ...l })) })),
          }
        : null,
    )
    setPackSessionId(next && next.status !== 'done' && next.status !== 'paused' ? next.id : null)
  }

  const applyResult = (
    result: ReturnType<typeof scanPackProduct>,
    opts?: { leave?: boolean },
  ) => {
    if (!result.ok) {
      message.error(result.message)
      return
    }
    message.success(result.message)
    if (result.completedOrder) {
      setLastPacked(result.completedOrder)
      setLabelOpen(true)
    }
    if (opts?.leave || result.session.status === 'paused') {
      syncSession(null)
      return
    }
    if (result.session.status === 'done') {
      syncSession(result.session)
      return
    }
    syncSession(result.session)
  }

  const startTote = (code: string) => {
    const result = startOrResumePackSession(code)
    if (!result.ok) {
      message.error(result.message)
      return
    }
    message.success(result.message)
    syncSession(result.session)
  }

  const scanSku = (sku: string) => {
    if (!session) return
    applyResult(scanPackProduct(session.id, sku))
  }

  const resetHome = () => {
    syncSession(null)
    setLastPacked(null)
    setLabelOpen(false)
  }

  usePdaSamplePanel(
    pdaSamples.pack,
    labelOpen ? undefined : session ? scanSku : startTote,
  )

  if (!session) {
    return (
      <div>
        <div className="pda-section">
          <div className="pda-section-title">Đóng gói · theo loại DSLH</div>
          <p className="pda-hint">
            Quét tote đã lấy hàng xong. Luồng đổi theo PTO/MIO/PTS, SIO, SSO, SMO.
          </p>
          <PdaScanBar placeholder="Quét mã tote" onScan={startTote} scanTitle="Pack tote" />
          <div className="pda-pack-hint-list">
            {packDemoToteHints.map((h) => (
              <button
                key={h.code}
                type="button"
                className="pda-pack-hint-chip"
                onClick={() => startTote(h.code)}
              >
                <span className="mono">{h.code}</span>
                <Tag>{h.pickType}</Tag>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (session.status === 'done') {
    return (
      <div className="pda-section">
        <div className="pda-section-title">Tote hoàn tất</div>
        <div className="pda-result-ok">
          <div className="pda-kv-label">Tote</div>
          <div className="pda-kv-value mono">{session.toteCode}</div>
          <div className="pda-kv-label" style={{ marginTop: 12 }}>
            Đơn đã đóng gói
          </div>
          <div className="pda-kv-value">
            {progress.done}/{progress.total}
          </div>
        </div>
        <div className="pda-actions">
          <Button type="primary" size="large" block onClick={resetHome}>
            Đóng gói tote khác
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pda-pack-page">
      <div className="pda-section">
        <div className="pda-pack-session-meta">
          <div>
            <div className="pda-kv-label">Tote</div>
            <div className="pda-kv-value mono">{session.toteCode}</div>
          </div>
          <div>
            <div className="pda-kv-label">Loại</div>
            <Tag color="blue">{session.pickType}</Tag>
          </div>
          <div>
            <div className="pda-kv-label">Tiến độ</div>
            <div className="pda-kv-value">
              {progress.done}/{progress.total}
            </div>
          </div>
        </div>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {pickListTypeLabel[session.pickType]} · {session.pickListCode}
        </Typography.Text>

        {session.status === 'pick_shortage' ? (
          <div className="pda-pack-shortage-banner">
            Tote thiếu hàng — Tạm dừng và chuyển khu lấy lại.
          </div>
        ) : null}

        <div style={{ marginTop: 12 }}>
          <PdaScanBar
            placeholder="Quét SKU sản phẩm"
            onScan={scanSku}
            scanTitle="Pack SKU"
          />
        </div>
      </div>

      <div className="pda-section">
        {session.flowKind === 'sio' ? (
          <>
            <div className="pda-section-title">Danh sách đơn (SIO)</div>
            <p className="pda-hint">Mỗi đơn 1 SP — quét SP để map đơn và tạo kiện ngay.</p>
            {session.orders.map((order) => {
              const line = order.lines[0]
              return (
                <div
                  key={order.id}
                  className={`pda-line-card pda-pack-order-row${order.completed ? ' done' : ''}${
                    !order.completed && session.lastSkuScanned === line?.sku ? ' active' : ''
                  }`}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <ProductThumb src={line?.imageUrl} label={line?.sku || ''} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{order.outboundCode}</div>
                      <div className="pda-pack-line-meta">
                        {line?.sku} · {line?.name}
                      </div>
                      {line?.note ? <div className="pda-pack-line-note">{line.note}</div> : null}
                      {order.packageCode ? (
                        <div className="mono" style={{ fontSize: 12, marginTop: 4 }}>
                          Kiện {order.packageCode}
                        </div>
                      ) : (
                        <Tag color="processing" style={{ marginTop: 4 }}>
                          Chờ quét
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        ) : null}

        {session.flowKind === 'sso' && currentOrder ? (
          <>
            <div className="pda-section-title">Gợi ý SSO</div>
            <div className="pda-pack-suggest">
              <ProductThumb src={currentOrder.lines[0]?.imageUrl} label={currentOrder.lines[0]?.sku || ''} />
              <div>
                <div className="pda-kv-label">{currentOrder.outboundCode}</div>
                <Typography.Title level={4} style={{ margin: '4px 0' }}>
                  {currentOrder.lines[0]?.sku} × {currentOrder.lines[0]?.qty}
                </Typography.Title>
                <Progress
                  percent={Math.round(
                    ((currentOrder.lines[0]?.scannedQty || 0) / (currentOrder.lines[0]?.qty || 1)) *
                      100,
                  )}
                  format={() =>
                    `${currentOrder.lines[0]?.scannedQty || 0}/${currentOrder.lines[0]?.qty || 0}`
                  }
                />
                <div style={{ fontSize: 13 }}>{currentOrder.lines[0]?.name}</div>
                {currentOrder.lines[0]?.note ? (
                  <div className="pda-pack-line-note">{currentOrder.lines[0].note}</div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        {(session.flowKind === 'single_order' || session.flowKind === 'smo') && currentOrder ? (
          <>
            <div className="pda-section-title">
              {session.flowKind === 'smo' ? 'Pattern SMO' : 'Đơn hàng'} · {currentOrder.outboundCode}
            </div>
            {currentOrder.packingNote ? (
              <div className="pda-pack-order-note">{currentOrder.packingNote}</div>
            ) : null}
            {currentOrder.lines.map((line) => (
              <LineCard
                key={line.id}
                line={line}
                emphasize={session.lastSkuScanned === line.sku && line.scannedQty < line.qty}
              />
            ))}
          </>
        ) : null}

        {!currentOrder && session.flowKind !== 'sio' ? (
          <p className="pda-hint">Không còn đơn cần đóng gói.</p>
        ) : null}

        {session.vasCodes.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            <span className="pda-kv-label">VAS: </span>
            {session.vasCodes.map((c) => (
              <Tag key={c}>{c}</Tag>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pda-section pda-pack-actions">
        <div className="pda-section-title">Thao tác</div>
        <div className="pda-pack-action-grid">
          <Button danger block onClick={() => setPinOpen(true)}>
            Đóng gói thiếu
          </Button>
          <Button
            block
            onClick={() => applyResult(pausePackSession(session.id), { leave: true })}
          >
            Tạm dừng
          </Button>
          <Button danger ghost block onClick={() => applyResult(markPackShortage(session.id))}>
            Thiếu hàng
          </Button>
          <Button type="primary" block onClick={() => setVasOpen(true)}>
            Thêm VAS
          </Button>
        </div>
      </div>

      <PackPartialPinModal
        open={pinOpen}
        onCancel={() => setPinOpen(false)}
        onConfirm={(pin) => {
          setPinOpen(false)
          applyResult(partialPackWithPin(session.id, pin))
        }}
      />
      <PackVasModal
        open={vasOpen}
        selected={session.vasCodes}
        onCancel={() => setVasOpen(false)}
        onConfirm={(codes: PackVasCode[]) => {
          setVasOpen(false)
          applyResult(addPackVas(session.id, codes))
        }}
      />

      <Modal
        title="Nhãn vận chuyển"
        open={labelOpen}
        onCancel={() => setLabelOpen(false)}
        destroyOnHidden
        footer={[
          <Button key="close" onClick={() => setLabelOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            onClick={() => {
              message.success(`Đã gửi in nhãn ${lastPacked?.trackingCode}`)
              setLabelOpen(false)
            }}
          >
            In nhãn
          </Button>,
        ]}
      >
        {lastPacked ? (
          <div>
            <div className="pda-kv-label">Đơn</div>
            <div className="pda-kv-value">{lastPacked.outboundCode}</div>
            <div className="pda-kv-label" style={{ marginTop: 10 }}>
              Mã kiện
            </div>
            <div className="pda-kv-value mono">{lastPacked.packageCode}</div>
            <div className="pda-kv-label" style={{ marginTop: 10 }}>
              Vận đơn
            </div>
            <div className="pda-kv-value mono">{lastPacked.trackingCode}</div>
            {lastPacked.partial ? (
              <Tag color="orange" style={{ marginTop: 8 }}>
                Đóng gói thiếu
              </Tag>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
