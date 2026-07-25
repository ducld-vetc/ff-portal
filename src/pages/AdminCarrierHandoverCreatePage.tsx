import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoubleRightOutlined, FileExcelOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Typography,
  message,
  type InputRef,
  type TableColumnsType,
} from 'antd'
import { PageHeader } from '../components/PageHeader'
import {
  buildOutboundSummaries,
  createCarrierHandover,
  findDemoPackage,
  handoverCarrierOptions,
  packageConditionOptions,
  returnTypeOptions,
  type HandoverPackage,
  type HandoverSessionType,
} from '../data/carrierHandovers'

type Props = {
  mode: HandoverSessionType
}

export default function AdminCarrierHandoverCreatePage({ mode }: Props) {
  const navigate = useNavigate()
  const isReceipt = mode === 'receipt'
  const scanRef = useRef<InputRef>(null)

  const [scanValue, setScanValue] = useState('')
  const [listQuery, setListQuery] = useState('')
  const [carrierCode, setCarrierCode] = useState<string | undefined>(isReceipt ? 'JT' : undefined)
  const [note, setNote] = useState('')
  const [returnType, setReturnType] = useState('Hàng trả')
  const [condition, setCondition] = useState('Tốt')
  const [packages, setPackages] = useState<HandoverPackage[]>([])

  const title = isReceipt
    ? 'Tạo phiên bàn giao - Tạo phiên nhận'
    : 'Tạo phiên bàn giao - Tạo phiên giao'

  const filteredPackages = useMemo(() => {
    const q = listQuery.trim().toLowerCase()
    if (!q) return packages
    return packages.filter((p) =>
      [p.packageCode, p.outboundCode, p.partnerOrCode, p.trackingCode, p.partnerName]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [packages, listQuery])

  const summaries = useMemo(() => buildOutboundSummaries(packages), [packages])

  const addPackage = () => {
    const hit = findDemoPackage(scanValue)
    if (!hit) {
      message.warning('Không tìm thấy kiện. Thử: ORHACWBMUP26917, 802789820795, PGHACWBMUP269170001')
      scanRef.current?.focus()
      return
    }
    if (packages.some((p) => p.packageCode === hit.packageCode)) {
      message.warning(`Kiện ${hit.packageCode} đã có trong phiên`)
      setScanValue('')
      scanRef.current?.focus()
      return
    }

    const next: HandoverPackage = {
      ...hit,
      id: `pkg-${Date.now()}`,
      ...(isReceipt ? { returnType, condition } : {}),
    }
    setPackages((prev) => [next, ...prev])
    setScanValue('')
    message.success(`Đã thêm kiện ${hit.packageCode}`)
    scanRef.current?.focus()
  }

  const updatePackage = (id: string, patch: Partial<HandoverPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const removePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id))
  }

  const createSession = () => {
    if (!carrierCode) {
      message.warning('Chọn đối tác vận chuyển')
      return
    }
    if (packages.length === 0) {
      message.warning('Quét hoặc import ít nhất một kiện hàng')
      return
    }
    const carrier = handoverCarrierOptions.find((c) => c.value === carrierCode)
    const row = createCarrierHandover({
      sessionType: mode,
      carrierCode,
      carrierName: carrier?.label || carrierCode,
      note: note.trim() || undefined,
      packages,
    })
    message.success(`Đã tạo phiên ${row.code}`)
    navigate(`/operations/carrier-handover/${row.id}`)
  }

  const packageColumns: TableColumnsType<HandoverPackage> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    ...(isReceipt
      ? [{ title: 'Đối tác', dataIndex: 'partnerName', width: 220, ellipsis: true } as const]
      : []),
    { title: 'Mã yêu cầu xuất kho', dataIndex: 'outboundCode', width: 180 },
    { title: 'Mã yêu cầu xuất kho đối tác', dataIndex: 'partnerOrCode', width: 180 },
    { title: 'Mã vận đơn', dataIndex: 'trackingCode', width: 140 },
    { title: 'Mã kiện hàng', dataIndex: 'packageCode', width: 180 },
    { title: 'SL sản phẩm', dataIndex: 'productQty', width: 110, align: 'right' },
    ...(isReceipt
      ? [
          {
            title: 'Loại trả hàng',
            dataIndex: 'returnType',
            width: 140,
            render: (v: string | undefined, row: HandoverPackage) => (
              <Select
                size="small"
                value={v}
                style={{ width: '100%' }}
                options={returnTypeOptions}
                onChange={(val) => updatePackage(row.id, { returnType: val })}
              />
            ),
          } as const,
          {
            title: 'Tình trạng',
            dataIndex: 'condition',
            width: 140,
            render: (v: string | undefined, row: HandoverPackage) => (
              <Select
                size="small"
                value={v}
                style={{ width: '100%' }}
                options={packageConditionOptions}
                onChange={(val) => updatePackage(row.id, { condition: val })}
              />
            ),
          } as const,
        ]
      : []),
    {
      title: '',
      width: 70,
      render: (_, row) => (
        <Button type="link" danger onClick={() => removePackage(row.id)}>
          Xóa
        </Button>
      ),
    },
  ]

  const summaryColumns: TableColumnsType<(typeof summaries)[number]> = [
    { title: '#', width: 50, render: (_, __, i) => i + 1 },
    { title: 'Mã yêu cầu xuất kho', dataIndex: 'outboundCode', width: 200 },
    { title: 'SL kiện hàng còn lại', dataIndex: 'remainingPackages', width: 160, align: 'right' },
    {
      title: 'SL kiện hàng đã tạo phiên',
      dataIndex: 'sessionPackages',
      width: 180,
      align: 'right',
    },
    { title: 'SL kiện hàng', dataIndex: 'totalPackages', width: 130, align: 'right' },
  ]

  return (
    <div className="ops-adjust-create">
      <PageHeader
        title={title}
        extra={
          <Space>
            <Button type="primary" onClick={createSession}>
              Tạo
            </Button>
            <Button onClick={() => navigate('/operations/carrier-handover')}>Thoát</Button>
          </Space>
        }
      />

      <div className="ops-adjust-layout">
        <div className="ops-handover-main">
          <div className="content-card" style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary">
              Quét mã kiện hàng, mã vận đơn, mã đơn hàng, mã đơn hàng đối tác
            </Typography.Text>
            <div className="ops-handover-scan-row">
              <div className="ops-packing-scan" style={{ flex: 1, maxWidth: 'none', margin: 0 }}>
                <Input
                  ref={scanRef}
                  size="large"
                  allowClear
                  autoFocus
                  value={scanValue}
                  placeholder="Quét mã kiện hàng, mã vận đơn, mã đơn hàng, mã đơn hàng đối tác"
                  onChange={(e) => setScanValue(e.target.value)}
                  onPressEnter={addPackage}
                />
                <Button
                  size="large"
                  type="primary"
                  className="ops-packing-scan-btn"
                  icon={<DoubleRightOutlined />}
                  onClick={addPackage}
                  aria-label="Thêm kiện"
                />
              </div>
              <Button
                className="btn-success"
                icon={<FileExcelOutlined />}
                onClick={() => message.info('Demo: import kiện từ file')}
              >
                Import
              </Button>
            </div>

            {isReceipt ? (
              <Space wrap style={{ marginTop: 12 }}>
                <div>
                  <div className="ops-handover-field-label">Loại trả hàng</div>
                  <Select
                    value={returnType}
                    style={{ width: 180 }}
                    options={returnTypeOptions}
                    onChange={setReturnType}
                  />
                </div>
                <div>
                  <div className="ops-handover-field-label">Tình trạng</div>
                  <Select
                    value={condition}
                    style={{ width: 160 }}
                    options={packageConditionOptions}
                    onChange={setCondition}
                  />
                </div>
              </Space>
            ) : null}
          </div>

          <div className="content-card" style={{ marginBottom: 16 }}>
            <div className="ops-adjust-main-toolbar">
              <Space.Compact>
                <Input
                  allowClear
                  placeholder="Tìm kiếm mã kiện hàng, yêu cầu xuất kho, vận đơn"
                  value={listQuery}
                  onChange={(e) => setListQuery(e.target.value)}
                  style={{ width: 340 }}
                />
                <Button type="primary" icon={<SearchOutlined />} />
              </Space.Compact>
              <Typography.Text strong>SL kiện hàng: {packages.length}</Typography.Text>
            </div>
            <Table
              rowKey="id"
              size="middle"
              columns={packageColumns}
              dataSource={filteredPackages}
              pagination={{ pageSize: 8 }}
              scroll={{ x: isReceipt ? 1400 : 1100 }}
              locale={{ emptyText: 'Không có dữ liệu' }}
            />
          </div>

          <div className="content-card">
            <div className="ops-adjust-main-toolbar">
              <Typography.Text strong>SL yêu cầu xuất kho: {summaries.length}</Typography.Text>
            </div>
            <Table
              rowKey="outboundCode"
              size="middle"
              columns={summaryColumns}
              dataSource={summaries}
              pagination={false}
              locale={{ emptyText: 'Không có dữ liệu' }}
            />
          </div>
        </div>

        <div className="content-card ops-adjust-side">
          <div className="ops-adjust-side-field">
            <label>
              Đối tác vận chuyển <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <Select
              showSearch
              placeholder="Chọn đối tác vận chuyển"
              value={carrierCode}
              options={handoverCarrierOptions}
              onChange={setCarrierCode}
              style={{ width: '100%' }}
              optionFilterProp="label"
            />
          </div>
          <div className="ops-adjust-side-field">
            <label>Ghi chú</label>
            <Input.TextArea
              rows={6}
              placeholder="Nhập ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
