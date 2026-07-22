import { useMemo, useState } from 'react'
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message,
  type TableColumnsType,
  type UploadProps,
} from 'antd'
import { BarcodeLabel, buildCode39Svg } from '../components/BarcodeLabel'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { warehouses } from '../data/mock'
import {
  deviceTypes,
  labelOf,
  locationTypes,
  seedStorageDevices,
  type StorageDevice,
  type StorageMode,
} from '../data/storageDevices'

function parseCsvLine(line: string) {
  return line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
}

export default function StorageDevicesPage() {
  const [rows, setRows] = useState<StorageDevice[]>(() => [...seedStorageDevices])
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>()
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<StorageDevice | null>(null)
  const [form] = Form.useForm()

  const [printOpen, setPrintOpen] = useState(false)
  const [printTarget, setPrintTarget] = useState<StorageDevice | null>(null)
  const [printQty, setPrintQty] = useState(1)

  const openPrint = (row: StorageDevice) => {
    setPrintTarget(row)
    setPrintQty(1)
    setPrintOpen(true)
  }

  const handlePrintBarcode = () => {
    if (!printTarget) return

    const { svg } = buildCode39Svg(printTarget.code, 64, 1.5)
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const labels = Array.from({ length: printQty }, () => {
      return `
        <div class="label">
          <div class="title">Thiết bị chứa hàng</div>
          <div class="barcode-wrap">${svg}</div>
          <div class="code">${esc(printTarget.code)}</div>
          <div class="meta">${esc(printTarget.name)}</div>
          <div class="meta">${esc(printTarget.size)} · ${esc(printTarget.warehouseCode)}</div>
        </div>`
    }).join('')

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>In barcode ${esc(printTarget.code)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; color: #111; }
    .sheet { display: flex; flex-wrap: wrap; gap: 12px; padding: 16px; }
    .label {
      width: 260px;
      border: 1px solid #111;
      padding: 12px 14px 14px;
      text-align: center;
      page-break-inside: avoid;
    }
    .title { font-size: 11px; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 8px; }
    .barcode-wrap { display: flex; justify-content: center; margin-bottom: 6px; }
    .barcode-wrap svg { max-width: 100%; height: 64px; }
    .code { font-family: ui-monospace, Menlo, monospace; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #333; line-height: 1.35; }
    @media print {
      body { margin: 0; }
      .sheet { padding: 0; gap: 8px; }
    }
  </style>
</head>
<body>
  <div class="sheet">${labels}</div>
  <script>setTimeout(function () { window.focus(); window.print(); }, 120);</script>
</body>
</html>`

    const win = window.open('', '_blank', 'noopener,noreferrer,width=720,height=640')
    if (!win) {
      message.error('Trình duyệt chặn cửa sổ in. Hãy cho phép popup.')
      return
    }
    win.document.open()
    win.document.write(html)
    win.document.close()
    message.success(`Đã mở bản in ${printQty} barcode cho ${printTarget.code}`)
    setPrintOpen(false)
  }

  const warehouseOptions = warehouses.map((w) => ({
    value: w.code,
    label: `${w.code} · ${w.name}`,
  }))

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return rows.filter((row) => {
      if (warehouseFilter && row.warehouseCode !== warehouseFilter) return false
      if (q && !row.code.toLowerCase().includes(q) && !row.name.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [rows, warehouseFilter, appliedQuery])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      mode: 'manual',
      locationType: 'SHELF',
      deviceType: 'RACK',
      warehouseCode: warehouses[0]?.code,
      size: '100x80x180',
    })
    setOpen(true)
  }

  const openEdit = (row: StorageDevice) => {
    setEditing(row)
    form.setFieldsValue(row)
    setOpen(true)
  }

  const importFromText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length < 2) {
      message.error('File không có dữ liệu')
      return
    }

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
    const idx = (names: string[]) => header.findIndex((h) => names.includes(h))

    const codeIdx = idx(['code', 'ma', 'mã', 'mã thiết bị'])
    const nameIdx = idx(['name', 'ten', 'tên', 'tên thiết bị'])
    const typeIdx = idx(['deviceType', 'loai', 'loại thiết bị', 'type'])
    const sizeIdx = idx(['size', 'kich thuoc', 'kích thước'])
    const locationIdx = idx(['locationType', 'loai vi tri', 'loại vị trí'])
    const warehouseIdx = idx(['warehouse', 'warehouseCode', 'kho', 'mã kho'])
    const modeIdx = idx(['mode', 'che do', 'chế độ'])

    if (codeIdx < 0 || nameIdx < 0) {
      message.error('File cần có cột mã và tên thiết bị')
      return
    }

    const imported: StorageDevice[] = []
    for (const line of lines.slice(1)) {
      const cols = parseCsvLine(line)
      const code = cols[codeIdx]
      if (!code) continue
      const warehouseCode = warehouseIdx >= 0 ? cols[warehouseIdx] : warehouses[0]?.code
      const warehouse = warehouses.find((w) => w.code === warehouseCode) || warehouses[0]
      imported.push({
        id: `sd-import-${Date.now()}-${imported.length}`,
        code,
        name: cols[nameIdx] || code,
        deviceType: (typeIdx >= 0 && cols[typeIdx]) || 'RACK',
        size: (sizeIdx >= 0 && cols[sizeIdx]) || '—',
        locationType: (locationIdx >= 0 && cols[locationIdx]) || 'SHELF',
        mode: ((modeIdx >= 0 && cols[modeIdx]) || 'manual') as StorageMode,
        warehouseCode: warehouse?.code || 'WH-HCM-01',
        warehouseName: warehouse?.name || 'Kho',
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
      })
    }

    if (!imported.length) {
      message.warning('Không đọc được dòng dữ liệu hợp lệ')
      return
    }

    setRows((prev) => [...imported, ...prev])
    message.success(`Đã import ${imported.length} thiết bị từ Excel/CSV`)
  }

  const uploadProps: UploadProps = {
    accept: '.csv,.xlsx,.xls,text/csv',
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result || '')
        // For xlsx binary we can't parse without a lib; guide user to CSV or simple text.
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          message.warning(
            'Demo local hỗ trợ CSV. Hãy lưu Excel dạng CSV (cột: code,name,deviceType,size,locationType,warehouseCode,mode).',
          )
          // still try if user somehow exported text
          if (text.includes(',')) importFromText(text)
          return
        }
        importFromText(text)
      }
      reader.readAsText(file)
      return false
    },
  }

  const columns: TableColumnsType<StorageDevice> = [
    {
      title: 'STT',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 120,
      render: (value: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
      ),
    },
    {
      title: 'Loại thiết bị',
      dataIndex: 'deviceType',
      width: 150,
      render: (value: string) => labelOf(deviceTypes, value),
    },
    { title: 'Kích thước', dataIndex: 'size', width: 130 },
    { title: 'Người thêm', dataIndex: 'createdBy', width: 130 },
    {
      title: 'Loại vị trí',
      dataIndex: 'locationType',
      width: 140,
      render: (value: string) => labelOf(locationTypes, value),
    },
    {
      title: 'Thời gian thêm',
      dataIndex: 'createdAt',
      width: 170,
      render: (value: string) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      width: 170,
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 148,
      fixed: 'right',
      render: (_, row) => (
        <Space size={6}>
          <IconAction
            title="In barcode"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => openPrint(row)}
            style={{ color: '#52c41a', borderColor: '#b7eb8f' }}
          />
          <IconAction
            title="Sửa"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(row)}
          />
          <IconAction
            title="Xóa"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: `Xóa thiết bị ${row.code}?`,
                okText: 'Xóa',
                okButtonProps: { danger: true },
                onOk: () => {
                  setRows((prev) => prev.filter((item) => item.id !== row.id))
                  message.success('Đã xóa thiết bị')
                },
              })
            }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Thiết bị chứa hàng"
        description="Quản lý thiết bị chứa hàng theo kho: tạo, import và in barcode dán lên thiết bị."
        extra={
          <Space>
            <Upload {...uploadProps}>
              <IconAction title="Import Excel" icon={<UploadOutlined />} />
            </Upload>
            <IconAction
              title="Tạo thiết bị"
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
            />
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap>
            <Select
              allowClear
              placeholder="Lọc theo kho"
              style={{ width: 260 }}
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={warehouseOptions}
            />
            <Space.Compact style={{ width: 300 }}>
              <Input
                allowClear
                placeholder="Tìm theo mã thiết bị"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={() => setAppliedQuery(query)}
              />
              <IconAction
                title="Tìm kiếm"
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setAppliedQuery(query)}
              />
            </Space.Compact>
            {(warehouseFilter || appliedQuery) && (
              <Tag
                closable
                onClose={() => {
                  setWarehouseFilter(undefined)
                  setQuery('')
                  setAppliedQuery('')
                }}
              >
                Đang lọc
              </Tag>
            )}
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      <Modal
        open={open}
        title={
          <span className="modal-title-blue">
            {editing ? 'Cập nhật thiết bị chứa hàng' : 'Tạo thiết bị chứa hàng'}
          </span>
        }
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Thoát"
        destroyOnHidden
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const warehouse = warehouses.find((w) => w.code === values.warehouseCode)
            const payload: StorageDevice = {
              id: editing?.id || `sd-${Date.now()}`,
              code: editing?.code || `DEV-${Date.now().toString().slice(-6)}`,
              name: values.name,
              deviceType: values.deviceType,
              size: values.size,
              locationType: values.locationType,
              mode: values.mode,
              warehouseCode: values.warehouseCode,
              warehouseName: warehouse?.name || values.warehouseCode,
              createdBy: editing?.createdBy || 'admin',
              createdAt: editing?.createdAt || new Date().toISOString(),
            }

            if (editing) {
              setRows((prev) => prev.map((item) => (item.id === editing.id ? payload : item)))
              message.success('Đã cập nhật thiết bị')
            } else {
              setRows((prev) => [payload, ...prev])
              message.success('Đã tạo thiết bị chứa hàng')
            }
            setOpen(false)
          }}
        >
          <Form.Item
            name="locationType"
            label="Loại vị trí"
            rules={[{ required: true, message: 'Chọn loại vị trí' }]}
          >
            <Select placeholder="Loại vị trí" options={locationTypes} />
          </Form.Item>

          <Form.Item name="mode" label="Chế độ" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="manual">Thủ công</Radio>
              <Radio value="auto">Tự động</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên thiết bị chứa hàng"
            rules={[{ required: true, message: 'Nhập tên thiết bị chứa hàng' }]}
          >
            <Input placeholder="Tên thiết bị chứa hàng" />
          </Form.Item>

          <Form.Item
            name="deviceType"
            label="Loại thiết bị"
            rules={[{ required: true, message: 'Chọn loại thiết bị' }]}
          >
            <Select options={deviceTypes} />
          </Form.Item>

          <Form.Item
            name="size"
            label="Kích thước"
            rules={[{ required: true, message: 'Nhập kích thước' }]}
          >
            <Input placeholder="VD: 120x80x200" />
          </Form.Item>

          <Form.Item
            name="warehouseCode"
            label="Kho"
            rules={[{ required: true, message: 'Chọn kho' }]}
          >
            <Select options={warehouseOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={printOpen}
        title={<span className="modal-title-blue">IN BARCODE THIẾT BỊ</span>}
        onCancel={() => setPrintOpen(false)}
        footer={
          <Space>
            <IconAction
              title="Thoát"
              icon={<CloseOutlined />}
              onClick={() => setPrintOpen(false)}
            />
            <IconAction
              title="In barcode"
              type="primary"
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              icon={<PrinterOutlined />}
              onClick={handlePrintBarcode}
            />
          </Space>
        }
        destroyOnHidden
        width={420}
      >
        <div className="print-material-box">
          <div className="section-label">Xem trước tem dán</div>
          {printTarget ? (
            <div className="barcode-preview-card">
              <BarcodeLabel
                value={printTarget.code}
                subtitle={`${printTarget.name} · ${printTarget.size}`}
              />
            </div>
          ) : null}
          <Form layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item label="Số lượng in" required>
              <InputNumber
                min={1}
                max={99}
                value={printQty}
                onChange={(v) => setPrintQty(v || 1)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}
