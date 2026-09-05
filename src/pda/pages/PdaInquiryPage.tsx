import { useState } from 'react'
import { Table, Tag } from 'antd'
import { locationStatusLabels, type ProductLocationRow } from '../../data/productLocations'
import { pdaSamples } from '../../data/pdaSampleData'
import { pdaUniversalScan, type InquiryScanType } from '../../data/pdaApi'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

const typeLabel: Record<InquiryScanType, string> = {
  sku: 'Theo SKU',
  location: 'Theo vị trí',
  package: 'Theo kiện',
  unknown: 'Không nhận dạng',
}

export default function PdaInquiryPage() {
  const [scanType, setScanType] = useState<InquiryScanType | null>(null)
  const [rows, setRows] = useState<ProductLocationRow[]>([])

  const handleScan = (value: string) => {
    const result = pdaUniversalScan(value)
    if (result.data) {
      setScanType(result.data.type)
      setRows(result.data.rows)
    }
  }

  usePdaSamplePanel(pdaSamples.inquiry, handleScan)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Tra cứu vị trí</div>
        <p className="pda-hint">Quét SKU, mã vị trí (bin) hoặc mã kiện (PG…).</p>
        <PdaScanBar placeholder="Quét mã cần tra cứu" onScan={handleScan} />
        {scanType ? (
          <div style={{ marginTop: 8 }}>
            <Tag color="blue">{typeLabel[scanType]}</Tag>
            <span style={{ marginLeft: 8, fontSize: 13 }}>{rows.length} kết quả</span>
          </div>
        ) : null}
      </div>

      {rows.length ? (
        <div className="pda-section" style={{ padding: 8 }}>
          <Table
            className="pda-table-compact"
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={rows}
            scroll={{ x: 360 }}
            columns={[
              {
                title: 'Vị trí/Kiện',
                dataIndex: 'placeCode',
                width: 120,
                render: (v: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span>,
              },
              { title: 'SKU', dataIndex: 'sku', width: 100 },
              { title: 'SL', dataIndex: 'qty', width: 48, align: 'right' as const },
              {
                title: 'TT',
                dataIndex: 'status',
                width: 100,
                render: (v: ProductLocationRow['status']) => (
                  <Tag style={{ fontSize: 10 }}>{locationStatusLabels[v]}</Tag>
                ),
              },
            ]}
          />
        </div>
      ) : scanType === 'unknown' ? (
        <div className="pda-result-err">Không tìm thấy dữ liệu cho mã đã quét.</div>
      ) : null}
    </div>
  )
}
