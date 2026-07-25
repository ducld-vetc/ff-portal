import { useMemo, useRef, useState } from 'react'
import { DoubleRightOutlined } from '@ant-design/icons'
import { Button, Input, Space, Table, Typography, message, type InputRef, type TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { packingByLabelSeed, packingSeed, type PackedOrderRow } from '../data/adminOpsSeed'

export type PackingMode = 'device' | 'label'

const demoDevices: Record<string, Omit<PackedOrderRow, 'id' | 'packedAt' | 'deviceCode'>> = {
  'RNN.052': {
    partnerName: 'HAC-CONG TY TNHH HAC RETAIL',
    outboundCode: 'ORHACWBMUP26917',
    partnerOrCode: 'HAC-WBM-UP-26917',
    trackingCode: '802789820795',
  },
  'RNN.041': {
    partnerName: 'AVO - CÔNG TY TNHH AVOGROUP',
    outboundCode: 'ORAZB6FB5XRW785',
    partnerOrCode: 'SHOPEE-99100',
    trackingCode: 'JT889900112',
  },
  'RNN.033': {
    partnerName: 'AVI - CÔNG TY TNHH AVIATEK',
    outboundCode: 'ORHN01C8830',
    partnerOrCode: 'TT-1002',
    trackingCode: 'GHN99881234',
  },
  'RNN.018': {
    partnerName: 'NQA - HỘ KINH DOANH NGÔ QUỲNH ANH',
    outboundCode: 'ORMANUAL77X',
    partnerOrCode: 'MANUAL-77',
    trackingCode: 'GHTK556677',
  },
}

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
  const isLabel = mode === 'label'
  const [scanValue, setScanValue] = useState('')
  const [rows, setRows] = useState<PackedOrderRow[]>(isLabel ? packingByLabelSeed : packingSeed)
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
            <Button
              size="small"
              className="ops-doc-btn"
              onClick={() => message.info('Demo: in bảng kê hàng')}
            >
              Bảng kê hàng
            </Button>
            <Button
              size="small"
              className="ops-doc-btn"
              onClick={() => message.info('Demo: in phiếu xuất kho')}
            >
              Phiếu xuất kho
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
      message.warning(isLabel ? 'Quét hoặc nhập mã nhãn vận đơn' : 'Quét hoặc nhập mã thiết bị chứa hàng')
      inputRef.current?.focus()
      return
    }

    const existing = rows.find((r) => r.deviceCode.toUpperCase() === code)
    if (existing) {
      message.warning(
        isLabel
          ? `Nhãn ${code} đã được đóng gói (${existing.outboundCode})`
          : `Thiết bị ${code} đã được đóng gói (${existing.outboundCode})`,
      )
      setScanValue('')
      inputRef.current?.focus()
      return
    }

    const matched = isLabel ? demoLabels[code] : demoDevices[code]
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
          trackingCode: isLabel ? code : String(800000000000 + Math.floor(Math.random() * 999999999)),
          deviceCode: code,
        }

    setRows((prev) => [next, ...prev])
    message.success(isLabel ? `Đã xác nhận đóng gói nhãn ${code}` : `Đã xác nhận đóng gói thiết bị ${code}`)
    setScanValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="ops-packing-page">
      <div className="ops-packing-hero">
        <Typography.Title level={3} className="ops-packing-title">
          {isLabel ? 'Đóng gói theo nhãn' : 'Đóng gói sản phẩm'}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="ops-packing-subtitle">
          {isLabel ? 'Quét nhãn vận đơn để đóng gói' : 'Quét thiết bị chứa hàng để đóng gói'}
        </Typography.Paragraph>

        <div className="ops-packing-scan">
          <Input
            ref={inputRef}
            size="large"
            allowClear
            autoFocus
            value={scanValue}
            placeholder={
              isLabel ? 'Quét nhãn vận đơn để đóng gói' : 'Quét thiết bị chứa hàng để đóng gói'
            }
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
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} đơn` }}
          locale={{ emptyText: 'Chưa có đơn hàng đã đóng gói' }}
        />
      </div>
    </div>
  )
}
