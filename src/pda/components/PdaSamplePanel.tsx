import { useState } from 'react'
import { CopyOutlined, ExperimentOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import type { PdaSampleSection } from '../../data/pdaSampleData'

type Props = {
  section: PdaSampleSection
  /** Fill scan field when user taps a value (optional) */
  onUse?: (value: string) => void
  defaultOpen?: boolean
}

export function PdaSamplePanel({ section, onUse, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      message.success(`Đã copy: ${value}`)
    } catch {
      message.info(value)
    }
  }

  return (
    <div className={`pda-sample ${open ? 'open' : ''}`}>
      <button type="button" className="pda-sample-toggle" onClick={() => setOpen((v) => !v)}>
        <ExperimentOutlined />
        <span>{section.title}</span>
        <span className="pda-sample-chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="pda-sample-body">
          {section.hint ? <p className="pda-sample-hint">{section.hint}</p> : null}
          <ul className="pda-sample-list">
            {section.items.map((item) => (
              <li key={`${item.label}-${item.value}`}>
                <div className="pda-sample-row">
                  <div className="pda-sample-meta">
                    <span className="pda-sample-label">{item.label}</span>
                    <button
                      type="button"
                      className="pda-sample-value"
                      title="Bấm để copy / dùng"
                      onClick={() => {
                        void copy(item.value)
                        onUse?.(item.value)
                      }}
                    >
                      {item.value}
                    </button>
                    {item.note ? <span className="pda-sample-note">{item.note}</span> : null}
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => void copy(item.value)}
                    title="Copy"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
