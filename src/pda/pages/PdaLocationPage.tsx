import { useState } from 'react'
import { Tag } from 'antd'
import { locationStatusLabels, type ProductLocationRow } from '../../data/productLocations'
import { pdaSamples } from '../../data/pdaSampleData'
import { pdaUniversalScan } from '../../data/pdaApi'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaScanBar } from '../components/PdaScanBar'

export default function PdaLocationPage() {
  const [location, setLocation] = useState('')
  const [rows, setRows] = useState<ProductLocationRow[]>([])

  const handleScan = (value: string) => {
    const result = pdaUniversalScan(value)
    setLocation(value)
    setRows(result.data?.rows ?? [])
  }

  usePdaSamplePanel(pdaSamples.inquiry, handleScan)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Quét vị trí</div>
        <p className="pda-hint">Quét mã bin / kệ — xem SKU đang nằm tại đó.</p>
        <PdaScanBar placeholder="Quét mã vị trí" onScan={handleScan} scanTitle="Location" />
        {location ? (
          <div className="pda-location-display mono" style={{ fontSize: 22 }}>
            {location}
          </div>
        ) : null}
      </div>
      {rows.map((row) => (
        <div key={row.id} className="pda-line-card">
          <div style={{ fontWeight: 600 }}>{row.name || row.sku}</div>
          <div className="pda-pick-card-meta">
            <span className="mono">{row.sku}</span> · SL {row.qty} ·{' '}
            <Tag style={{ fontSize: 10 }}>{locationStatusLabels[row.status]}</Tag>
          </div>
        </div>
      ))}
    </div>
  )
}
