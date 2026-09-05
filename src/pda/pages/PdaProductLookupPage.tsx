import { useState } from 'react'
import { Tag } from 'antd'
import { locationStatusLabels, type ProductLocationRow } from '../../data/productLocations'
import { pdaSamples } from '../../data/pdaSampleData'
import { pdaUniversalScan } from '../../data/pdaApi'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

export default function PdaProductLookupPage() {
  const [sku, setSku] = useState('')
  const [rows, setRows] = useState<ProductLocationRow[]>([])
  const [unknown, setUnknown] = useState(false)

  const handleScan = (value: string) => {
    const result = pdaUniversalScan(value)
    setSku(value)
    setRows(result.data?.rows ?? [])
    setUnknown(!result.data || result.data.type === 'unknown' || result.data.rows.length === 0)
  }

  usePdaSamplePanel(pdaSamples.inquiry, handleScan)

  const first = rows[0]

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Product lookup</div>
        <p className="pda-hint">Quét SKU / QR — GET /product/tenants/api/v1/product-variants</p>
        <PdaScanBar placeholder="Quét SKU / QR" onScan={handleScan} scanTitle="SKU/QR" />
      </div>

      {first ? (
        <div className="pda-section">
          <div className="pda-section-title">{first.name || sku}</div>
          <div className="pda-kv">
            <div>
              <div className="pda-kv-label">SKU</div>
              <div className="pda-kv-value mono">{first.sku}</div>
            </div>
            <div>
              <div className="pda-kv-label">Tổng SL</div>
              <div className="pda-kv-value">{rows.reduce((s, r) => s + r.qty, 0)}</div>
            </div>
          </div>
        </div>
      ) : null}

      {rows.map((row) => (
        <div key={row.id} className="pda-line-card">
          <div className="pda-kv-value mono">{row.placeCode}</div>
          <div className="pda-pick-card-meta">
            SL {row.qty} · <Tag style={{ fontSize: 10 }}>{locationStatusLabels[row.status]}</Tag>
          </div>
        </div>
      ))}

      {unknown && sku ? <div className="pda-result-err">Không tìm thấy variant {sku}</div> : null}
    </div>
  )
}
