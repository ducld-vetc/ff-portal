import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileExcelOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  generateAdjustCode,
  inventoryPartnerOptions,
  listInventoryStockRows,
  upsertInventoryAdjustment,
  type InventoryAdjustLine,
  type InventoryStockRow,
} from '../data/inventoryAdjustments'
import {
  goodsConditionColor,
  goodsConditionLabel,
  type GoodsCondition,
} from '../data/inboundRequests'

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="product-thumb-img" />
  return <div className="product-thumb">{label.slice(0, 2).toUpperCase()}</div>
}

type AdminInventoryAdjustCreatePageProps = {
  mode: 'increase' | 'decrease'
}

export default function AdminInventoryAdjustCreatePage({ mode }: AdminInventoryAdjustCreatePageProps) {
  const navigate = useNavigate()
  const isDecrease = mode === 'decrease'
  const [partnerName, setPartnerName] = useState<string | undefined>()
  const [note, setNote] = useState('')
  const [lines, setLines] = useState<InventoryAdjustLine[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [conditionFilter, setConditionFilter] = useState<GoodsCondition | undefined>()
  const [pickerQty, setPickerQty] = useState<Record<string, number>>({})

  const title = isDecrease ? 'Tạo điều chỉnh giảm tồn' : 'Tạo điều chỉnh tăng tồn'
  const totalQty = lines.reduce((s, l) => s + l.qty, 0)
  const qtyColumnTitle = isDecrease ? 'SL giảm' : 'SL tăng'

  const stockRows = useMemo(() => listInventoryStockRows(partnerName), [partnerName])

  const filteredStock = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase()
    return stockRows.filter((row) => {
      if (conditionFilter && row.goodsCondition !== conditionFilter) return false
      if (!q) return true
      return (
        row.sku.toLowerCase().includes(q) ||
        row.partnerSku.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q)
      )
    })
  }, [stockRows, pickerQuery, conditionFilter])

  const openPicker = () => {
    if (!partnerName) {
      message.warning('Chọn đối tác trước khi thêm sản phẩm')
      return
    }
    setPickerQty({})
    setPickerQuery('')
    setConditionFilter(undefined)
    setPickerOpen(true)
  }

  const updateLine = (id: string, patch: Partial<InventoryAdjustLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const savePicker = () => {
    const selected = filteredStock
      .map((row) => ({ row, qty: pickerQty[row.id] || 0 }))
      .filter((x) => x.qty > 0)

    if (selected.length === 0) {
      message.warning(`Nhập ${qtyColumnTitle} cho ít nhất một sản phẩm`)
      return
    }

    const nextLines: InventoryAdjustLine[] = selected.map(({ row, qty }) => ({
      id: `line-${row.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      productId: row.productId,
      name: row.name,
      partnerSku: row.partnerSku,
      sku: row.sku,
      unit: row.unit,
      imageUrl: row.imageUrl,
      lotCode: row.lotCode === '—' ? undefined : row.lotCode,
      lotDate: row.lotDate,
      qty,
      goodsCondition: row.goodsCondition,
      productKind: row.productKind,
    }))

    setLines((prev) => {
      const merged = [...prev]
      for (const line of nextLines) {
        const idx = merged.findIndex(
          (l) =>
            l.sku === line.sku &&
            l.lotCode === line.lotCode &&
            l.goodsCondition === line.goodsCondition,
        )
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], qty: merged[idx].qty + line.qty }
        } else {
          merged.push(line)
        }
      }
      return merged
    })
    setPickerOpen(false)
    message.success(`Đã thêm ${selected.length} sản phẩm`)
  }

  const createAdjustment = () => {
    if (!partnerName) {
      message.warning('Chọn đối tác')
      return
    }
    if (lines.length === 0) {
      message.warning('Thêm ít nhất một sản phẩm')
      return
    }
    if (lines.some((l) => !l.qty || l.qty <= 0)) {
      message.warning('Số lượng phải lớn hơn 0')
      return
    }

    const id = `ia-${Date.now()}`
    upsertInventoryAdjustment({
      id,
      code: generateAdjustCode(mode),
      partnerName,
      direction: mode,
      skuCount: new Set(lines.map((l) => l.sku)).size,
      itemCount: lines.reduce((s, l) => s + l.qty, 0),
      status: 'new',
      createdAt: new Date().toISOString(),
      createdBy: 'Ops',
      confirmedAt: null,
      confirmedBy: null,
      note: note.trim() || undefined,
      lines,
    })
    message.success(`Đã tạo phiếu ${isDecrease ? 'giảm' : 'tăng'} tồn`)
    navigate(`/operations/inventory-adjust/${id}`)
  }

  const columns: TableColumnsType<InventoryAdjustLine> = [
    {
      title: 'Sản phẩm',
      width: 260,
      render: (_, row) => (
        <Space align="start">
          <ProductThumb src={row.imageUrl} label={row.sku} />
          <div>
            <div className="product-name-cell">{row.name}</div>
            <Typography.Text type="secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {row.sku}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    { title: 'SKU đối tác', dataIndex: 'partnerSku', width: 130 },
    {
      title: 'SKU (barcode)',
      dataIndex: 'sku',
      width: 150,
      render: (v: string) => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span>,
    },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    {
      title: 'Tình trạng hàng hóa',
      dataIndex: 'goodsCondition',
      width: 150,
      render: (v?: GoodsCondition) =>
        v ? <Tag color={goodsConditionColor[v]}>{goodsConditionLabel[v]}</Tag> : '—',
    },
    {
      title: 'Số lô',
      dataIndex: 'lotCode',
      width: 130,
      render: (v: string | undefined, row) =>
        isDecrease ? (
          v || '—'
        ) : (
          <Input
            size="small"
            value={v}
            placeholder="Số lô"
            onChange={(e) => updateLine(row.id, { lotCode: e.target.value })}
          />
        ),
    },
    {
      title: 'Ngày',
      dataIndex: 'lotDate',
      width: 150,
      render: (v: string | null | undefined, row) =>
        isDecrease ? (
          v ? dayjs(v).format('DD/MM/YYYY') : '—'
        ) : (
          <DatePicker
            size="small"
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            value={v ? dayjs(v) : null}
            onChange={(d) => updateLine(row.id, { lotDate: d ? d.format('YYYY-MM-DD') : null })}
          />
        ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'qty',
      width: 110,
      render: (v: number, row) => (
        <InputNumber
          min={1}
          value={v}
          style={{ width: '100%' }}
          onChange={(n) => updateLine(row.id, { qty: Number(n) || 1 })}
        />
      ),
    },
    {
      title: '',
      width: 70,
      render: (_, row) => (
        <Button type="link" danger onClick={() => removeLine(row.id)}>
          Xóa
        </Button>
      ),
    },
  ]

  const pickerColumns: TableColumnsType<InventoryStockRow> = [
    { title: '#', width: 50, fixed: 'left', render: (_, __, i) => i + 1 },
    {
      title: 'Sản phẩm',
      width: 280,
      fixed: 'left',
      render: (_, row) => (
        <Space align="start" className="ops-adjust-product-cell">
          <ProductThumb src={row.imageUrl} label={row.sku} />
          <div>
            <div className="product-name-cell">{row.name}</div>
            <div className="ops-adjust-product-sku">{row.sku}</div>
            {row.partnerSku ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                SKU ĐT: {row.partnerSku}
              </Typography.Text>
            ) : null}
          </div>
        </Space>
      ),
    },
    {
      title: 'Tình trạng hàng hóa',
      dataIndex: 'goodsCondition',
      width: 150,
      render: (v: GoodsCondition) => <Tag color={goodsConditionColor[v]}>{goodsConditionLabel[v]}</Tag>,
    },
    { title: 'Loại sản phẩm', dataIndex: 'productKind', width: 120 },
    { title: 'Số lô', dataIndex: 'lotCode', width: 140 },
    {
      title: 'Ngày',
      dataIndex: 'lotDate',
      width: 120,
      render: (v: string | null) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
    { title: 'Tồn kho', dataIndex: 'stockQty', width: 90, align: 'right' },
    { title: 'Tồn kho vị trí', dataIndex: 'locationStockQty', width: 120, align: 'right' },
    {
      title: 'Chênh lệch',
      width: 100,
      align: 'right',
      render: (_, row) => {
        const diff = row.stockQty - row.locationStockQty
        return (
          <span style={{ color: diff !== 0 ? '#dc2626' : undefined, fontWeight: diff !== 0 ? 600 : 400 }}>
            {diff}
          </span>
        )
      },
    },
    {
      title: qtyColumnTitle,
      width: 120,
      fixed: 'right',
      render: (_, row) => (
        <InputNumber
          min={0}
          max={isDecrease ? row.stockQty : undefined}
          value={pickerQty[row.id] ?? undefined}
          placeholder="0"
          style={{ width: '100%' }}
          onChange={(n) =>
            setPickerQty((prev) => ({
              ...prev,
              [row.id]: Math.max(0, Number(n) || 0),
            }))
          }
        />
      ),
    },
  ]

  return (
    <div className="ops-adjust-create">
      <PageHeader title={title} />

      <div className="ops-adjust-layout">
        <div className="content-card ops-adjust-main">
          <div className="ops-adjust-main-toolbar">
            <div>
              <h3 className="inbound-section-title" style={{ marginBottom: 4 }}>
                Sản phẩm điều chỉnh
              </h3>
              <Typography.Text type="secondary">Tổng cộng: {totalQty}</Typography.Text>
            </div>
            <Space>
              <Button
                className="btn-success"
                icon={<FileExcelOutlined />}
                onClick={() => message.info('Demo: thêm từ file Excel')}
              >
                Thêm từ file
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openPicker}>
                Thêm +
              </Button>
            </Space>
          </div>

          <Table
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={lines}
            pagination={false}
            scroll={{ x: 1300 }}
            locale={{ emptyText: 'Chưa có sản phẩm' }}
          />
        </div>

        <div className="content-card ops-adjust-side">
          <div className="ops-adjust-side-field">
            <label>Đối tác</label>
            <Select
              showSearch
              allowClear
              placeholder="Chọn đối tác"
              value={partnerName}
              options={inventoryPartnerOptions}
              onChange={setPartnerName}
              style={{ width: '100%' }}
              optionFilterProp="label"
            />
          </div>
          <div className="ops-adjust-side-field">
            <label>Ghi chú</label>
            <Input.TextArea
              rows={5}
              placeholder="Nhập ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="ops-adjust-side-actions">
            <Button onClick={() => navigate('/operations/inventory-adjust')}>Thoát</Button>
            <Button type="primary" onClick={createAdjustment}>
              Tạo
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title={isDecrease ? 'Chọn sản phẩm cần giảm tồn' : 'Chọn sản phẩm cần tăng tồn'}
        open={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        width={1180}
        destroyOnHidden
        className="ops-adjust-picker-modal"
        footer={
          <Space>
            <Button onClick={() => setPickerOpen(false)}>Thoát</Button>
            <Button type="primary" onClick={savePicker}>
              Lưu
            </Button>
          </Space>
        }
      >
        <div className="table-toolbar" style={{ marginBottom: 12 }}>
          <Space wrap>
            <Select
              allowClear
              placeholder="Chọn tình trạng hàng hóa"
              style={{ width: 220 }}
              value={conditionFilter}
              onChange={setConditionFilter}
              options={Object.entries(goodsConditionLabel).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Space.Compact>
              <Input
                allowClear
                placeholder="Tìm kiếm theo SKU, SKU đối tác"
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                onPressEnter={() => undefined}
                style={{ width: 300 }}
              />
              <Button type="primary" icon={<SearchOutlined />} />
            </Space.Compact>
          </Space>
        </div>
        <Table
          rowKey="id"
          size="middle"
          columns={pickerColumns}
          dataSource={filteredStock}
          pagination={{ pageSize: 8, showTotal: (t) => `${t} dòng` }}
          scroll={{ x: 1300, y: 420 }}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </Modal>
    </div>
  )
}
