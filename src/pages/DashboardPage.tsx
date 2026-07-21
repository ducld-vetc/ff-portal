import { useState } from 'react'
import { RightOutlined } from '@ant-design/icons'
import { DatePicker, Select, Table, message, type TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import {
  AreaTrendChart,
  DonutChart,
  GaugeChart,
} from '../components/dashboard/FulfillmentCharts'
import {
  avgDeliveryTime,
  avgProcessingTime,
  channelBreakdown,
  completionRate,
  fulfillmentKpis,
  needsProcessingCount,
  partnerFilterOptions,
  processingRate,
  processingSpeedSegments,
  salesChannelOptions,
  type ChannelRow,
} from '../data/dashboardFulfillment'
import { warehouseOptions } from '../data/mock'
import { usePortal } from '../portal/PortalContext'

const { RangePicker } = DatePicker

const kpiToneClass: Record<string, string> = {
  default: 'fd-kpi-default',
  orange: 'fd-kpi-orange',
  blue: 'fd-kpi-blue',
  green: 'fd-kpi-green',
  red: 'fd-kpi-red',
  brown: 'fd-kpi-brown',
}

const channelColumns: TableColumnsType<ChannelRow> = [
  { title: 'Kênh bán hàng', dataIndex: 'channel', width: 180 },
  { title: 'Đang xử lý', dataIndex: 'processing', align: 'right' },
  { title: 'Xử lý nhanh', dataIndex: 'fast', align: 'right' },
  { title: 'Xử lý đúng hạn', dataIndex: 'onTime', align: 'right' },
  { title: 'Xử lý trễ', dataIndex: 'late', align: 'right' },
  { title: 'Hủy', dataIndex: 'cancelled', align: 'right' },
  {
    title: 'Tổng cộng',
    dataIndex: 'total',
    align: 'right',
    render: (value: number) => <strong>{value.toLocaleString('vi-VN')}</strong>,
  },
]

export default function DashboardPage() {
  const { isCustomer } = usePortal()
  const [partner, setPartner] = useState<string | undefined>()
  const [warehouse, setWarehouse] = useState<string | undefined>()
  const [channel, setChannel] = useState<string | undefined>()
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs('2026-07-14'),
    dayjs('2026-07-21'),
  ])

  return (
    <div className="fulfillment-dashboard">
      <div className="fd-topbar">
        <h2 className="fd-title">Fulfillment</h2>
        <div className="fd-filters">
          {!isCustomer ? (
            <Select
              allowClear
              placeholder="Chọn đối tác"
              style={{ minWidth: 180 }}
              value={partner}
              onChange={setPartner}
              options={partnerFilterOptions}
            />
          ) : null}
          <Select
            allowClear
            placeholder="Chọn kho"
            style={{ minWidth: 160 }}
            value={warehouse}
            onChange={setWarehouse}
            options={warehouseOptions.filter((item) => item.value !== 'all')}
          />
          <Select
            allowClear
            placeholder="Chọn kênh bán hàng"
            style={{ minWidth: 180 }}
            value={channel}
            onChange={setChannel}
            options={salesChannelOptions.filter((item) => item.value !== 'all')}
          />
          <RangePicker
            value={range}
            format="DD/MM/YYYY"
            onChange={(values) => {
              if (values?.[0] && values?.[1]) {
                setRange([values[0], values[1]])
              }
            }}
          />
        </div>
      </div>

      <div className="fd-kpi-grid">
        {fulfillmentKpis.map((item) => (
          <div key={item.key} className={`fd-kpi-card ${kpiToneClass[item.tone]}`}>
            <div className="fd-kpi-label">{item.label}</div>
            <div className="fd-kpi-value">
              {item.value.toLocaleString('vi-VN')}
              {item.percent !== undefined ? (
                <span className="fd-kpi-percent"> ({item.percent}%)</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="fd-panel-grid fd-panel-grid-3">
        <div className="fd-panel">
          <div className="fd-panel-title">Tốc độ xử lý đơn hàng</div>
          <DonutChart
            segments={processingSpeedSegments}
            centerValue="9,492"
            centerLabel="đơn hàng"
          />
        </div>
        <div className="fd-panel">
          <div className="fd-panel-title">Tỷ lệ xử lý đơn hàng</div>
          <GaugeChart
            percent={processingRate.percent}
            color="#2563eb"
            label={`Đã xuất kho ${processingRate.shipped.toLocaleString('vi-VN')} trên tổng ${processingRate.total.toLocaleString('vi-VN')} đơn hàng`}
          />
        </div>
        <div className="fd-panel">
          <div className="fd-panel-title">Tỷ lệ hoàn thành đơn hàng</div>
          <GaugeChart
            percent={completionRate.percent}
            color="#22c55e"
            label={`Giao hàng thành công ${completionRate.delivered.toLocaleString('vi-VN')} trên tổng ${completionRate.total.toLocaleString('vi-VN')} đơn hàng`}
          />
        </div>
      </div>

      <button
        type="button"
        className="fd-alert-bar"
        onClick={() => message.info(`Có ${needsProcessingCount} đơn hàng cần xử lý (mock)`)}
      >
        <span className="fd-alert-label">Cần xử lý</span>
        <span className="fd-alert-value">
          {needsProcessingCount} Đơn hàng <RightOutlined />
        </span>
      </button>

      <div className="fd-panel-grid fd-panel-grid-2">
        <AreaTrendChart
          title="Thời gian xử lý đơn hàng trung bình"
          yLabel="Số lượng đơn"
          xLabel="Khoảng thời gian (ngày)"
          points={avgProcessingTime}
          color="#2563eb"
        />
        <AreaTrendChart
          title="Thời gian giao hàng trung bình"
          yLabel="Số lượng đơn"
          xLabel="Khoảng thời gian (ngày)"
          points={avgDeliveryTime}
          color="#22c55e"
        />
      </div>

      <div className="fd-panel fd-table-panel">
        <Table
          rowKey="channel"
          columns={channelColumns}
          dataSource={channelBreakdown}
          pagination={false}
          size="middle"
        />
      </div>
    </div>
  )
}
