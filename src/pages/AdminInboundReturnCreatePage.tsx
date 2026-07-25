import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Space, message } from 'antd'
import { PageHeader } from '../components/PageHeader'
import {
  formatAddress,
  getOutboundRequest,
  listOutboundRequests,
  type OutboundRequest,
} from '../data/outboundRequests'
import {
  generateInboundCode,
  upsertInboundRequest,
  type InboundRequest,
} from '../data/inboundRequests'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ops-field">
      <span className="ops-field-label">{label}</span>
      <span className="ops-field-value">{children}</span>
    </div>
  )
}

function maskName(name: string) {
  if (name.length <= 2) return name
  return `${name[0]}${'*'.repeat(Math.min(6, name.length - 2))}${name[name.length - 1]}`
}

function maskPhone(phone: string) {
  if (phone.length < 4) return phone
  return `${'*'.repeat(Math.max(0, phone.length - 2))}${phone.slice(-2)}`
}

function maskAddress(address: string) {
  if (address.length <= 8) return `******${address}`
  return `******${address.slice(-Math.min(48, address.length))}`
}

export default function AdminInboundReturnCreatePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<OutboundRequest | null>(null)

  const hints = useMemo(() => listOutboundRequests().slice(0, 3).map((r) => r.code), [])

  const search = () => {
    const q = query.trim()
    if (!q) {
      message.warning('Nhập mã xuất kho hoặc mã xuất kho đối tác')
      return
    }
    const hit =
      getOutboundRequest(q) ||
      listOutboundRequests().find(
        (row) =>
          row.code.toLowerCase() === q.toLowerCase() ||
          row.partnerOrCode.toLowerCase() === q.toLowerCase(),
      )
    if (!hit) {
      setFound(null)
      message.error('Không tìm thấy yêu cầu xuất kho')
      return
    }
    setFound(hit)
    message.success(`Đã tìm thấy ${hit.code}`)
  }

  const createReturn = () => {
    if (!found) return
    const id = `ir-ret-${Date.now()}`
    const next: InboundRequest = {
      id,
      code: generateInboundCode(),
      partnerIrCode: found.partnerOrCode,
      partnerName: found.storeName || found.warehouseName,
      country: 'VN',
      warehouseCode: found.warehouseCode,
      warehouseName: found.warehouseName,
      status: 'new',
      skuCount: found.lines.length,
      productQty: found.lines.reduce((s, l) => s + l.qty, 0),
      receivedQty: 0,
      storedQty: 0,
      goodsCondition: 'new',
      supplier: 'Khách trả hàng',
      type: 'return',
      expectedAt: new Date().toISOString().slice(0, 10),
      receivedAt: null,
      createdAt: new Date().toISOString(),
      referenceCode: found.code,
      driver: found.driver,
      vehicleNo: found.vehicleNo,
      containerNo: found.containerNo,
      note: `Trả hàng từ OR ${found.code}`,
      ownerName: 'Ops',
      ownerPhone: '0900000000',
      lines: found.lines.map((line, index) => ({
        id: `${id}-l${index + 1}`,
        productId: line.productId,
        name: line.name,
        partnerSku: line.partnerSku || '',
        sku: line.sku,
        unit: 'Cái',
        imageUrl: line.imageUrl,
        qty: line.qty,
        unitPrice: line.unitPrice,
      })),
    }
    upsertInboundRequest(next)
    message.success(`Đã tạo yêu cầu nhập kho trả hàng ${next.code}`)
    navigate(`/operations/inbound/${next.id}`)
  }

  return (
    <div>
      <PageHeader title="Tạo yêu cầu nhập kho - trả hàng" />

      <div className="content-card" style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%', maxWidth: 560 }}>
          <Input
            allowClear
            size="large"
            placeholder="Nhập mã xuất kho, xuất kho đối tác"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={search}
          />
          <Button
            type="primary"
            size="large"
            className="btn-search-accent"
            icon={<SearchOutlined />}
            onClick={search}
          />
        </Space.Compact>
        <div style={{ marginTop: 8, color: 'var(--color-text-muted)', fontSize: 13 }}>
          Ví dụ: {hints.join(', ')}
        </div>
      </div>

      {found ? (
        <div className="content-card">
          <h3 className="inbound-section-title">Thông tin yêu cầu xuất kho</h3>
          <div className="ops-return-info">
            <Field label="Đối tác">{found.storeName || found.warehouseName}</Field>
            <Field label="Kho xuất">{found.warehouseName}</Field>
            <Field label="Mã OR">
              <span className="inbound-ir-link">{found.code}</span>
            </Field>
            <Field label="Mã OR đối tác">{found.partnerOrCode}</Field>
            <Field label="Khách hàng">
              {maskName(found.buyerName)} - {maskPhone(found.buyerPhone)}
            </Field>
            <Field label="Địa chỉ">{maskAddress(formatAddress(found))}</Field>
            <Field label="Số xe">{found.vehicleNo || 'N/A'}</Field>
            <Field label="Số container">{found.containerNo || 'N/A'}</Field>
          </div>
          <div className="ops-return-actions">
            <Button type="primary" size="large" onClick={createReturn}>
              Tạo trả hàng
            </Button>
          </div>
        </div>
      ) : (
        <div className="content-card">
          <div style={{ color: 'var(--color-text-muted)' }}>
            Nhập mã xuất kho để tải thông tin đơn và tạo phiếu nhập trả hàng.
          </div>
        </div>
      )}
    </div>
  )
}
