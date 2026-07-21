import { useMemo, useState } from 'react'
import { CopyOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Space, Table, Typography, message } from 'antd'
import { buildInboundSerials, type InboundLine } from '../data/inboundRequests'

type Props = {
  open: boolean
  line: InboundLine | null
  onClose: () => void
  /** Cho phép chỉnh sửa serial (màn tạo) */
  editable?: boolean
  onSave?: (serials: string[]) => void
}

export function InboundSerialModal({ open, line, onClose, editable, onSave }: Props) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<string[]>([])

  const serials = useMemo(() => {
    if (!line) return []
    if (editable && draft.length) return draft
    return buildInboundSerials(line.sku, line.qty, line.serials)
  }, [line, editable, draft])

  const filtered = useMemo(() => {
    const rows = serials.map((serial, rawIndex) => ({
      index: rawIndex + 1,
      serial,
      rawIndex,
    }))
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => row.serial.toLowerCase().includes(q))
  }, [serials, query])

  return (
    <Modal
      open={open}
      title={line ? `Danh sách serial — ${line.sku}` : 'Danh sách serial'}
      onCancel={() => {
        setQuery('')
        setDraft([])
        onClose()
      }}
      width={560}
      destroyOnHidden
      afterOpenChange={(visible) => {
        if (visible && line) {
          setDraft(buildInboundSerials(line.sku, line.qty, line.serials))
          setQuery('')
        }
      }}
      footer={
        <Space>
          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              void navigator.clipboard.writeText(serials.join('\n'))
              message.success(`Đã sao chép ${serials.length} mã serial`)
            }}
          >
            Sao chép tất cả
          </Button>
          {editable ? (
            <Button
              type="primary"
              onClick={() => {
                onSave?.(draft)
                setQuery('')
                setDraft([])
                onClose()
                message.success('Đã lưu danh sách serial')
              }}
            >
              Lưu
            </Button>
          ) : (
            <Button type="primary" onClick={onClose}>
              Đóng
            </Button>
          )}
        </Space>
      }
    >
      {line ? (
        <>
          <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
            {line.name} · Số lượng: <strong>{line.qty}</strong> · {serials.length} serial
          </Typography.Paragraph>
          <Input
            allowClear
            placeholder="Tìm mã serial"
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Table
            size="small"
            rowKey="rawIndex"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            dataSource={filtered.map((item) => item)}
            columns={[
              { title: '#', dataIndex: 'index', width: 60 },
              {
                title: 'Mã serial / IMEI',
                dataIndex: 'serial',
                render: (value: string, row: { rawIndex: number }) =>
                  editable ? (
                    <Input
                      value={draft[row.rawIndex]}
                      onChange={(e) => {
                        const next = [...draft]
                        next[row.rawIndex] = e.target.value
                        setDraft(next)
                      }}
                    />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
                  ),
              },
            ]}
          />
        </>
      ) : null}
    </Modal>
  )
}
