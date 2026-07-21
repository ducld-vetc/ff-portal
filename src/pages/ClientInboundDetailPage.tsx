import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons'
import { Button, Space, Table, Tag, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import { InboundSerialModal } from '../components/InboundSerialModal'
import {
  getInboundRequest,
  goodsConditionColor,
  goodsConditionLabel,
  inboundStatusColor,
  inboundStatusLabel,
  inboundTypeLabel,
  type InboundLine,
} from '../data/inboundRequests'

export default function ClientInboundDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const request = getInboundRequest(id)
  const [serialLine, setSerialLine] = useState<InboundLine | null>(null)

  if (!request) {
    return (
      <div>
        <PageHeader title="Không tìm thấy yêu cầu nhập kho" />
        <Button onClick={() => navigate('/client/operations/inbound')}>Quay lại danh sách</Button>
      </div>
    )
  }

  const copy = () => {
    navigate(`/client/operations/inbound/create?copyFrom=${request.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Yêu cầu nhập kho ${request.code}`}
        description={`${request.warehouseName} · ${inboundTypeLabel[request.type]}`}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/client/operations/inbound')}>
              Danh sách
            </Button>
            <Button icon={<CopyOutlined />} onClick={copy}>
              Sao chép tạo nhanh
            </Button>
          </Space>
        }
      />

      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="info-grid">
          <div>
            <div className="section-label">Mã IR</div>
            <Typography.Text strong style={{ color: 'var(--color-primary, #1677ff)' }}>
              {request.code}
            </Typography.Text>
          </div>
          <div>
            <div className="section-label">Mã IR đối tác</div>
            <div>{request.partnerIrCode || '—'}</div>
          </div>
          <div>
            <div className="section-label">Trạng thái</div>
            <Tag color={inboundStatusColor[request.status]}>
              {inboundStatusLabel[request.status]}
            </Tag>
          </div>
          <div>
            <div className="section-label">TTHH</div>
            <Tag color={goodsConditionColor[request.goodsCondition]}>
              {goodsConditionLabel[request.goodsCondition]}
            </Tag>
          </div>
          <div>
            <div className="section-label">Kho nhập</div>
            <div>{request.warehouseName}</div>
          </div>
          <div>
            <div className="section-label">Nhà cung cấp</div>
            <div>{request.supplier || '—'}</div>
          </div>
          <div>
            <div className="section-label">Ngày dự kiến đến</div>
            <div>{dayjs(request.expectedAt).format('DD/MM/YYYY')}</div>
          </div>
          <div>
            <div className="section-label">Ngày nhận thực tế</div>
            <div>{request.receivedAt ? dayjs(request.receivedAt).format('DD/MM/YYYY') : '—'}</div>
          </div>
          <div>
            <div className="section-label">SL SKU / SP / Thực nhận</div>
            <div>
              {request.skuCount} / {request.productQty} / {request.receivedQty}
            </div>
          </div>
          <div>
            <div className="section-label">Phụ trách</div>
            <div>
              {request.ownerName} · {request.ownerPhone}
            </div>
          </div>
          <div>
            <div className="section-label">Tài xế / Số xe</div>
            <div>
              {request.driver || '—'} / {request.vehicleNo || '—'}
            </div>
          </div>
          <div>
            <div className="section-label">Ghi chú</div>
            <div>{request.note || '—'}</div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <h3 className="inbound-section-title">Sản phẩm nhập kho</h3>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={request.lines}
          columns={[
            { title: '#', width: 48, render: (_, __, i) => i + 1 },
            { title: 'Tên sản phẩm', dataIndex: 'name' },
            { title: 'SKU đối tác', dataIndex: 'partnerSku', width: 120 },
            { title: 'SKU', dataIndex: 'sku', width: 140 },
            { title: 'ĐVT', dataIndex: 'unit', width: 80 },
            {
              title: 'Số lượng',
              dataIndex: 'qty',
              width: 100,
              align: 'right',
              render: (qty: number, row) => (
                <Tooltip title="Xem danh sách serial">
                  <button
                    type="button"
                    className="inbound-qty-serial-link"
                    onClick={() => setSerialLine(row)}
                  >
                    {qty}
                  </button>
                </Tooltip>
              ),
            },
            {
              title: 'Đơn giá',
              dataIndex: 'unitPrice',
              width: 120,
              align: 'right',
              render: (v: number) => v.toLocaleString('vi-VN'),
            },
            {
              title: 'Thành tiền',
              width: 130,
              align: 'right',
              render: (_, row) => (row.qty * row.unitPrice).toLocaleString('vi-VN'),
            },
          ]}
        />
        <p style={{ marginTop: 12 }}>
          <Link to="/client/operations/inbound">← Về danh sách yêu cầu nhập kho</Link>
        </p>
      </div>

      <InboundSerialModal
        open={!!serialLine}
        line={serialLine}
        onClose={() => setSerialLine(null)}
      />
    </div>
  )
}
