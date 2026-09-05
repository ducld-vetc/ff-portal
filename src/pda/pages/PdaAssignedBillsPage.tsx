import { Tag } from 'antd'
import { pdaSamples } from '../../data/pdaSampleData'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { usePda } from '../PdaContext'

const DEMO_BILLS = [
  { id: 'VB-1001', code: 'VB2608-001', sku: 4, status: 'ASSIGNED', zone: 'Zone A' },
  { id: 'VB-1002', code: 'VB2608-014', sku: 12, status: 'ASSIGNED', zone: 'Zone C' },
]

export default function PdaAssignedBillsPage() {
  const { auth } = usePda()
  usePdaSamplePanel(pdaSamples.home, undefined, false)

  return (
    <div>
      <div className="pda-section">
        <div className="pda-section-title">Assigned to me</div>
        <p className="pda-hint">
          Phiếu verify gán cho {auth?.operatorName} · GET /wms/api/v1/verify-bills/assigned-to-me
        </p>
        {DEMO_BILLS.map((b) => (
          <div key={b.id} className="pda-line-card">
            <div className="pda-pick-card-header">
              <span className="pda-kv-value mono">{b.code}</span>
              <Tag color="processing">{b.status}</Tag>
            </div>
            <div className="pda-pick-card-meta">
              {b.sku} SKU · {b.zone}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
