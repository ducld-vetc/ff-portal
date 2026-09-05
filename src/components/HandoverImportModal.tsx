import { useMemo, useState } from 'react'
import { DownloadOutlined, InboxOutlined, UploadOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
  type TableColumnsType,
  type UploadProps,
} from 'antd'
import {
  downloadHandoverImportTemplate,
  handoverImportColumns,
  mergeImportedPackages,
  parseHandoverImportCsv,
  type HandoverImportParseResult,
  type HandoverImportPreview,
} from '../data/handoverImport'
import type { HandoverPackage, HandoverSessionType } from '../data/carrierHandovers'

type Props = {
  open: boolean
  sessionType: HandoverSessionType
  existing: HandoverPackage[]
  onClose: () => void
  onImported: (packages: HandoverPackage[], addedCount: number) => void
  defaultReturnType?: string
  defaultCondition?: string
}

export function HandoverImportModal({
  open,
  sessionType,
  existing,
  onClose,
  onImported,
  defaultReturnType = 'Hàng trả',
  defaultCondition = 'Tốt',
}: Props) {
  const [result, setResult] = useState<HandoverImportParseResult | null>(null)
  const [fileName, setFileName] = useState('')
  const [committing, setCommitting] = useState(false)
  const isReceipt = sessionType === 'receipt'

  const reset = () => {
    setResult(null)
    setFileName('')
    setCommitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const readFile = (file: File) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      message.warning(
        'Demo hỗ trợ CSV. Mở mẫu trong Excel → Lưu thành CSV (UTF-8) rồi tải lên.',
      )
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const parsed = parseHandoverImportCsv(text, sessionType)
      // Apply receipt defaults if missing
      if (isReceipt) {
        parsed.previews = parsed.previews.map((p) => ({
          ...p,
          package: {
            ...p.package,
            returnType: p.package.returnType || defaultReturnType,
            condition: p.package.condition || defaultCondition,
          },
        }))
      }
      setResult(parsed)
      setFileName(file.name)
      if (!parsed.previews.length && parsed.errors.length) {
        message.error(`File có ${parsed.errors.length} lỗi`)
      } else if (parsed.errors.length) {
        message.warning(
          `Đọc được ${parsed.previews.length} dòng hợp lệ, ${parsed.errors.length} lỗi`,
        )
      } else {
        message.success(`Sẵn sàng import ${parsed.previews.length} kiện`)
      }
    }
    reader.readAsText(file)
  }

  const uploadProps: UploadProps = {
    accept: '.csv,.xlsx,.xls,text/csv',
    showUploadList: false,
    multiple: false,
    beforeUpload: (file) => {
      readFile(file)
      return false
    },
  }

  const previewColumns: TableColumnsType<HandoverImportPreview> = useMemo(
    () => [
      {
        title: 'Nguồn',
        width: 90,
        render: (_, row) => {
          const color =
            row.source === 'inbound' ? 'purple' : row.source === 'outbound' ? 'blue' : 'default'
          return <Tag color={color}>{row.source}</Tag>
        },
      },
      { title: 'Mã OR / tham chiếu', width: 160, render: (_, r) => r.package.outboundCode },
      { title: 'Mã ĐT', width: 130, render: (_, r) => r.package.partnerOrCode },
      { title: 'Vận đơn', width: 120, render: (_, r) => r.package.trackingCode || '—' },
      { title: 'Mã kiện', width: 170, render: (_, r) => r.package.packageCode },
      {
        title: 'SL',
        width: 70,
        align: 'right',
        render: (_, r) => r.package.productQty,
      },
    ],
    [],
  )

  const commit = () => {
    if (!result?.previews.length) {
      message.warning('Không có dòng hợp lệ để import')
      return
    }
    setCommitting(true)
    try {
      const incoming = result.previews.map((p) => p.package)
      const { next, addedCount, skippedDup } = mergeImportedPackages(existing, incoming)
      if (addedCount === 0) {
        message.warning('Tất cả kiện đã có trong phiên (trùng mã kiện)')
      } else {
        message.success(
          `Đã thêm ${addedCount} kiện${skippedDup ? ` · bỏ qua ${skippedDup} trùng` : ''}`,
        )
      }
      onImported(next, addedCount)
      handleClose()
    } finally {
      setCommitting(false)
    }
  }

  return (
    <Modal
      title={
        isReceipt
          ? 'Import danh sách OR / IR — phiên nhận'
          : 'Import danh sách OR — phiên giao'
      }
      open={open}
      onCancel={handleClose}
      width={900}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            type="primary"
            disabled={!result?.previews.length}
            loading={committing}
            onClick={commit}
          >
            Xác nhận import {result?.previews.length ? `(${result.previews.length})` : ''}
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message="Quy ước file mẫu"
          description={
            <div>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                Mỗi dòng = 1 kiện. Cột <strong>Ma</strong> nhận mã OR, mã OR đối tác, mã vận đơn, mã
                kiện{isReceipt ? ', hoặc mã IR (phiên nhận)' : ''}. Hệ thống resolve kiện demo / OR /
                {isReceipt ? ' IR.' : ' catalog xuất kho.'}
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>
                Cột hỗ trợ:{' '}
                {handoverImportColumns.map((c) => c.header).join(', ')}. OR đã hủy sẽ bị từ chối.
              </Typography.Paragraph>
            </div>
          }
        />

        <Space wrap>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadHandoverImportTemplate(sessionType)}
          >
            Tải file mẫu CSV
          </Button>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />}>
              Chọn file để import
            </Button>
          </Upload>
          {fileName ? (
            <Typography.Text type="secondary">
              <InboxOutlined /> {fileName}
            </Typography.Text>
          ) : null}
        </Space>

        {result ? (
          <>
            <Space wrap>
              <Tag color="green">{result.previews.length} kiện hợp lệ</Tag>
              <Tag color={result.errors.length ? 'red' : 'default'}>
                {result.errors.length} dòng lỗi
              </Tag>
              {result.skippedRows > 0 ? <Tag>{result.skippedRows} dòng trống</Tag> : null}
            </Space>

            {result.previews.length > 0 ? (
              <Table
                size="small"
                rowKey={(r) => r.package.packageCode}
                columns={previewColumns}
                dataSource={result.previews}
                pagination={false}
                scroll={{ y: 240, x: 800 }}
              />
            ) : null}

            {result.errors.length > 0 ? (
              <Alert
                type="error"
                showIcon
                message="Chi tiết lỗi"
                description={
                  <ul style={{ margin: 0, paddingLeft: 18, maxHeight: 140, overflow: 'auto' }}>
                    {result.errors.slice(0, 30).map((err) => (
                      <li key={`${err.row}-${err.message}`}>
                        Dòng {err.row}: {err.message}
                      </li>
                    ))}
                    {result.errors.length > 30 ? (
                      <li>… và {result.errors.length - 30} lỗi khác</li>
                    ) : null}
                  </ul>
                }
              />
            ) : null}
          </>
        ) : (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Tải mẫu → điền mã OR/IR → Lưu CSV → chọn file để xem trước và xác nhận.
          </Typography.Paragraph>
        )}
      </Space>
    </Modal>
  )
}
