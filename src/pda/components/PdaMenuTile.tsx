import type { ReactNode } from 'react'
import { RightOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

type Props = {
  to: string
  icon: ReactNode
  title: string
  subtitle?: string
  badge?: number
}

export function PdaMenuTile({ to, icon, title, subtitle, badge }: Props) {
  return (
    <Link to={to} className="pda-menu-tile">
      <div className="pda-menu-tile-icon">{icon}</div>
      <div className="pda-menu-tile-body">
        <div className="pda-menu-tile-title">{title}</div>
        {subtitle ? <div className="pda-menu-tile-sub">{subtitle}</div> : null}
      </div>
      {badge ? <span className="pda-menu-tile-badge">{badge}</span> : null}
      <RightOutlined className="pda-menu-tile-arrow" />
    </Link>
  )
}
