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
import dayjs from 'dayjs'
import {
  commitInboundImport,
  downloadInboundImportTemplate,
  inboundImportColumns,
  parseInboundImportCsv,
  type InboundImportParseResult,
  type InboundImportPreview,
} from '../data/inboundImport'
import {
  goodsConditionLabel,
  inboundTypeLabel,
} from '../data/inboundRequests'

type Props = {
  open: boolean
  onClose: () => void
  onImported: (count: number) => void
}

export function InboundImportModal({ open, onClose, onImported }: Props) {
  const [result, setResult] = useState<InboundImportParseResult | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [committing, setCommitting] = useState(false)

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
        'Demo hỗ trợ CSV. Hãy mở mẫu trong Excel rồi «Lưu thành» CSV (UTF-8), sau đó tải lên.',
      )
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const parsed = parseInboundImportCsv(text)
      setResult(parsed)
      setFileName(file.name)
      if (!parsed.previews.length && parsed.errors.length) {
        message.error(`File có ${parsed.errors.length} lỗi — xem chi tiết bên dưới`)
      } else if (parsed.errors.length) {
        message.warning(
          `Đọc được ${parsed.previews.length} phiếu, còn ${parsed.errors.length} dòng lỗi`,
        )
      } else {
        message.success(`Sẵn sàng import ${parsed.previews.length} phiếu nhập kho`)
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

  const previewColumns: TableColumnsType<InboundImportPreview> = useMemo(
    () => [
      {
        title: 'Mã IR đối tác',
        dataIndex: 'partnerIrCode',
        width: 140,
      },
      {
        title: 'Kho',
        dataIndex: 'warehouseName',
        ellipsis: true,
      },
      {
        title: 'Loại',
        dataIndex: 'type',
        width: 120,
        render: (v: InboundImportPreview['type']) => inboundTypeLabel[v],
      },
      {
        title: 'TTHH',
        dataIndex: 'goodsCondition',
        width: 110,
        render: (v: InboundImportPreview['goodsCondition']) => goodsConditionLabel[v],
      },
      {
        title: 'Ngày DK',
        dataIndex: 'expectedAt',
        width: 110,
        render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
      },
      { title: 'SKU', dataIndex: 'lineCount', width: 70, align: 'right' },
      { title: 'SL', dataIndex: 'productQty', width: 70, align: 'right' },
    ],
    [],
  )

  const commit = () => {
    if (!result?.previews.length) {
      message.warning('Không có phiếu hợp lệ để import')
      return
    }
    setCommitting(true)
    try {
      const created = commitInboundImport(result.previews)
      message.success(`Đã tạo ${created.length} yêu cầu nhập kho`)
      onImported(created.length)
      handleClose()
    } finally {
      setCommitting(false)
    }
  }

  return (
    <Modal
      title="Import yêu cầu nhập kho"
      open={open}
      onCancel={handleClose}
      width={860}
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
                Mỗi dòng = 1 sản phẩm. Các dòng cùng <strong>Ma_IR_doi_tac</strong> +{' '}
                <strong>Ma_kho</strong> được gom thành một phiếu. SKU phải có trong catalog.
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>
                Cột bắt buộc:{' '}
                {inboundImportColumns
                  .filter((c) => c.required)
                  .map((c) => c.header)
                  .join(', ')}{' '}
                · và SKU hoặc SKU_doi_tac.
              </Typography.Paragraph>
            </div>
          }
        />

        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={downloadInboundImportTemplate}>
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
            <Space wrap size="middle">
              <Tag color="green">{result.previews.length} phiếu hợp lệ</Tag>
              <Tag color={result.errors.length ? 'red' : 'default'}>
                {result.errors.length} dòng lỗi
              </Tag>
              {result.skippedRows > 0 ? (
                <Tag>{result.skippedRows} dòng trống bỏ qua</Tag>
              ) : null}
            </Space>

            {result.previews.length > 0 ? (
              <Table
                size="small"
                rowKey={(r) => `${r.partnerIrCode}-${r.warehouseCode}`}
                columns={previewColumns}
                dataSource={result.previews}
                pagination={false}
                scroll={{ y: 220 }}
              />
            ) : null}

            {result.errors.length > 0 ? (
              <Alert
                type="error"
                showIcon
                message="Chi tiết lỗi"
                description={
                  <ul style={{ margin: 0, paddingLeft: 18, maxHeight: 160, overflow: 'auto' }}>
                    {result.errors.slice(0, 40).map((err) => (
                      <li key={`${err.row}-${err.message}`}>
                        Dòng {err.row}: {err.message}
                      </li>
                    ))}
                    {result.errors.length > 40 ? (
                      <li>… và {result.errors.length - 40} lỗi khác</li>
                    ) : null}
                  </ul>
                }
              />
            ) : null}
          </>
        ) : (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Tải mẫu → điền dữ liệu (Excel) → Lưu CSV → chọn file để xem trước và xác nhận.
          </Typography.Paragraph>
        )}
      </Space>
    </Modal>
  )
}
