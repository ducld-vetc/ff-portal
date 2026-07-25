import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Select, Space, message } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { binTypeOptions, createStocktakeSession, estimateDailyStats } from '../data/stocktakeSessions'

export default function AdminStocktakeSkuBinCreatePage() {
  const navigate = useNavigate()
  const [binType, setBinType] = useState<string | undefined>()
  const [note, setNote] = useState('')

  const stats = binType ? estimateDailyStats('location', binType) : { locations: 0, skus: 0, products: 0 }

  const create = () => {
    if (!binType) {
      message.warning('Chọn loại bin')
      return
    }
    const row = createStocktakeSession({
      requestType: 'internal',
      kind: 'sku_bin',
      note: note.trim() || undefined,
      skuCount: stats.skus,
      productQty: stats.products,
      locationCount: stats.locations,
    })
    message.success(`Đã tạo phiên ${row.code}`)
    navigate(`/operations/stocktake/${row.id}`)
  }

  return (
    <div>
      <PageHeader title="Tạo phiên kiểm kê theo SKU, BIN" />

      <div className="content-card">
        <div className="ops-stocktake-form-row">
          <div className="ops-stocktake-field">
            <label>
              Loại bin <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <Select
              placeholder="Loại bin"
              value={binType}
              options={binTypeOptions}
              onChange={setBinType}
              style={{ width: '100%' }}
            />
          </div>
          <div className="ops-stocktake-field ops-stocktake-field-grow">
            <label>Ghi chú</label>
            <Input placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <div className="ops-stocktake-meta-row">
          <div>
            <span className="ops-stocktake-meta-label">SKU:</span>{' '}
            {binType ? stats.skus.toLocaleString('vi-VN') : ''}
          </div>
          <div>
            <span className="ops-stocktake-meta-label">Sản phẩm:</span>{' '}
            {binType ? stats.products.toLocaleString('vi-VN') : ''}
          </div>
        </div>

        <div className="ops-stocktake-footer-actions">
          <Space>
            <Button onClick={() => navigate('/operations/stocktake')}>Thoát</Button>
            <Button className="btn-success" onClick={create}>
              Tạo
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}
