import { useMemo, useRef, useState } from 'react'
import { DoubleRightOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type InputRef,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import {
  PackFlowBatchSamePattern,
  PackFlowBatchSameSku,
  PackFlowSio,
  PackFlowSingleOrder,
} from '../components/packing/PackFlowViews'
import { PackPartialPinModal } from '../components/packing/PackPartialPinModal'
import { PackStationActions } from '../components/packing/PackStationActions'
import { PackVasModal } from '../components/packing/PackVasModal'
import { packingByLabelSeed, type PackedOrderRow } from '../data/adminOpsSeed'
import {
  addPackVas,
  listPackedHistory,
  markPackShortage,
  packDemoToteHints,
  partialPackWithPin,
  pausePackSession,
  scanPackProduct,
  startOrResumePackSession,
  type PackedHistoryRow,
  type PackOrder,
  type PackToteSession,
  type PackVasCode,
} from '../data/packingSessions'
import { type PickListType } from '../data/pickingLists'

export type PackingMode = 'device' | 'label'

const demoLabels: Record<string, Omit<PackedOrderRow, 'id' | 'packedAt' | 'deviceCode'>> = {
  'LBL-JT-889921': {
    partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
    outboundCode: 'ORAZB6FB5XRW785',
    partnerOrCode: 'SHOPEE-99100',
    trackingCode: 'JT889921',
  },
  'LBL-GHN-120033': {
    partnerName: 'AVI - CÔNG TY TNHH AVIATEK',
    outboundCode: 'ORHN01C8830',
    partnerOrCode: 'TT-1002',
    trackingCode: 'GHN120033',
  },
  'LBL-GHTK-445566': {
    partnerName: 'NQA - HỘ KINH DOANH NGÔ QUỲNH ANH',
    outboundCode: 'ORMANUAL77X',
    partnerOrCode: 'MANUAL-77',
  },
}

type AdminPackingPageProps = {
  mode?: PackingMode
}

export default function AdminPackingPage({ mode = 'device' }: AdminPackingPageProps) {
  if (mode === 'label') {
    return <PackingByLabelStation />
  }
  return <PackingByToteStation />
}

function PackingByToteStation() {
  const toteInputRef = useRef<InputRef>(null)
  const skuInputRef = useRef<InputRef>(null)
  const [toteScan, setToteScan] = useState('')
  const [skuScan, setSkuScan] = useState('')
  const [session, setSession] = useState<PackToteSession | null>(null)
  const [historyVersion, setHistoryVersion] = useState(0)
  const history = useMemo(() => listPackedHistory(), [historyVersion])
  const [lastPacked, setLastPacked] = useState<PackOrder | null>(null)
  const [labelOpen, setLabelOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [vasOpen, setVasOpen] = useState(false)

  const refreshSession = (next: PackToteSession) => {
    setSession({
      ...next,
      orders: next.orders.map((o) => ({ ...o, lines: o.lines.map((l) => ({ ...l })) })),
    })
  }

  const applyResult = (
    result: ReturnType<typeof scanPackProduct>,
    opts?: { leaveSession?: boolean },
  ) => {
    if (!result.ok) {
      message.error(result.message)
      return
    }
    message.success(result.message)
    if (result.completedOrder) {
      setLastPacked(result.completedOrder)
      setLabelOpen(true)
      setHistoryVersion((v) => v + 1)
    }
    if (opts?.leaveSession || result.session.status === 'paused') {
      setSession(null)
      setTimeout(() => toteInputRef.current?.focus(), 50)
      return
    }
    refreshSession(result.session)
    if (result.session.status === 'done') {
      setHistoryVersion((v) => v + 1)
      setTimeout(() => {
        setSession(null)
        toteInputRef.current?.focus()
      }, 400)
    } else {
      setTimeout(() => skuInputRef.current?.focus(), 50)
    }
  }

  const startTote = () => {
    const code = toteScan.trim()
    if (!code) {
      message.warning('Quét hoặc nhập mã tote / thiết bị chứa hàng')
      toteInputRef.current?.focus()
      return
    }
    const result = startOrResumePackSession(code)
    if (!result.ok) {
      message.error(result.message)
      setToteScan('')
      toteInputRef.current?.focus()
      return
    }
    message.success(result.message)
    refreshSession(result.session)
    setToteScan('')
    setSkuScan('')
    setTimeout(() => skuInputRef.current?.focus(), 50)
  }

  const scanSku = () => {
    if (!session) return
    const result = scanPackProduct(session.id, skuScan)
    setSkuScan('')
    applyResult(result)
  }

  const historyColumns: TableColumnsType<PackedHistoryRow> = [
    {
      title: 'Ngày đóng gói',
      dataIndex: 'packedAt',
      width: 170,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm:ss'),
    },
    { title: 'Tote', dataIndex: 'deviceCode', width: 130 },
    {
      title: 'Loại',
      dataIndex: 'pickType',
      width: 90,
      render: (v?: PickListType) => (v ? <Tag>{v}</Tag> : '—'),
    },
    { title: 'Đối tác', dataIndex: 'partnerName', width: 220, ellipsis: true },
    {
      title: 'Mã xuất kho',
      dataIndex: 'outboundCode',
      width: 170,
      render: (v: string) => <Typography.Link>{v}</Typography.Link>,
    },
    { title: 'Mã ĐT', dataIndex: 'partnerOrCode', width: 140 },
    { title: 'Mã kiện', dataIndex: 'packageCode', width: 170, render: (v?: string) => v || '—' },
    {
      title: 'Mã vận đơn',
      dataIndex: 'trackingCode',
      width: 140,
      render: (v?: string) => v || '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 280,
      render: (_, row) => (
        <Space size={[6, 6]} wrap>
          {!row.trackingCode ? (
            <Button size="small" type="primary" onClick={() => message.info('Demo: lấy mã vận đơn')}>
              Lấy mã vận đơn
            </Button>
          ) : null}
          <Button
            size="small"
            className="ops-doc-btn"
            onClick={() => message.info(`Demo: in nhãn ${row.packageCode || row.outboundCode}`)}
          >
            Nhãn VC
          </Button>
          <Button size="small" className="ops-doc-btn" onClick={() => message.info('Demo: in hóa đơn')}>
            Hóa đơn
          </Button>
        </Space>
      ),
    },
  ]

  if (!session) {
    return (
      <div className="ops-packing-page">
        <div className="ops-packing-hero">
          <Typography.Title level={3} className="ops-packing-title">
            Đóng gói sản phẩm
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="ops-packing-subtitle">
            Quét tote đã lấy hàng xong — hệ thống chọn luồng theo loại DSLH (PTO/MIO/PTS, SIO, SSO,
            SMO)
          </Typography.Paragraph>
          <div className="ops-packing-scan">
            <Input
              ref={toteInputRef}
              size="large"
              allowClear
              autoFocus
              value={toteScan}
              placeholder="Quét mã tote / thiết bị chứa hàng"
              onChange={(e) => setToteScan(e.target.value)}
              onPressEnter={startTote}
            />
            <Button
              size="large"
              className="btn-search-accent ops-packing-scan-btn"
              icon={<DoubleRightOutlined />}
              onClick={startTote}
              aria-label="Bắt đầu đóng gói"
            />
          </div>
          <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
            Demo:{' '}
            {packDemoToteHints.map((h) => (
              <Tag
                key={h.code}
                style={{ cursor: 'pointer', marginBottom: 4 }}
                onClick={() => {
                  setToteScan(h.code)
                  setTimeout(() => toteInputRef.current?.focus(), 0)
                }}
              >
                {h.code} ({h.pickType})
              </Tag>
            ))}
          </Typography.Paragraph>
        </div>

        <div className="content-card">
          <Typography.Title level={5} className="ops-packing-section-title">
            Đơn hàng đã xử lý
          </Typography.Title>
          <Table
            rowKey="id"
            size="middle"
            columns={historyColumns}
            dataSource={history}
            scroll={{ x: 1500 }}
            pagination={{ pageSize: 10, showTotal: (t) => `${t} đơn` }}
            locale={{ emptyText: 'Chưa có đơn hàng đã đóng gói' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="ops-packing-page ops-pack-session-page">
      <div className="content-card" style={{ marginBottom: 12 }}>
        {session.flowKind === 'sio' ? (
          <PackFlowSio session={session} />
        ) : session.flowKind === 'sso' ? (
          <PackFlowBatchSameSku session={session} />
        ) : session.flowKind === 'smo' ? (
          <PackFlowBatchSamePattern session={session} />
        ) : (
          <PackFlowSingleOrder session={session} />
        )}

        {session.status === 'pick_shortage' ? (
          <Alert
            type="error"
            showIcon
            style={{ marginTop: 12 }}
            message="Tote đang ở trạng thái lấy hàng bị thiếu"
            description="Nhấn Tạm dừng, chuyển tote sang khu lấy lại hàng, rồi quét tote khác để tiếp tục."
          />
        ) : null}

        {session.vasCodes.length > 0 ? (
          <div style={{ marginTop: 12 }}>
            <Typography.Text type="secondary">VAS: </Typography.Text>
            {session.vasCodes.map((c) => (
              <Tag key={c}>{c}</Tag>
            ))}
          </div>
        ) : null}
      </div>

      <div className="content-card" style={{ marginBottom: 12 }}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Quét sản phẩm
        </Typography.Title>
        <div className="ops-packing-scan" style={{ maxWidth: '100%', margin: 0 }}>
          <Input
            ref={skuInputRef}
            size="large"
            allowClear
            autoFocus
            value={skuScan}
            placeholder="Quét mã sản phẩm (SKU / barcode)"
            onChange={(e) => setSkuScan(e.target.value)}
            onPressEnter={scanSku}
            disabled={session.status === 'pick_shortage' && session.flowKind !== 'sio'}
          />
          <Button
            size="large"
            className="btn-search-accent ops-packing-scan-btn"
            icon={<DoubleRightOutlined />}
            onClick={scanSku}
            aria-label="Xác nhận quét SP"
          />
        </div>
      </div>

      <PackStationActions
        onPartialPack={() => setPinOpen(true)}
        onPause={() => applyResult(pausePackSession(session.id), { leaveSession: true })}
        onShortage={() => applyResult(markPackShortage(session.id))}
        onVas={() => setVasOpen(true)}
      />

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
              message.success(`Đã gửi lệnh in nhãn ${lastPacked?.trackingCode}`)
              setLabelOpen(false)
              skuInputRef.current?.focus()
            }}
          >
            In nhãn
          </Button>,
        ]}
      >
        {lastPacked ? (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div>
              <Typography.Text type="secondary">Đơn hàng</Typography.Text>
              <div>
                <Typography.Text strong>{lastPacked.outboundCode}</Typography.Text>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">Mã kiện hàng</Typography.Text>
              <div>
                <Typography.Text code style={{ fontSize: 18 }}>
                  {lastPacked.packageCode}
                </Typography.Text>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">Mã vận đơn</Typography.Text>
              <div>
                <Typography.Text code style={{ fontSize: 18 }}>
                  {lastPacked.trackingCode}
                </Typography.Text>
              </div>
            </div>
            {lastPacked.partial ? <Tag color="orange">Đóng gói thiếu</Tag> : null}
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Đóng hàng vật lý xong → In nhãn → dán lên kiện. Tiếp tục quét nếu tote còn đơn.
            </Typography.Paragraph>
          </Space>
        ) : null}
      </Modal>
    </div>
  )
}

function PackingByLabelStation() {
  const [scanValue, setScanValue] = useState('')
  const [rows, setRows] = useState<PackedOrderRow[]>(packingByLabelSeed)
  const inputRef = useRef<InputRef>(null)

  const columns: TableColumnsType<PackedOrderRow> = useMemo(
    () => [
      {
        title: 'Ngày đóng gói',
        dataIndex: 'packedAt',
        width: 170,
        render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm:ss'),
      },
      { title: 'Đối tác', dataIndex: 'partnerName', width: 260, ellipsis: true },
      {
        title: 'Mã xuất kho',
        dataIndex: 'outboundCode',
        width: 180,
        render: (v: string) => <Typography.Link>{v}</Typography.Link>,
      },
      {
        title: 'Mã xuất kho đối tác',
        dataIndex: 'partnerOrCode',
        width: 180,
        render: (v: string) => <Typography.Link>{v}</Typography.Link>,
      },
      {
        title: 'Mã vận đơn',
        dataIndex: 'trackingCode',
        width: 150,
        render: (v?: string) => v || '—',
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: 420,
        render: (_, row) => (
          <Space size={[6, 6]} wrap>
            {!row.trackingCode ? (
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  const nextCode = String(800000000000 + Math.floor(Math.random() * 999999999))
                  setRows((prev) =>
                    prev.map((r) => (r.id === row.id ? { ...r, trackingCode: nextCode } : r)),
                  )
                  message.success(`Đã lấy mã vận đơn ${nextCode}`)
                }}
              >
                Lấy mã vận đơn
              </Button>
            ) : null}
            <Button size="small" className="ops-doc-btn" onClick={() => message.info('Demo: in hóa đơn')}>
              Hóa đơn
            </Button>
            <Button
              size="small"
              className="ops-doc-btn"
              onClick={() => message.info('Demo: in nhãn vận chuyển')}
            >
              Nhãn vận chuyển
            </Button>
          </Space>
        ),
      },
    ],
    [],
  )

  const confirmPack = () => {
    const code = scanValue.trim().toUpperCase()
    if (!code) {
      message.warning('Quét hoặc nhập mã nhãn vận đơn')
      inputRef.current?.focus()
      return
    }
    const existing = rows.find((r) => r.deviceCode.toUpperCase() === code)
    if (existing) {
      message.warning(`Nhãn ${code} đã được đóng gói (${existing.outboundCode})`)
      setScanValue('')
      inputRef.current?.focus()
      return
    }
    const matched = demoLabels[code]
    const next: PackedOrderRow = matched
      ? {
          id: `pk-${Date.now()}`,
          packedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          deviceCode: code,
          ...matched,
        }
      : {
          id: `pk-${Date.now()}`,
          packedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          partnerName: 'Đối tác demo',
          outboundCode: `OR${code.replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'SCAN'}`,
          partnerOrCode: code,
          trackingCode: code,
          deviceCode: code,
        }
    setRows((prev) => [next, ...prev])
    message.success(`Đã xác nhận đóng gói nhãn ${code}`)
    setScanValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="ops-packing-page">
      <div className="ops-packing-hero">
        <Typography.Title level={3} className="ops-packing-title">
          Đóng gói theo nhãn
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="ops-packing-subtitle">
          Quét nhãn vận đơn để đóng gói
        </Typography.Paragraph>
        <div className="ops-packing-scan">
          <Input
            ref={inputRef}
            size="large"
            allowClear
            autoFocus
            value={scanValue}
            placeholder="Quét nhãn vận đơn để đóng gói"
            onChange={(e) => setScanValue(e.target.value)}
            onPressEnter={confirmPack}
          />
          <Button
            size="large"
            className="btn-search-accent ops-packing-scan-btn"
            icon={<DoubleRightOutlined />}
            onClick={confirmPack}
            aria-label="Xác nhận đóng gói"
          />
        </div>
      </div>
      <div className="content-card">
        <Typography.Title level={5} className="ops-packing-section-title">
          Đơn hàng đã xử lý
        </Typography.Title>
        <Table
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={rows}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} đơn` }}
          locale={{ emptyText: 'Chưa có đơn hàng đã đóng gói' }}
        />
      </div>
    </div>
  )
}
