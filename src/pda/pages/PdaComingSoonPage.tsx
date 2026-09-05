import { useSearchParams } from 'react-router-dom'
import { ClockCircleOutlined } from '@ant-design/icons'

export default function PdaComingSoonPage() {
  const [params] = useSearchParams()
  const feature = params.get('feature') || 'Module'

  return (
    <div className="pda-section pda-coming-soon">
      <ClockCircleOutlined style={{ fontSize: 48, color: '#78909C' }} />
      <h2>Coming soon</h2>
      <p className="pda-hint">{feature} — chưa mở trên PDA này</p>
    </div>
  )
}
