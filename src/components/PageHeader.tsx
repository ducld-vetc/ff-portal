import type { ReactNode } from 'react'
import { FileTextOutlined } from '@ant-design/icons'

export function BrandMark({ size = 38, fontSize = 19 }: { size?: number; fontSize?: number }) {
  return (
    <span
      className="brand-mark"
      style={{ width: size, height: size, fontSize, borderRadius: size > 40 ? 15 : 11 }}
    >
      <FileTextOutlined />
    </span>
  )
}

export function PageHeader({
  title,
  description,
  extra,
}: {
  title: string
  description?: string
  extra?: ReactNode
}) {
  return (
    <div className="page-header section-toolbar">
      <div>
        <h2>{title}</h2>
        {description ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)', maxWidth: 760 }}>{description}</p>
        ) : null}
      </div>
      {extra}
    </div>
  )
}
