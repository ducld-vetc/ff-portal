import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Checkbox, Input, Select, Space, Tabs, message } from 'antd'
import { PageHeader } from '../components/PageHeader'
import {
  binTypeOptions,
  changeTimeOptions,
  createStocktakeSession,
  estimateDailyStats,
  stocktakePartnerOptions,
} from '../data/stocktakeSessions'

export default function AdminStocktakeDailyCreatePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'location' | 'product' | 'change'>('location')
  const [binType, setBinType] = useState<string>('pickable')
  const [partner, setPartner] = useState<string | undefined>('GRS - GRS')
  const [timeRange, setTimeRange] = useState('today')
  const [note, setNote] = useState('')
  const [custom, setCustom] = useState(false)

  const stats = useMemo(() => {
    if (tab === 'location') return estimateDailyStats('location', binType)
    if (tab === 'product') return estimateDailyStats('product', undefined, partner)
    return estimateDailyStats('change', undefined, partner)
  }, [tab, binType, partner])

  const create = () => {
    if (tab === 'location' && !binType) {
      message.warning('Chọn loại bin')
      return
    }
    if ((tab === 'product' || tab === 'change') && !partner) {
      message.warning('Chọn đối tác')
      return
    }
    const kind =
      tab === 'location' ? 'daily_by_location' : tab === 'product' ? 'daily_by_product' : 'daily_by_change'
    const row = createStocktakeSession({
      requestType: partner ? 'partner' : 'internal',
      kind,
      partnerName: partner,
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
      <PageHeader
        title="Tạo phiên kiểm đếm thường nhật"
        extra={
          <Space>
            <Button onClick={() => navigate('/operations/stocktake')}>Thoát</Button>
            <Button className="btn-success" onClick={create}>
              Tạo
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as typeof tab)}
          items={[
            { key: 'location', label: 'Theo vị trí' },
            { key: 'product', label: 'Theo sản phẩm' },
            { key: 'change', label: 'Tồn kho thay đổi' },
          ]}
        />

        <div className="ops-stocktake-form-row">
          {tab === 'location' ? (
            <div className="ops-stocktake-field">
              <label>Loại bin</label>
              <Select
                value={binType}
                options={binTypeOptions}
                onChange={setBinType}
                style={{ width: '100%' }}
              />
            </div>
          ) : (
            <div className="ops-stocktake-field">
              <label>Đối tác</label>
              <Select
                allowClear
                value={partner}
                options={stocktakePartnerOptions}
                onChange={setPartner}
                style={{ width: '100%' }}
                optionFilterProp="label"
                placeholder="Chọn đối tác"
              />
            </div>
          )}

          {tab === 'change' ? (
            <div className="ops-stocktake-field">
              <label>Thời gian</label>
              <Select value={timeRange} options={changeTimeOptions} onChange={setTimeRange} style={{ width: '100%' }} />
            </div>
          ) : null}

          <div className="ops-stocktake-field ops-stocktake-field-grow">
            <label>Ghi chú</label>
            <Input placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <div className="ops-stocktake-stats">
          <div className="ops-stocktake-stat">
            <div className="ops-stocktake-stat-label">Vị trí</div>
            <div className="ops-stocktake-stat-value is-green">{stats.locations.toLocaleString('vi-VN')}</div>
          </div>
          <div className="ops-stocktake-stat">
            <div className="ops-stocktake-stat-label">SKU</div>
            <div className="ops-stocktake-stat-value is-blue">{stats.skus.toLocaleString('vi-VN')}</div>
          </div>
          <div className="ops-stocktake-stat">
            <div className="ops-stocktake-stat-label">Sản phẩm</div>
            <div className="ops-stocktake-stat-value is-blue">{stats.products.toLocaleString('vi-VN')}</div>
          </div>
        </div>

        {tab !== 'change' ? (
          <Checkbox checked={custom} onChange={(e) => setCustom(e.target.checked)} style={{ marginTop: 16 }}>
            Tuỳ chỉnh
          </Checkbox>
        ) : null}
      </div>
    </div>
  )
}
