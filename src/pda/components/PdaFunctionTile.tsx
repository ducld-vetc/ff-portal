import type { ReactNode } from 'react'
import {
  AuditOutlined,
  CarOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  ImportOutlined,
  InboxOutlined,
  ProfileOutlined,
  RetweetOutlined,
  RollbackOutlined,
  ScissorOutlined,
  SearchOutlined,
  ShoppingOutlined,
  SwapOutlined,
} from '@ant-design/icons'

const ICONS: Record<string, ReactNode> = {
  inbox: <InboxOutlined />,
  database: <DatabaseOutlined />,
  shopping: <ShoppingOutlined />,
  gift: <GiftOutlined />,
  car: <CarOutlined />,
  stock: <DatabaseOutlined />,
  profile: <ProfileOutlined />,
  location: <EnvironmentOutlined />,
  search: <SearchOutlined />,
  swap: <SwapOutlined />,
  rollback: <RollbackOutlined />,
  import: <ImportOutlined />,
  retweet: <RetweetOutlined />,
  scissor: <ScissorOutlined />,
  audit: <AuditOutlined />,
}

type Props = {
  title: string
  icon: string
  color: string
  onClick: () => void
}

export function PdaFunctionTile({ title, icon, color, onClick }: Props) {
  return (
    <button type="button" className="pda-fn-tile" onClick={onClick}>
      <span className="pda-fn-tile-icon" style={{ background: `${color}18`, color }}>
        {ICONS[icon] ?? <InboxOutlined />}
      </span>
      <span className="pda-fn-tile-title">{title}</span>
    </button>
  )
}
