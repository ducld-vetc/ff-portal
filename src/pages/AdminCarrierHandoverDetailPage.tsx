import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CheckOutlined,
  DeleteOutlined,
  DoubleRightOutlined,
  EditOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
  type InputRef,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { PageHeader } from '../components/PageHeader'
import {
  buildOutboundSummaries,
  findDemoPackage,
  getCarrierHandover,
  handoverSessionTypeLabel,
  handoverStatusColor,
  handoverStatusLabel,
  isOutboundCancelled,
  listCancelledPackagesInSession,
  removePackagesFromSession,
  upsertCarrierHandover,
  type CarrierHandoverSession,
  type HandoverPackage,
} from '../data/carrierHandovers'
import { downloadHandoverSessionExcel } from '../data/handoverExport'
import { printHandoverSession } from '../data/handoverPrint'

dayjs.locale('vi')

export default function AdminCarrierHandoverDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const scanRef = useRef<InputRef>(null)
  const [row, setRow] = useState<CarrierHandoverSession | undefined>(() => getCarrierHandover(id))
  const [listQuery, setListQuery] = useState('')
  const [summaryQuery, setSummaryQuery] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [cancelWarnOpen, setCancelWarnOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [scanValue, setScanValue] = useState('')
  const [editDraft, setEditDraft] = useState<HandoverPackage[]>([])

  const filteredPackages = useMemo(() => {
    if (!row) return []
    const q = listQuery.trim().toLowerCase()
    if (!q) return row.packages
    return row.packages.filter((p) =>
      [p.packageCode, p.outboundCode, p.partnerOrCode, p.trackingCode].join(' ').toLowerCase().includes(q),
    )
  }, [row, listQuery])

  const summaries = useMemo(() => (row ? buildOutboundSummaries(row.packages) : []), [row])

  const filteredSummaries = useMemo(() => {
    const q = summaryQuery.trim().toLowerCase()
    if (!q) return summaries
    return summaries.filter((s) => s.outboundCode.toLowerCase().includes(q))
  }, [summaries, summaryQuery])

  const cancelledPackages = useMemo(
    () => (row ? listCancelledPackagesInSession(row.packages) : []),
    [row],
  )

  const cancelledOutboundCodes = useMemo(
    () => [...new Set(cancelledPackages.map((p) => p.outboundCode))],
    [cancelledPackages],
  )

  if (!row) {
    return (
      <div>
        <PageHeader title="Không tìm thấy phiên bàn giao" />
        <Button onClick={() => navigate('/operations/carrier-handover')}>Thoát</Button>
      </div>
    )
  }

  const isReceipt = row.sessionType === 'receipt'
  const canEdit = row.status === 'new' || row.status === 'processing'
  const title = `Chi tiết phiên bàn giao — ${handoverSessionTypeLabel[row.sessionType]}`

  const refresh = (next: CarrierHandoverSession) => {
    upsertCarrierHandover(next)
    setRow(next)
  }

  const removeByPackageIds = (ids: string[]) => {
    const idSet = new Set(ids)
    const next = removePackagesFromSession(row, (p) => idSet.has(p.id))
    refresh(next)
    message.success(`Đã loại ${ids.length} kiện khỏi phiên`)
    return next
  }

  const removeCancelledFromSession = () => {
    if (!cancelledPackages.length) {
      message.info('Không có OR đã hủy trong phiên')
      return row
    }
    const next = removePackagesFromSession(row, (p) => isOutboundCancelled(p.outboundCode))
    refresh(next)
    message.success(
      `Đã loại ${cancelledPackages.length} kiện thuộc ${cancelledOutboundCodes.length} OR đã hủy`,
    )
    return next
  }

  const doHandover = (session: CarrierHandoverSession) => {
    if (session.packageCount === 0) {
      message.error('Phiên không còn kiện để bàn giao')
      return
    }
    refresh({ ...session, status: 'handed_over' })
    setCancelWarnOpen(false)
    message.success(`Đã bàn giao phiên ${session.code}`)
  }

  const confirmHandover = () => {
    const cancelled = listCancelledPackagesInSession(row.packages)
    if (cancelled.length > 0) {
      setCancelWarnOpen(true)
      return
    }
    Modal.confirm({
      title: 'Xác nhận bàn giao',
      content: `Bàn giao phiên ${row.code} với ${row.packageCount} kiện cho ${row.carrierName}?`,
      okText: 'Bàn giao',
      cancelText: 'Thoát',
      onOk: () => doHandover(row),
    })
  }

  const openEdit = () => {
    if (!canEdit) {
      message.warning('Phiên đã bàn giao / hủy — không thể cập nhật')
      return
    }
    setEditDraft(row.packages.map((p) => ({ ...p })))
    setScanValue('')
    setEditOpen(true)
    setTimeout(() => scanRef.current?.focus(), 100)
  }

  const addToDraft = () => {
    const hit = findDemoPackage(scanValue)
    if (!hit) {
      message.warning('Không tìm thấy kiện. Thử mã OR / vận đơn / mã kiện demo')
      scanRef.current?.focus()
      return
    }
    if (editDraft.some((p) => p.packageCode === hit.packageCode)) {
      message.warning(`Kiện ${hit.packageCode} đã có trong phiên`)
      setScanValue('')
      return
    }
    if (isOutboundCancelled(hit.outboundCode)) {
      message.error(`OR ${hit.outboundCode} đã hủy — không thêm vào phiên`)
      setScanValue('')
      return
    }
    setEditDraft((prev) => [
      {
        ...hit,
        id: `pkg-edit-${Date.now()}`,
        ...(isReceipt ? { returnType: hit.returnType || 'Hàng trả', condition: hit.condition || 'Tốt' } : {}),
      },
      ...prev,
    ])
    message.success(`Đã thêm kiện ${hit.packageCode}`)
    setScanValue('')
    scanRef.current?.focus()
  }

  const saveEdit = () => {
    const outboundCodes = new Set(editDraft.map((p) => p.outboundCode))
    const next: CarrierHandoverSession = {
      ...row,
      packages: editDraft,
      packageCount: editDraft.length,
      outboundCount: outboundCodes.size,
    }
    refresh(next)
    setEditOpen(false)
    message.success('Đã cập nhật phiên bàn giao')
  }

  const packageColumns: TableColumnsType<HandoverPackage> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    ...(isReceipt
      ? [{ title: 'Đối tác', dataIndex: 'partnerName', width: 200, ellipsis: true } as const]
      : []),
    {
      title: 'Mã yêu cầu xuất kho',
      dataIndex: 'outboundCode',
      width: 180,
      render: (v: string) => (
        <Space size={6}>
          <span className="inbound-ir-link">{v}</span>
          {isOutboundCancelled(v) ? <Tag color="error">OR đã hủy</Tag> : null}
        </Space>
      ),
    },
    { title: 'Mã yêu cầu xuất kho đối tác', dataIndex: 'partnerOrCode', width: 180 },
    { title: 'Mã vận đơn', dataIndex: 'trackingCode', width: 140 },
    { title: 'Mã kiện hàng', dataIndex: 'packageCode', width: 180 },
    { title: 'SL sản phẩm', dataIndex: 'productQty', width: 110, align: 'right' },
    ...(isReceipt
      ? [
          { title: 'Loại trả hàng', dataIndex: 'returnType', width: 130 } as const,
          { title: 'Tình trạng', dataIndex: 'condition', width: 120 } as const,
        ]
      : []),
    ...(canEdit
      ? [
          {
            title: '',
            key: 'remove',
            width: 100,
            fixed: 'right' as const,
            render: (_: unknown, pkg: HandoverPackage) =>
              isOutboundCancelled(pkg.outboundCode) ? (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Loại kiện OR đã hủy?',
                      content: `Loại ${pkg.packageCode} (OR ${pkg.outboundCode}) khỏi phiên bàn giao.`,
                      okText: 'Loại khỏi phiên',
                      okButtonProps: { danger: true },
                      cancelText: 'Hủy',
                      onOk: () => removeByPackageIds([pkg.id]),
                    })
                  }}
                >
                  Loại
                </Button>
              ) : null,
          },
        ]
      : []),
  ]

  const summaryColumns: TableColumnsType<(typeof summaries)[number]> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    {
      title: 'Mã yêu cầu xuất kho',
      dataIndex: 'outboundCode',
      width: 200,
      render: (v: string, record) => (
        <Space size={6}>
          <span className="inbound-ir-link">{v}</span>
          {record.cancelled ? <Tag color="error">Đã hủy</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Tình trạng xử lý',
      dataIndex: 'processingStatus',
      width: 140,
      render: (v: string, record) => (
        <Tag color={record.cancelled ? 'error' : 'success'}>{v}</Tag>
      ),
    },
    { title: 'SL kiện hàng còn lại', dataIndex: 'remainingPackages', width: 160, align: 'right' },
    {
      title: 'SL kiện hàng đã tạo phiên',
      dataIndex: 'sessionPackages',
      width: 180,
      align: 'right',
    },
    { title: 'SL kiện hàng', dataIndex: 'totalPackages', width: 130, align: 'right' },
    ...(canEdit
      ? [
          {
            title: '',
            key: 'remove-or',
            width: 140,
            fixed: 'right' as const,
            render: (_: unknown, record: (typeof summaries)[number]) =>
              record.cancelled ? (
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: 'Loại OR đã hủy khỏi phiên?',
                      content: `Loại toàn bộ kiện của ${record.outboundCode} khỏi phiên bàn giao.`,
                      okText: 'Loại khỏi phiên',
                      okButtonProps: { danger: true },
                      cancelText: 'Hủy',
                      onOk: () => {
                        const next = removePackagesFromSession(
                          row,
                          (p) => p.outboundCode === record.outboundCode,
                        )
                        refresh(next)
                        message.success(`Đã loại OR ${record.outboundCode} khỏi phiên`)
                      },
                    })
                  }}
                >
                  Loại OR hủy
                </Button>
              ) : null,
          },
        ]
      : []),
  ]

  const editColumns: TableColumnsType<HandoverPackage> = [
    { title: '#', width: 48, render: (_, __, i) => i + 1 },
    { title: 'Mã OR', dataIndex: 'outboundCode', width: 150 },
    { title: 'Mã kiện', dataIndex: 'packageCode', width: 170 },
    { title: 'Vận đơn', dataIndex: 'trackingCode', width: 130 },
    { title: 'SL SP', dataIndex: 'productQty', width: 80, align: 'right' },
    {
      title: '',
      width: 90,
      render: (_, pkg) => (
        <Button
          size="small"
          danger
          onClick={() => setEditDraft((prev) => prev.filter((p) => p.id !== pkg.id))}
        >
          Loại
        </Button>
      ),
    },
  ]

  return (
    <div className="ops-adjust-create">
      <PageHeader
        title={title}
        description={`Mã phiên ${row.code} · ${row.carrierCode} — ${row.carrierName}`}
        extra={
          <Space wrap>
            <Button onClick={() => navigate('/operations/carrier-handover')}>Thoát</Button>
            {canEdit ? (
              <Button className="btn-success" icon={<CheckOutlined />} onClick={confirmHandover}>
                Bàn giao
              </Button>
            ) : null}
            <Button type="primary" icon={<EditOutlined />} disabled={!canEdit} onClick={openEdit}>
              Cập nhật
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => {
                const ok = printHandoverSession(row)
                if (!ok) message.error('Trình duyệt chặn cửa sổ in — hãy cho phép popup')
                else message.success('Đã mở biên bản bàn giao')
              }}
            >
              In
            </Button>
            <Button
              className="btn-success"
              icon={<FileExcelOutlined />}
              onClick={() => {
                const n = downloadHandoverSessionExcel(row)
                message.success(`Đã xuất Excel ${n} dòng (TPLSession_Detail_OR)`)
              }}
            >
              Xuất Excel
            </Button>
          </Space>
        }
      />

      <div className="ops-adjust-layout">
        <div className="content-card ops-handover-main">
          <Tabs
            defaultActiveKey="packages"
            items={[
              {
                key: 'packages',
                label: `Danh sách kiện hàng (${row.packageCount})`,
                children: (
                  <>
                    <div className="ops-adjust-main-toolbar">
                      <Space.Compact>
                        <Input
                          allowClear
                          placeholder="Tìm mã kiện, yêu cầu xuất kho, vận đơn"
                          value={listQuery}
                          onChange={(e) => setListQuery(e.target.value)}
                          style={{ width: 360 }}
                        />
                        <Button type="primary" icon={<SearchOutlined />} />
                      </Space.Compact>
                      <Typography.Text strong>Số kiện hàng: {row.packageCount}</Typography.Text>
                    </div>
                    <Table
                      rowKey="id"
                      size="middle"
                      columns={packageColumns}
                      dataSource={filteredPackages}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: isReceipt ? 1400 : 1200 }}
                      rowClassName={(pkg) =>
                        isOutboundCancelled(pkg.outboundCode) ? 'ops-handover-row-cancelled' : ''
                      }
                    />
                  </>
                ),
              },
              {
                key: 'outbounds',
                label: `Tổng hợp yêu cầu xuất kho (${summaries.length})`,
                children: (
                  <>
                    <div className="ops-adjust-main-toolbar">
                      <Space.Compact>
                        <Input
                          allowClear
                          placeholder="Tìm mã yêu cầu xuất kho"
                          value={summaryQuery}
                          onChange={(e) => setSummaryQuery(e.target.value)}
                          style={{ width: 280 }}
                        />
                        <Button type="primary" icon={<SearchOutlined />} />
                      </Space.Compact>
                      <Typography.Text strong>
                        SL yêu cầu xuất kho: {summaries.length}
                      </Typography.Text>
                    </div>
                    <Table
                      rowKey="outboundCode"
                      size="middle"
                      columns={summaryColumns}
                      dataSource={filteredSummaries}
                      pagination={{ pageSize: 8 }}
                      scroll={{ x: 1100 }}
                      rowClassName={(r) => (r.cancelled ? 'ops-handover-row-cancelled' : '')}
                    />
                  </>
                ),
              },
            ]}
          />
        </div>

        <div className="ops-detail-stack">
          <div className="content-card ops-detail-sidebar">
            <div className="ops-detail-head">
              <Typography.Title level={4} className="ops-detail-code">
                {row.code}
              </Typography.Title>
              <Tag color={handoverStatusColor[row.status]}>{handoverStatusLabel[row.status]}</Tag>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Tag>{handoverSessionTypeLabel[row.sessionType]}</Tag>
            </div>
          </div>

          <div className="content-card ops-detail-sidebar">
            <div className="ops-adjust-history-head">
              <span className="ops-sidebar-caption" style={{ marginBottom: 0 }}>
                Lịch sử trạng thái
              </span>
              <Button type="link" size="small" onClick={() => setHistoryOpen(true)}>
                Chi tiết
              </Button>
            </div>
            <Typography.Text type="secondary">
              Cập nhật mới nhất:{' '}
              {dayjs(row.createdAt).format('ddd - DD/MM/YYYY').replace(/^\w/, (c) => c.toUpperCase())}
            </Typography.Text>
          </div>

          <div className="content-card ops-detail-sidebar">
            <div className="ops-sidebar-caption">Thông tin chung</div>
            <div className="ops-field">
              <span className="ops-field-label">Số lượng kiện hàng bàn giao</span>
              <span className="ops-field-value">
                <Link to="#" className="inbound-ir-link" onClick={(e) => e.preventDefault()}>
                  {row.packageCount}
                </Link>
              </span>
            </div>
            <div className="ops-field">
              <span className="ops-field-label">Đối tác vận chuyển</span>
              <span className="ops-field-value">
                {row.carrierCode} - {row.carrierName}
              </span>
            </div>
            <div className="ops-field">
              <span className="ops-field-label">Người tạo</span>
              <span className="ops-field-value">{row.createdBy}</span>
            </div>
            <div className="ops-field">
              <span className="ops-field-label">Ghi chú</span>
              <span className="ops-field-value">{row.note || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Cập nhật phiên bàn giao"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        width={860}
        destroyOnHidden
        okText="Lưu cập nhật"
        cancelText="Hủy"
        onOk={saveEdit}
      >
        <Typography.Paragraph type="secondary">
          Quét / nhập mã kiện, mã OR hoặc mã vận đơn để thêm. Có thể loại kiện bất kỳ khỏi phiên trước khi
          lưu.
        </Typography.Paragraph>
        <div className="ops-packing-scan" style={{ maxWidth: '100%', margin: '0 0 12px' }}>
          <Input
            ref={scanRef}
            size="large"
            allowClear
            value={scanValue}
            placeholder="Quét mã kiện / OR / vận đơn để thêm"
            onChange={(e) => setScanValue(e.target.value)}
            onPressEnter={addToDraft}
          />
          <Button
            size="large"
            className="btn-search-accent ops-packing-scan-btn"
            icon={<DoubleRightOutlined />}
            onClick={addToDraft}
          />
        </div>
        <Typography.Text strong>Kiện trong phiên: {editDraft.length}</Typography.Text>
        <Table
          style={{ marginTop: 8 }}
          size="small"
          rowKey="id"
          columns={editColumns}
          dataSource={editDraft}
          pagination={{ pageSize: 8 }}
          scroll={{ y: 320 }}
        />
      </Modal>

      <Modal
        title="Lịch sử trạng thái"
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        footer={<Button onClick={() => setHistoryOpen(false)}>Đóng</Button>}
      >
        <div className="ops-adjust-history-list">
          <div className="ops-adjust-history-item">
            <div className="ops-adjust-history-label">Tạo phiên</div>
            <div className="ops-adjust-history-meta">
              {dayjs(row.createdAt).format('DD/MM/YYYY HH:mm:ss')} · {row.createdBy}
            </div>
          </div>
          {row.status === 'handed_over' ? (
            <div className="ops-adjust-history-item">
              <div className="ops-adjust-history-label">Đã bàn giao</div>
              <div className="ops-adjust-history-meta">
                {dayjs().format('DD/MM/YYYY HH:mm:ss')} · Ops
              </div>
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        title="Cảnh báo: có OR đã hủy trong phiên"
        open={cancelWarnOpen}
        onCancel={() => setCancelWarnOpen(false)}
        width={720}
        footer={[
          <Button key="close" onClick={() => setCancelWarnOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="remove"
            danger
            onClick={() => {
              removeCancelledFromSession()
              setCancelWarnOpen(false)
            }}
          >
            Loại OR đã hủy khỏi phiên
          </Button>,
          <Button
            key="handover-rest"
            type="primary"
            className="btn-success"
            onClick={() => {
              const next = removeCancelledFromSession()
              if (next.packageCount === 0) {
                message.error('Sau khi loại OR hủy, phiên không còn kiện')
                setCancelWarnOpen(false)
                return
              }
              doHandover(next)
            }}
          >
            Loại hủy & bàn giao phần còn lại
          </Button>,
        ]}
      >
        <Typography.Paragraph>
          Không thể bàn giao khi phiên còn yêu cầu xuất kho đã bị hủy giữa chừng.
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary">
          OR bị hủy: {cancelledOutboundCodes.join(', ')} ({cancelledPackages.length} kiện).
        </Typography.Paragraph>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={cancelledPackages}
          columns={[
            { title: 'Mã OR', dataIndex: 'outboundCode', width: 160 },
            { title: 'Mã kiện', dataIndex: 'packageCode', width: 180 },
            { title: 'Vận đơn', dataIndex: 'trackingCode', width: 140 },
            { title: 'SL SP', dataIndex: 'productQty', width: 80, align: 'right' },
          ]}
        />
      </Modal>
    </div>
  )
}
