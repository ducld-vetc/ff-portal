import { useNavigate, useParams } from 'react-router-dom'
import { Button, Space, Table, Tabs, Tag, Typography, message, type TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import {
  getPickList,
  pickListStatusColor,
  pickListStatusLabel,
  type PickListLine,
} from '../data/pickingLists'

export default function AdminPickingDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const pickList = getPickList(id)

  if (!pickList) {
    return (
      <div>
        <PageHeader title="Không tìm thấy danh sách lấy hàng" />
        <Button onClick={() => navigate('/operations/picking')}>Thoát</Button>
      </div>
    )
  }

  const columns: TableColumnsType<PickListLine> = [
    { title: 'Vị trí', dataIndex: 'location', width: 140 },
    { title: 'Nhóm', dataIndex: 'group', width: 70, align: 'right' },
    { title: 'Phân công', dataIndex: 'assignee', width: 140, render: (v) => v || '—' },
    {
      title: 'Tên SP',
      render: (_, row) => (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.sku}
          </Typography.Text>
          <div>{row.productName}</div>
        </div>
      ),
    },
    { title: 'SL', dataIndex: 'qty', width: 60, align: 'right' },
    { title: 'SL đã lấy', dataIndex: 'pickedQty', width: 90, align: 'right' },
    { title: 'ĐVT', dataIndex: 'unit', width: 80 },
    { title: 'Thiết bị lấy hàng', dataIndex: 'pickingDevice', width: 130, render: (v) => v || '—' },
    { title: 'Thiết bị đóng gói', dataIndex: 'packingDevice', width: 130, render: (v) => v || '—' },
    {
      title: 'Mã yêu cầu xuất kho',
      dataIndex: 'outboundCode',
      width: 170,
      render: (v: string) => <Typography.Link>{v}</Typography.Link>,
    },
    { title: 'Số lô', dataIndex: 'lotNo', width: 90, render: (v) => v || '—' },
    {
      title: 'Ngày sản xuất',
      dataIndex: 'mfgDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
  ]

  return (
    <div className="ops-page" draggable={false} onDragStart={(e) => e.preventDefault()}>
      <PageHeader
        title="Xem danh sách lấy hàng"
        extra={
          <Space>
            <Button onClick={() => navigate('/operations/picking')}>Thoát</Button>
            <Button type="primary" onClick={() => message.success('Đã xuất Excel (demo)')}>
              Xuất Excel
            </Button>
            <Button type="primary" onClick={() => message.info('Demo: in danh sách lấy hàng')}>
              In
            </Button>
          </Space>
        }
      />

      <div className="content-card" style={{ marginBottom: 16 }} draggable={false}>
        <Space align="center" style={{ marginBottom: 16 }} wrap>
          <Typography.Title level={4} style={{ margin: 0 }} copyable={false}>
            {pickList.code}
          </Typography.Title>
          <Tag color={pickListStatusColor[pickList.status]}>
            {pickListStatusLabel[pickList.status]}
          </Tag>
        </Space>
        <div className="info-grid">
          <div>
            <div className="section-label">SL đơn xuất</div>
            <div>{pickList.orderQty}</div>
          </div>
          <div>
            <div className="section-label">SL sản phẩm</div>
            <div>{pickList.productQty}</div>
          </div>
          <div>
            <div className="section-label">Loại danh sách</div>
            <div>{pickList.type}</div>
          </div>
          <div>
            <div className="section-label">Phân công</div>
            <div>{pickList.assignee || '—'}</div>
          </div>
          <div>
            <div className="section-label">Người tạo</div>
            <div>{pickList.createdBy}</div>
          </div>
          <div>
            <div className="section-label">Ngày tạo</div>
            <div>{dayjs(pickList.createdAt).format('DD/MM/YYYY HH:mm:ss')}</div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <Tabs
          items={[
            {
              key: 'detail',
              label: 'Chi tiết',
              children: (
                <Table
                  rowKey="id"
                  size="small"
                  columns={columns}
                  dataSource={pickList.lines}
                  scroll={{ x: 1600 }}
                  pagination={false}
                />
              ),
            },
            {
              key: 'history',
              label: 'Lịch sử',
              children: (
                <Typography.Paragraph type="secondary">
                  Tạo lúc {dayjs(pickList.createdAt).format('DD/MM/YYYY HH:mm:ss')} bởi{' '}
                  {pickList.createdBy}
                  {pickList.assignedAt
                    ? ` · Phân công ${pickList.assignee} lúc ${dayjs(pickList.assignedAt).format('DD/MM/YYYY HH:mm')}`
                    : ''}
                </Typography.Paragraph>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
