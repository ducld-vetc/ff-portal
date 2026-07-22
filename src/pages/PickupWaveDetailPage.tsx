import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, NodeIndexOutlined } from '@ant-design/icons'
import { Space, Table, Tag, Typography } from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { pickupAssignments } from '../data/mock'
import { buildPickerPathForWave } from '../data/warehouseLocations'

const statusMap = {
  pending: { color: 'default', label: 'Chờ gán' },
  in_progress: { color: 'processing', label: 'Đang lấy' },
  done: { color: 'success', label: 'Hoàn tất' },
} as const

export default function PickupWaveDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const wave = pickupAssignments.find((item) => item.id === id)

  if (!wave) {
    return (
      <div>
        <PageHeader title="Không tìm thấy yêu cầu lấy hàng" />
        <IconAction
          title="Quay lại"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/pickup-assignments')}
        />
      </div>
    )
  }

  const path = buildPickerPathForWave(wave.warehouseId, wave.lines)

  return (
    <div>
      <PageHeader
        title={`Lấy hàng · ${wave.wave}`}
        description="Lộ trình picker được tính riêng cho yêu cầu/wave này từ các bin đã allocate + độ ưu tiên layout kho."
        extra={
          <IconAction
            title="Danh sách wave"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/pickup-assignments')}
          />
        }
      />

      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="info-grid">
          <div>
            <div className="section-label">Wave</div>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{wave.wave}</strong>
          </div>
          <div>
            <div className="section-label">Kho</div>
            <div>{wave.warehouse}</div>
          </div>
          <div>
            <div className="section-label">Picker</div>
            <div>{wave.picker}</div>
          </div>
          <div>
            <div className="section-label">Trạng thái</div>
            <Tag color={statusMap[wave.status].color}>{statusMap[wave.status].label}</Tag>
          </div>
          <div>
            <div className="section-label">Đơn / SKU dòng</div>
            <div>
              {wave.orders} / {wave.items}
            </div>
          </div>
          <div>
            <div className="section-label">Gán lúc</div>
            <div>{new Date(wave.assignedAt).toLocaleString('vi-VN')}</div>
          </div>
        </div>
      </div>

      <div className="content-card" style={{ marginBottom: 16 }}>
        <h3 className="inbound-section-title">Dòng hàng cần lấy (đã allocate bin)</h3>
        {wave.lines.length === 0 ? (
          <Typography.Text type="secondary">
            Wave này chưa có dòng allocate (hoặc kho chưa cấu hình vị trí).
          </Typography.Text>
        ) : (
          <Table
            className="loc-data-table"
            rowKey={(_, i) => String(i)}
            size="middle"
            pagination={false}
            dataSource={wave.lines}
            columns={[
              { title: '#', width: 56, render: (_, __, i) => i + 1 },
              {
                title: 'Mã đơn',
                dataIndex: 'orderCode',
                width: 120,
                render: (v: string) => <span className="loc-code">{v}</span>,
              },
              {
                title: 'SKU',
                dataIndex: 'sku',
                width: 150,
                render: (v: string) => <span className="loc-code">{v}</span>,
              },
              { title: 'Sản phẩm', dataIndex: 'productName' },
              {
                title: 'Bin allocate',
                dataIndex: 'binCode',
                width: 160,
                render: (v: string) => <span className="loc-code">{v}</span>,
              },
              { title: 'SL', dataIndex: 'qty', width: 80, align: 'right' },
            ]}
          />
        )}
      </div>

      <div className="content-card">
        <div className="table-toolbar">
          <Space>
            <NodeIndexOutlined style={{ color: '#0f766e' }} />
            <h3 className="inbound-section-title" style={{ margin: 0 }}>
              Lộ trình picker của wave này
            </h3>
          </Space>
          <Typography.Text type="secondary">
            {path.length} điểm dừng · sort Room→Aisle→Rack→Level→Bin
          </Typography.Text>
        </div>
        <div className="picker-path-legend">
          <Tag color="blue">Theo yêu cầu</Tag>
          <span>
            Lộ trình <strong>không</strong> cấu hình trong Kho. Layout kho chỉ cung cấp độ ưu tiên;
            mỗi wave có tập bin khác nhau → lộ trình khác nhau. Cấu hình ưu tiên xem tại{' '}
            <Link to={`/warehouses/${wave.warehouseId}/locations`}>Thiết lập vị trí kho</Link>.
          </span>
        </div>
        {path.length === 0 ? (
          <Typography.Text type="secondary">
            Chưa có lộ trình — thiếu dòng allocate hoặc bin không tồn tại trên layout kho.
          </Typography.Text>
        ) : (
          <Table
            className="loc-data-table"
            rowKey={(r) => r.bin.id}
            size="middle"
            pagination={false}
            dataSource={path}
            columns={[
              {
                title: 'Bước',
                dataIndex: 'seq',
                width: 72,
                render: (v: number) => <span className="loc-step">{v}</span>,
              },
              {
                title: 'Đến bin',
                width: 170,
                render: (_, r) => <span className="loc-code">{r.bin.code}</span>,
              },
              {
                title: 'Phòng / Lối / Kệ / Tầng',
                width: 200,
                render: (_, r) => (
                  <span className="loc-code">
                    {r.roomCode}.{r.aisleCode}.{r.rackCode}.{r.levelCode}
                  </span>
                ),
              },
              {
                title: 'Ưu tiên bin',
                width: 110,
                align: 'center',
                render: (_, r) => (
                  <span className={`loc-priority ${r.bin.pickPriority === 1 ? 'is-top' : ''}`}>
                    <span className="loc-priority-num">{r.bin.pickPriority}</span>
                  </span>
                ),
              },
              {
                title: 'Lấy gì',
                render: (_, r) => (
                  <div>
                    {r.lines.map((line, i) => (
                      <div key={`${line.sku}-${i}`} style={{ fontSize: 13 }}>
                        <span className="loc-code">{line.sku}</span> × {line.qty}{' '}
                        <Typography.Text type="secondary">({line.orderCode})</Typography.Text>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: 'Tổng SL',
                dataIndex: 'totalQty',
                width: 90,
                align: 'right',
              },
              {
                title: 'Chuỗi ưu tiên',
                dataIndex: 'reason',
                ellipsis: true,
                render: (v: string) => (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {v}
                  </Typography.Text>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}
