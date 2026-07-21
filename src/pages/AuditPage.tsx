import { Table, Tag, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'

type AuditRow = {
  id: string
  at: string
  actor: string
  action: string
  entity: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
}

const rows: AuditRow[] = [
  {
    id: '1',
    at: '2026-07-20T09:12:00',
    actor: 'admin',
    action: 'LOGIN',
    entity: 'auth.session',
    severity: 'INFO',
  },
  {
    id: '2',
    at: '2026-07-20T08:55:00',
    actor: 'admin',
    action: 'UPDATE_ROLES',
    entity: 'staff/e2e.wh.op',
    severity: 'WARNING',
  },
  {
    id: '3',
    at: '2026-07-19T21:10:00',
    actor: 'system',
    action: 'CARRIER_TIMEOUT',
    entity: 'carrier/GHN',
    severity: 'CRITICAL',
  },
]

const columns: TableColumnsType<AuditRow> = [
  {
    title: 'Thời gian',
    dataIndex: 'at',
    width: 180,
    render: (value: string) => new Date(value).toLocaleString('vi-VN'),
  },
  { title: 'Actor', dataIndex: 'actor', width: 120 },
  { title: 'Action', dataIndex: 'action', width: 180 },
  { title: 'Entity', dataIndex: 'entity' },
  {
    title: 'Severity',
    dataIndex: 'severity',
    width: 120,
    render: (severity: AuditRow['severity']) => {
      const color = severity === 'CRITICAL' ? 'red' : severity === 'WARNING' ? 'orange' : 'blue'
      return <Tag color={color}>{severity}</Tag>
    },
  },
]

export default function AuditPage() {
  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Nhật ký thao tác và sự kiện hệ thống trên Control Center."
      />
      <div className="content-card">
        <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} />
      </div>
    </div>
  )
}
