import { Alert, Progress, Table, Tag, Typography, type TableColumnsType } from 'antd'
import type { PackOrder, PackOrderLine, PackToteSession } from '../../data/packingSessions'
import { getCurrentPackOrder, sessionProgress } from '../../data/packingSessions'
import { pickListTypeLabel } from '../../data/pickingLists'

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) return <img src={src} alt={label} className="product-thumb-img" />
  return <div className="product-thumb">{label.slice(0, 2).toUpperCase()}</div>
}

function lineColumns(): TableColumnsType<PackOrderLine> {
  return [
    { title: '#', width: 48, render: (_, __, i) => i + 1 },
    {
      title: 'Ảnh',
      width: 72,
      render: (_, row) => <ProductThumb src={row.imageUrl} label={row.sku} />,
    },
    { title: 'SKU', dataIndex: 'sku', width: 150 },
    { title: 'Tên SP', dataIndex: 'name', ellipsis: true },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      width: 260,
      ellipsis: true,
      render: (note?: string) =>
        note ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {note}
          </Typography.Text>
        ) : (
          '—'
        ),
    },
    { title: 'ĐVT', dataIndex: 'unit', width: 70 },
    {
      title: 'Đã quét / SL',
      width: 110,
      align: 'right',
      render: (_, row) => (
        <Typography.Text type={row.scannedQty >= row.qty ? 'success' : undefined}>
          {row.scannedQty}/{row.qty}
        </Typography.Text>
      ),
    },
    {
      title: 'TT',
      width: 100,
      render: (_, row) => {
        if (row.status === 'shortage') return <Tag color="red">Thiếu</Tag>
        if (row.status === 'skipped') return <Tag>Bỏ qua</Tag>
        if (row.scannedQty >= row.qty) return <Tag color="green">Đủ</Tag>
        return <Tag color="processing">Chờ quét</Tag>
      },
    },
  ]
}

type SingleProps = { session: PackToteSession }

export function PackFlowSingleOrder({ session }: SingleProps) {
  const order = getCurrentPackOrder(session)
  const progress = sessionProgress(session)
  if (!order) {
    return <Alert type="success" showIcon message="Đã đóng gói xong đơn trong tote" />
  }
  return (
    <div className="ops-pack-flow">
      <PackSessionHeader session={session} progress={progress} />
      <OrderCard order={order} highlight />
      {order.packingNote ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="Hướng dẫn đóng gói"
          description={order.packingNote}
        />
      ) : null}
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        columns={lineColumns()}
        dataSource={order.lines}
        scroll={{ x: 1100 }}
      />
    </div>
  )
}

export function PackFlowSio({ session }: SingleProps) {
  const progress = sessionProgress(session)
  const columns: TableColumnsType<PackOrder> = [
    {
      title: 'Trạng thái',
      width: 120,
      render: (_, row) =>
        row.completed ? (
          <Tag color="green">Đã đóng gói</Tag>
        ) : (
          <Tag color="processing">Chờ quét</Tag>
        ),
    },
    {
      title: 'Ảnh',
      width: 72,
      render: (_, row) => (
        <ProductThumb src={row.lines[0]?.imageUrl} label={row.lines[0]?.sku || ''} />
      ),
    },
    { title: 'Mã OR', dataIndex: 'outboundCode', width: 150 },
    { title: 'Mã ĐT', dataIndex: 'partnerOrCode', width: 110 },
    {
      title: 'SKU',
      width: 140,
      render: (_, row) => row.lines[0]?.sku,
    },
    {
      title: 'Tên SP',
      width: 200,
      ellipsis: true,
      render: (_, row) => row.lines[0]?.name,
    },
    {
      title: 'Ghi chú',
      width: 220,
      ellipsis: true,
      render: (_, row) =>
        row.lines[0]?.note ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.lines[0].note}
          </Typography.Text>
        ) : (
          '—'
        ),
    },
    {
      title: 'Kiện',
      width: 150,
      render: (_, row) => row.packageCode || '—',
    },
  ]
  return (
    <div className="ops-pack-flow">
      <PackSessionHeader session={session} progress={progress} />
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="SIO — mỗi đơn 1 sản phẩm"
        description="Quét mã SP trong tote; hệ thống tự map đúng đơn và tạo kiện + nhãn ngay."
      />
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        columns={columns}
        dataSource={session.orders}
        scroll={{ x: 1200 }}
        rowClassName={(row) =>
          !row.completed && session.lastSkuScanned === row.lines[0]?.sku
            ? 'ops-pack-row-active'
            : ''
        }
      />
    </div>
  )
}

export function PackFlowBatchSameSku({ session }: SingleProps) {
  const order = getCurrentPackOrder(session)
  const progress = sessionProgress(session)
  const line = order?.lines[0]
  return (
    <div className="ops-pack-flow">
      <PackSessionHeader session={session} progress={progress} />
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="SSO — cùng một SKU, số lượng có thể khác nhau theo đơn"
        description="Quét đúng SL gợi ý cho đơn hiện tại, rồi in nhãn và tiếp tục đơn kế."
      />
      {order && line ? (
        <>
          <OrderCard order={order} highlight />
          <div className="ops-pack-suggest ops-pack-suggest-with-media">
            <ProductThumb src={line.imageUrl} label={line.sku} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text type="secondary">Gợi ý quét</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0' }}>
                {line.sku} × {line.qty}
              </Typography.Title>
              <Progress
                percent={Math.round((line.scannedQty / line.qty) * 100)}
                format={() => `${line.scannedQty}/${line.qty}`}
                style={{ maxWidth: 320, marginTop: 8 }}
              />
              <Typography.Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {line.name}
              </Typography.Paragraph>
              {line.note ? (
                <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
                  {line.note}
                </Typography.Paragraph>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <Alert type="success" showIcon message="Đã đóng gói đủ đơn trong tote SSO" />
      )}
    </div>
  )
}

export function PackFlowBatchSamePattern({ session }: SingleProps) {
  const order = getCurrentPackOrder(session)
  const progress = sessionProgress(session)
  return (
    <div className="ops-pack-flow">
      <PackSessionHeader session={session} progress={progress} />
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="SMO — các đơn giống nhau về bộ SKU và SL từng mã"
        description="Phân hàng vật lý theo pattern, quét đủ gợi ý trên màn hình rồi in nhãn; lặp đến hết số đơn."
      />
      {order ? (
        <>
          <OrderCard order={order} highlight />
          {order.packingNote ? (
            <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={order.packingNote} />
          ) : null}
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            Pattern cần quét (đơn hiện tại)
          </Typography.Title>
          <Table
            size="small"
            rowKey="id"
            pagination={false}
            columns={lineColumns()}
            dataSource={order.lines}
            scroll={{ x: 1100 }}
          />
        </>
      ) : (
        <Alert type="success" showIcon message="Đã đóng gói đủ đơn trong tote SMO" />
      )}
    </div>
  )
}

function PackSessionHeader({
  session,
  progress,
}: {
  session: PackToteSession
  progress: { done: number; total: number }
}) {
  return (
    <div className="ops-pack-session-head">
      <div>
        <Typography.Text type="secondary">Tote</Typography.Text>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {session.toteCode}
        </Typography.Title>
      </div>
      <div>
        <Typography.Text type="secondary">Loại DSLH</Typography.Text>
        <div>
          <Tag color="blue">{pickListTypeLabel[session.pickType]}</Tag>
        </div>
      </div>
      <div>
        <Typography.Text type="secondary">Tiến độ đơn</Typography.Text>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {progress.done}/{progress.total}
        </Typography.Title>
      </div>
      <div>
        <Typography.Text type="secondary">DSLH</Typography.Text>
        <div>
          <Typography.Text code>{session.pickListCode}</Typography.Text>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, highlight }: { order: PackOrder; highlight?: boolean }) {
  return (
    <div className={`ops-pack-order-card${highlight ? ' is-active' : ''}`}>
      <div>
        <Typography.Text type="secondary">Đơn hàng</Typography.Text>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {order.outboundCode}
        </Typography.Title>
      </div>
      <div>
        <Typography.Text type="secondary">Đối tác</Typography.Text>
        <div>{order.partnerName}</div>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {order.partnerOrCode}
        </Typography.Text>
      </div>
      {order.packageCode ? (
        <div>
          <Typography.Text type="secondary">Kiện</Typography.Text>
          <div>
            <Typography.Text code>{order.packageCode}</Typography.Text>
          </div>
        </div>
      ) : null}
    </div>
  )
}
