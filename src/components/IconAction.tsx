import type { ButtonProps } from 'antd'
import { Button, Tooltip } from 'antd'
import type { ReactNode } from 'react'

type IconActionProps = Omit<ButtonProps, 'children' | 'icon'> & {
  title: string
  icon: ReactNode
}

/** Nút thao tác chỉ hiện icon; label nằm trong tooltip + aria-label */
export function IconAction({ title, icon, type = 'text', ...rest }: IconActionProps) {
  return (
    <Tooltip title={title}>
      <Button type={type} icon={icon} aria-label={title} {...rest} />
    </Tooltip>
  )
}
