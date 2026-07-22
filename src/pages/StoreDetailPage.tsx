import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  CloudSyncOutlined,
  DisconnectOutlined,
  LinkOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import {
  Form,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
  type TableColumnsType,
} from 'antd'
import { IconAction } from '../components/IconAction'
import { PageHeader } from '../components/PageHeader'
import { warehouses } from '../data/mock'
import { seedCatalogProducts } from '../data/productCatalog'
import {
  seedHungOrders,
  seedStoreProductLinks,
  storeRows,
  storeStatusColor,
  storeStatusLabel,
  type HungOrder,
  type SalesStore,
  type StoreProductLink,
} from '../data/stores'
import { usePortal } from '../portal/PortalContext'

function formatSyncAt(value?: string | null) {
  if (!value) return 'Chưa đồng bộ'
  return new Date(value).toLocaleString('vi-VN')
}

function ProductThumb({ src, label }: { src?: string; label: string }) {
  if (src) {
    return <img src={src} alt={label} className="product-thumb-img" />
  }
  return (
    <div className="product-thumb" title={label}>
      {label.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function StoreDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { isCustomer } = usePortal()
  const listPath = isCustomer ? '/client/stores' : '/customers/stores'

  const [store, setStore] = useState<SalesStore | undefined>(() =>
    storeRows.find((item) => item.id === id),
  )
  const [links, setLinks] = useState<StoreProductLink[]>(() =>
    seedStoreProductLinks.filter((item) => item.storeId === id),
  )
  const [hung, setHung] = useState<HungOrder[]>(() =>
    seedHungOrders.filter((item) => item.storeId === id),
  )
  const [linkOpen, setLinkOpen] = useState(false)
  const [linking, setLinking] = useState<StoreProductLink | null>(null)
  const [pendingWarehouse, setPendingWarehouse] = useState<string | undefined>()
  const [form] = Form.useForm()

  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ value: w.code, label: `${w.code} · ${w.name}` })),
    [],
  )

  const omsProductOptions = useMemo(
    () =>
      seedCatalogProducts.map((p) => ({
        value: p.sku,
        label: p.sku,
        product: p,
      })),
    [],
  )

  if (!store) {
    return (
      <div>
        <PageHeader title="Không tìm thấy cửa hàng" />
        <IconAction
          title="Quay lại danh sách"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(listPath)}
        />
      </div>
    )
  }

  const openManualLink = (row: StoreProductLink) => {
    setLinking(row)
    form.setFieldsValue({
      omsSku: row.omsSku,
      syncRatio: row.syncRatio,
      threshold: row.threshold,
    })
    setLinkOpen(true)
  }

  const autoLink = () => {
    let success = 0
    let failed = 0
    let firstFailed: StoreProductLink | null = null

    const nextLinks = links.map((item) => {
      if (item.linked) return item
      const match = seedCatalogProducts.find(
        (p) =>
          p.sku === item.channelSku ||
          p.partnerSku === item.channelSku ||
          p.name.toLowerCase() === item.channelName.toLowerCase(),
      )
      if (match) {
        success += 1
        return {
          ...item,
          linked: true,
          omsSku: match.sku,
          omsName: match.name,
          omsImageUrl: match.imageUrl,
          autoLinkStatus: 'success' as const,
          autoLinkNote: 'Liên kết tự động thành công (SKU / Barcode / SKU đối tác)',
        }
      }
      failed += 1
      const next: StoreProductLink = {
        ...item,
        linked: false,
        autoLinkStatus: 'failed',
        autoLinkNote: 'Liên kết tự động thất bại — chọn thủ công sản phẩm OMS tương ứng',
      }
      if (!firstFailed) firstFailed = next
      return next
    })

    setLinks(nextLinks)
    setStore((prev) =>
      prev ? { ...prev, lastSyncProductsAt: new Date().toISOString() } : prev,
    )

    if (success && !failed) {
      message.success(`Liên kết tự động thành công ${success} sản phẩm`)
    } else if (success && failed) {
      message.warning(
        `Tự động: ${success} thành công, ${failed} thất bại — chuyển sang liên kết thủ công`,
      )
      if (firstFailed) openManualLink(firstFailed)
    } else if (failed) {
      message.error('Liên kết tự động thất bại — vui lòng liên kết thủ công')
      if (firstFailed) openManualLink(firstFailed)
    } else {
      message.info('Không còn sản phẩm cần liên kết')
    }
  }

  const disconnect = () => {
    Modal.confirm({
      title: `Ngắt kết nối ${store.shopCode}?`,
      okText: 'Ngắt kết nối',
      okButtonProps: { danger: true },
      onOk: () => {
        setStore((prev) =>
          prev
            ? {
                ...prev,
                status: 'disconnected',
                syncOrders: false,
                syncInventory: false,
              }
            : prev,
        )
        message.success('Đã ngắt kết nối cửa hàng')
      },
    })
  }

  const linkColumns: TableColumnsType<StoreProductLink> = [
    {
      title: 'Hình ảnh',
      width: 88,
      render: (_, row) => <ProductThumb src={row.channelImageUrl} label={row.channelSku} />,
    },
    { title: 'SKU kênh', dataIndex: 'channelSku', width: 140 },
    { title: 'Tên trên kênh', dataIndex: 'channelName' },
    {
      title: 'OMS',
      width: 220,
      render: (_, row) =>
        row.linked ? (
          <Space size={8}>
            <ProductThumb src={row.omsImageUrl} label={row.omsSku || 'OMS'} />
            <span>
              <div style={{ fontFamily: 'var(--font-mono)' }}>{row.omsSku}</div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {row.omsName}
              </Typography.Text>
            </span>
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Liên kết',
      width: 160,
      render: (_, row) => {
        if (row.linked) {
          return (
            <Space direction="vertical" size={0}>
              <Tag color="green">Đã liên kết</Tag>
              {row.autoLinkStatus === 'success' ? (
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  Tự động
                </Typography.Text>
              ) : null}
            </Space>
          )
        }
        if (row.autoLinkStatus === 'failed') {
          return (
            <IconAction
              title="Tự động thất bại · Thủ công"
              size="small"
              icon={<LinkOutlined />}
              onClick={() => openManualLink(row)}
            />
          )
        }
        return (
          <IconAction
            title="Chưa liên kết"
            size="small"
            icon={<LinkOutlined />}
            onClick={() => openManualLink(row)}
          />
        )
      },
    },
    { title: 'Tỷ lệ đồng bộ tồn (%)', dataIndex: 'syncRatio', width: 150, align: 'right' },
    { title: 'Ngưỡng tồn', dataIndex: 'threshold', width: 110, align: 'right' },
  ]

  const hungColumns: TableColumnsType<HungOrder> = [
    { title: 'Mã đơn', dataIndex: 'orderCode', width: 180 },
    { title: 'Nguyên nhân', dataIndex: 'reason' },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (v: HungOrder['status']) =>
        v === 'hung' ? <Tag color="orange">Đơn treo</Tag> : <Tag color="green">Đã xử lý</Tag>,
    },
    {
      title: 'Tác vụ',
      width: 120,
      render: (_, row) => (
        <IconAction
          title="Tạo lại"
          size="small"
          icon={<ReloadOutlined />}
          disabled={row.status !== 'hung'}
          onClick={() => {
            setHung((prev) =>
              prev.map((item) => (item.id === row.id ? { ...item, status: 'retried' } : item)),
            )
            message.success(`Đã tạo lại đơn ${row.orderCode}`)
          }}
        />
      ),
    },
  ]

  const warehouseValue = pendingWarehouse ?? store.linkedWarehouseCode

  return (
    <div>
      <PageHeader
        title={`Cửa hàng ${store.shopCode}`}
        description={`${store.shopName} · ${store.channel}`}
        extra={
          <Space>
            <IconAction
              title="Danh sách"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(listPath)}
            />
            <IconAction
              title="Ngắt kết nối"
              danger
              icon={<DisconnectOutlined />}
              onClick={disconnect}
            />
          </Space>
        }
      />

      <div className="content-card" style={{ marginBottom: 16 }}>
        <div className="info-grid">
          <div>
            <div className="section-label">Kênh</div>
            <div>{store.channel}</div>
          </div>
          <div>
            <div className="section-label">ID cửa hàng</div>
            <div style={{ fontFamily: 'var(--font-mono)' }}>{store.shopId}</div>
          </div>
          <div>
            <div className="section-label">Trạng thái</div>
            <Tag color={storeStatusColor[store.status]}>{storeStatusLabel[store.status]}</Tag>
          </div>
          {!isCustomer ? (
            <div>
              <div className="section-label">Đối tác</div>
              <div>{store.partnerName}</div>
            </div>
          ) : null}
          <div>
            <div className="section-label">Kho liên kết</div>
            <div>
              {store.warehouseLinked && store.linkedWarehouseCode ? (
                <Tag color="green">{store.linkedWarehouseCode}</Tag>
              ) : (
                <Tag color="orange">Chưa liên kết kho</Tag>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <Tabs
          items={[
            {
              key: 'info',
              label: 'Thông tin cửa hàng',
              children: (
                <div className="form-grid" style={{ maxWidth: 720 }}>
                  <div>
                    <div className="section-label">Đồng bộ sản phẩm</div>
                    <Switch
                      checked={store.syncProducts}
                      checkedChildren="Bật"
                      unCheckedChildren="Tắt"
                      onChange={(checked) => {
                        setStore((prev) =>
                          prev
                            ? {
                                ...prev,
                                syncProducts: checked,
                                lastSyncProductsAt: checked
                                  ? new Date().toISOString()
                                  : prev.lastSyncProductsAt,
                              }
                            : prev,
                        )
                        message.success(
                          checked
                            ? 'OMS sẽ kéo sản phẩm từ kênh về hệ thống'
                            : 'Đã tắt đồng bộ sản phẩm',
                        )
                      }}
                    />
                    <div className="sync-meta">
                      Đồng bộ lần cuối: {formatSyncAt(store.lastSyncProductsAt)}
                    </div>
                  </div>
                  <div>
                    <div className="section-label">Đồng bộ đơn hàng</div>
                    <Switch
                      checked={store.syncOrders}
                      checkedChildren="Bật"
                      unCheckedChildren="Tắt"
                      onChange={(checked) => {
                        setStore((prev) =>
                          prev
                            ? {
                                ...prev,
                                syncOrders: checked,
                                lastSyncOrdersAt: checked
                                  ? new Date().toISOString()
                                  : prev.lastSyncOrdersAt,
                              }
                            : prev,
                        )
                        message.success(
                          checked
                            ? 'OMS chỉ đồng bộ đơn phát sinh kể từ lúc bật'
                            : 'Đã tắt đồng bộ đơn hàng',
                        )
                      }}
                    />
                    <div className="sync-meta">
                      Đồng bộ lần cuối: {formatSyncAt(store.lastSyncOrdersAt)}
                    </div>
                  </div>
                  <div>
                    <div className="section-label">Đồng bộ tồn kho</div>
                    <Switch
                      checked={store.syncInventory}
                      checkedChildren="Bật"
                      unCheckedChildren="Tắt"
                      onChange={(checked) => {
                        setStore((prev) =>
                          prev
                            ? {
                                ...prev,
                                syncInventory: checked,
                                lastSyncInventoryAt: checked
                                  ? new Date().toISOString()
                                  : prev.lastSyncInventoryAt,
                              }
                            : prev,
                        )
                        message.success(
                          checked
                            ? 'OMS sẽ đẩy tồn đã cập nhật lên kênh bán hàng'
                            : 'Đã tắt đồng bộ tồn',
                        )
                      }}
                    />
                    <div className="sync-meta">
                      Đồng bộ lần cuối: {formatSyncAt(store.lastSyncInventoryAt)}
                    </div>
                  </div>
                  <div>
                    <div className="section-label">Liên kết kho sử dụng</div>
                    {!store.warehouseLinked ? (
                      <Tag color="orange" style={{ marginBottom: 8 }}>
                        Chưa liên kết kho
                      </Tag>
                    ) : null}
                    <Space wrap>
                      <Select
                        allowClear
                        style={{ minWidth: 280 }}
                        placeholder="Chọn kho để liên kết"
                        value={warehouseValue}
                        options={warehouseOptions}
                        onChange={(value) => setPendingWarehouse(value)}
                      />
                      <IconAction
                        title="Lưu"
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={() => {
                          if (!warehouseValue) {
                            setStore((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    warehouseLinked: false,
                                    linkedWarehouseCode: undefined,
                                  }
                                : prev,
                            )
                            setPendingWarehouse(undefined)
                            message.success('Đã bỏ liên kết kho')
                            return
                          }
                          setStore((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  linkedWarehouseCode: warehouseValue,
                                  warehouseLinked: true,
                                }
                              : prev,
                          )
                          setPendingWarehouse(undefined)
                          message.success(`Đã liên kết kho ${warehouseValue}`)
                        }}
                      />
                    </Space>
                    <div className="sync-meta">
                      {store.warehouseLinked && store.linkedWarehouseCode
                        ? `Đang dùng: ${store.linkedWarehouseCode}`
                        : 'Cửa hàng chưa gắn kho — đơn sẽ không xuất được cho đến khi liên kết.'}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'products',
              label: 'Liên kết sản phẩm',
              children: (
                <>
                  <div className="table-toolbar">
                    <Typography.Text type="secondary">
                      Tự động khớp SKU / Barcode / SKU đối tác. Thất bại → liên kết thủ công với
                      sản phẩm nhà bán hàng trên OMS.
                    </Typography.Text>
                    <Space>
                      <IconAction
                        title="Liên kết tự động"
                        icon={<LinkOutlined />}
                        type="primary"
                        onClick={autoLink}
                      />
                    </Space>
                  </div>
                  <Table rowKey="id" columns={linkColumns} dataSource={links} pagination={false} />
                </>
              ),
            },
            {
              key: 'inventory',
              label: 'Quản lý tồn',
              children: (
                <>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Cấu hình tỷ lệ đồng bộ tồn, ngưỡng tồn và số lượng tồn ban đầu theo từng sản
                    phẩm đã liên kết, rồi lưu trước khi đẩy lên kênh bán hàng.
                  </p>
                  <Table
                    rowKey="id"
                    dataSource={links.filter((l) => l.linked)}
                    pagination={false}
                    scroll={{ x: 1100 }}
                    columns={[
                      {
                        title: 'Hình ảnh',
                        width: 72,
                        fixed: 'left',
                        render: (_, row) => (
                          <ProductThumb
                            src={row.omsImageUrl || row.channelImageUrl}
                            label={row.omsSku || row.channelSku}
                          />
                        ),
                      },
                      { title: 'SKU kênh', dataIndex: 'channelSku', width: 130 },
                      { title: 'SKU OMS', dataIndex: 'omsSku', width: 140 },
                      {
                        title: 'Tên sản phẩm',
                        width: 180,
                        render: (_, row) => row.omsName || row.channelName,
                      },
                      {
                        title: 'Tỷ lệ đồng bộ (%)',
                        width: 150,
                        render: (_, row) => (
                          <InputNumber
                            min={0}
                            max={100}
                            value={row.syncRatio}
                            addonAfter="%"
                            style={{ width: '100%' }}
                            onChange={(value) =>
                              setLinks((prev) =>
                                prev.map((item) =>
                                  item.id === row.id
                                    ? { ...item, syncRatio: value ?? 0 }
                                    : item,
                                ),
                              )
                            }
                          />
                        ),
                      },
                      {
                        title: 'Ngưỡng tồn',
                        width: 130,
                        render: (_, row) => (
                          <InputNumber
                            min={0}
                            value={row.threshold}
                            style={{ width: '100%' }}
                            onChange={(value) =>
                              setLinks((prev) =>
                                prev.map((item) =>
                                  item.id === row.id
                                    ? { ...item, threshold: value ?? 0 }
                                    : item,
                                ),
                              )
                            }
                          />
                        ),
                      },
                      {
                        title: 'SL tồn ban đầu',
                        width: 140,
                        render: (_, row) => (
                          <InputNumber
                            min={0}
                            value={row.initialSyncQty ?? 0}
                            style={{ width: '100%' }}
                            onChange={(value) =>
                              setLinks((prev) =>
                                prev.map((item) =>
                                  item.id === row.id
                                    ? { ...item, initialSyncQty: value ?? 0 }
                                    : item,
                                ),
                              )
                            }
                          />
                        ),
                      },
                      {
                        title: 'Tác vụ',
                        width: 220,
                        fixed: 'right',
                        render: (_, row) => (
                          <Space size={4} wrap>
                            <IconAction
                              title="Lưu cấu hình"
                              size="small"
                              type="primary"
                              icon={<SaveOutlined />}
                              onClick={() => {
                                message.success(
                                  `Đã lưu cấu hình tồn ${row.channelSku}: tỷ lệ ${row.syncRatio}%, ngưỡng ${row.threshold}, SL ban đầu ${row.initialSyncQty ?? 0}`,
                                )
                              }}
                            />
                            <IconAction
                              title="Đồng bộ KBH"
                              size="small"
                              icon={<CloudSyncOutlined />}
                              onClick={() => {
                                setStore((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        lastSyncInventoryAt: new Date().toISOString(),
                                      }
                                    : prev,
                                )
                                message.success(`Đã đồng bộ tồn ${row.channelSku} lên KBH`)
                              }}
                            />
                          </Space>
                        ),
                      },
                    ]}
                  />
                </>
              ),
            },
            {
              key: 'hung',
              label: `Đơn hàng treo (${hung.filter((h) => h.status === 'hung').length})`,
              children: (
                <>
                  <div className="table-toolbar">
                    <div />
                    <IconAction
                      title="Tạo lại tất cả"
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setHung((prev) => prev.map((item) => ({ ...item, status: 'retried' })))
                        message.success('Đã tạo lại tất cả đơn hàng treo')
                      }}
                    />
                  </div>
                  <Table rowKey="id" columns={hungColumns} dataSource={hung} pagination={false} />
                  <p style={{ marginTop: 12, color: 'var(--color-text-muted)' }}>
                    Đơn hợp lệ sau xử lý sẽ xuất hiện tại{' '}
                    <Link to={isCustomer ? '/client/operations/outbound' : '/pickup-assignments'}>
                      Vận hành / Xuất kho
                    </Link>
                    .
                  </p>
                </>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={linkOpen}
        title="Liên kết sản phẩm thủ công"
        onCancel={() => setLinkOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        destroyOnHidden
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (!linking) return
            const product = seedCatalogProducts.find((p) => p.sku === values.omsSku)
            setLinks((prev) =>
              prev.map((item) =>
                item.id === linking.id
                  ? {
                      ...item,
                      linked: true,
                      omsSku: values.omsSku,
                      omsName: product?.name || values.omsSku,
                      omsImageUrl: product?.imageUrl,
                      autoLinkStatus: 'failed',
                      autoLinkNote: 'Liên kết thủ công sau khi tự động thất bại',
                      syncRatio: values.syncRatio,
                      threshold: values.threshold,
                    }
                  : item,
              ),
            )
            setLinkOpen(false)
            message.success('Đã liên kết sản phẩm thủ công')
          }}
        >
          <Form.Item label="Sản phẩm kênh (kéo về từ sàn)">
            <Space size={12} align="start">
              <ProductThumb src={linking?.channelImageUrl} label={linking?.channelSku || ''} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)' }}>{linking?.channelSku}</div>
                <Typography.Text type="secondary">{linking?.channelName}</Typography.Text>
                {linking?.autoLinkStatus === 'failed' ? (
                  <div>
                    <Tag color="orange" style={{ marginTop: 6 }}>
                      Liên kết tự động thất bại
                    </Tag>
                  </div>
                ) : null}
              </div>
            </Space>
          </Form.Item>
          <Form.Item
            name="omsSku"
            label="Sản phẩm OMS (nhà bán hàng)"
            rules={[{ required: true, message: 'Chọn sản phẩm OMS tương ứng' }]}
            extra="Chọn SKU trong danh mục sản phẩm của nhà để map với sản phẩm sàn."
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Tìm SKU hoặc tên sản phẩm"
              options={omsProductOptions.map((opt) => ({
                value: opt.value,
                label: `${opt.product.sku} · ${opt.product.name}`,
              }))}
              optionRender={(option) => {
                const product = seedCatalogProducts.find((p) => p.sku === option.value)
                return (
                  <Space>
                    <ProductThumb src={product?.imageUrl} label={String(option.value)} />
                    <span>
                      <div style={{ fontFamily: 'var(--font-mono)' }}>{product?.sku}</div>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {product?.name}
                      </Typography.Text>
                    </span>
                  </Space>
                )
              }}
            />
          </Form.Item>
          <Form.Item name="syncRatio" label="Tỷ lệ đồng bộ tồn (%)" initialValue={100}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="threshold" label="Ngưỡng tồn" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
