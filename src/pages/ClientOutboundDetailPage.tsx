import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons'
import { Space, Table, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import {
  deliveryMethodLabel,
  formatAddress,
  getOutboundRequest,
  goodsConditionLabel,
  lineAmount,
  outboundPriorityLabel,
  outboundStatusColor,
  outboundStatusLabel,
  outboundTotals,
} from '../data/outboundRequests'

export default function ClientOutboundDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const request = getOutboundRequest(id)

  if (!request) {
    return (
      <div>
        <PageHeader title="Không tìm thấy yêu cầu xuất kho" />
        <IconAction
          title="Quay lại danh sách"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/client/operations/outbound')}
        />
      </div>
    )
  }

  const totals = outboundTotals(request.lines, request.paidAmount)

  return (
    <div>
      <PageHeader
        title={`Yêu cầu xuất kho ${request.code}`}
        description={`${request.warehouseName} · ${deliveryMethodLabel[request.deliveryMethod]}`}
        extra={
          <Space>
            <IconAction
              title="Danh sách"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/client/operations/outbound')}
            />
            <IconAction
              title="Sao chép tạo nhanh"
              icon={<CopyOutlined />}
              onClick={() =>
                navigate(`/client/operations/outbound/create?copyFrom=${request.id}`)
              }
            />
          </Space>
        }
      />

      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="info-grid">
          <div>
            <div className="section-label">Mã OR</div>
            <Typography.Text strong className="inbound-ir-link">
              {request.code}
            </Typography.Text>
          </div>
          <div>
            <div className="section-label">Mã OR đối tác</div>
            <div>{request.partnerOrCode || '—'}</div>
          </div>
          <div>
            <div className="section-label">Trạng thái</div>
            <Tag color={outboundStatusColor[request.status]}>
              {outboundStatusLabel[request.status]}
            </Tag>
          </div>
          <div>
            <div className="section-label">Độ ưu tiên</div>
            <div>{outboundPriorityLabel[request.priority]}</div>
          </div>
          <div>
            <div className="section-label">Người mua</div>
            <div>
              {request.buyerName} · {request.buyerPhone}
            </div>
          </div>
          <div>
            <div className="section-label">Địa chỉ</div>
            <div>{formatAddress(request)}</div>
          </div>
          <div>
            <div className="section-label">Gói vận chuyển</div>
            <div>{request.shippingPackage}</div>
          </div>
          <div>
            <div className="section-label">COD / Khai giá</div>
            <div>
              {request.cod.toLocaleString('vi-VN')} / {request.declaredValue.toLocaleString('vi-VN')}
            </div>
          </div>
          <div>
            <div className="section-label">Kênh / Cửa hàng</div>
            <div>
              {request.channel || '—'} · {request.storeName || '—'}
            </div>
          </div>
          <div>
            <div className="section-label">Ngày tạo</div>
            <div>{dayjs(request.createdAt).format('DD/MM/YYYY HH:mm')}</div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <h3 className="inbound-section-title">Sản phẩm xuất kho</h3>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={request.lines}
          columns={[
            { title: '#', width: 48, render: (_, __, i) => i + 1 },
            { title: 'Sản phẩm', dataIndex: 'name' },
            { title: 'SKU', dataIndex: 'sku', width: 140 },
            {
              title: 'TTHH',
              dataIndex: 'goodsCondition',
              width: 110,
              render: (v: keyof typeof goodsConditionLabel) => (
                <Tag>{goodsConditionLabel[v]}</Tag>
              ),
            },
            { title: 'SL', dataIndex: 'qty', width: 80, align: 'right' },
            {
              title: 'Đơn giá',
              dataIndex: 'unitPrice',
              width: 110,
              align: 'right',
              render: (v: number) => v.toLocaleString('vi-VN'),
            },
            {
              title: 'Giảm giá',
              dataIndex: 'discount',
              width: 100,
              align: 'right',
              render: (v: number) => v.toLocaleString('vi-VN'),
            },
            {
              title: 'Thành tiền',
              width: 120,
              align: 'right',
              render: (_, row) => lineAmount(row).toLocaleString('vi-VN'),
            },
          ]}
        />
        <div className="outbound-totals" style={{ marginTop: 16 }}>
          <div className="outbound-totals-row">
            <span>Tổng cộng</span>
            <strong>{totals.total.toLocaleString('vi-VN')}</strong>
          </div>
          <div className="outbound-totals-row">
            <span>Tổng giảm giá</span>
            <strong>{totals.totalDiscount.toLocaleString('vi-VN')}</strong>
          </div>
          <div className="outbound-totals-row">
            <span>Đã thanh toán</span>
            <strong>{request.paidAmount.toLocaleString('vi-VN')}</strong>
          </div>
          <div className="outbound-totals-row">
            <span>Còn lại</span>
            <strong>{totals.remaining.toLocaleString('vi-VN')}</strong>
          </div>
          <div className="outbound-totals-row">
            <span>COD</span>
            <strong>{request.cod.toLocaleString('vi-VN')}</strong>
          </div>
        </div>
        <p style={{ marginTop: 12 }}>
          <Link to="/client/operations/outbound">← Về danh sách yêu cầu xuất kho</Link>
        </p>
      </div>
    </div>
  )
}
