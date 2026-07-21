import { useMemo, useState } from 'react'
import {
  EditOutlined,
  ImportOutlined,
  PictureOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Input, Select, Space, Table, Tag, Tooltip, type TableColumnsType } from 'antd'
import { PageHeader } from '../components/PageHeader'
import ProductFormModal from '../components/ProductFormModal'
import { customers } from '../data/mock'
import {
  outboundRuleLabel,
  productKindLabel,
  seedCatalogProducts,
  storageTypeLabel,
  warehouseKindLabel,
  type CatalogProduct,
} from '../data/productCatalog'
import { usePortal } from '../portal/PortalContext'

export default function CatalogPage() {
  const { isCustomer, customerScope } = usePortal()
  const [rows, setRows] = useState<CatalogProduct[]>(() => [...seedCatalogProducts])
  const [customerId, setCustomerId] = useState<string | undefined>()
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogProduct | null>(null)

  const customerOptions = useMemo(
    () =>
      customers
        .filter((c) => c.status !== 'draft')
        .map((c) => ({ value: c.id, label: `${c.code} · ${c.legalName || c.name}` })),
    [],
  )

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return rows.filter((row) => {
      if (isCustomer && row.customerId !== customerScope.customerId) return false
      if (!isCustomer && customerId && row.customerId !== customerId) return false
      if (
        q &&
        !row.sku.toLowerCase().includes(q) &&
        !row.name.toLowerCase().includes(q) &&
        !(row.partnerSku || '').toLowerCase().includes(q) &&
        !row.customerCode.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [rows, customerId, appliedQuery, isCustomer, customerScope.customerId])

  const openCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (row: CatalogProduct) => {
    setEditing(row)
    setOpen(true)
  }

  const columns: TableColumnsType<CatalogProduct> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      width: 88,
      render: (value: string | undefined, row) =>
        value ? (
          <img src={value} alt={row.name} className="product-thumb-img" />
        ) : (
          <div className="product-thumb">
            <PictureOutlined />
          </div>
        ),
    },
    {
      title: 'SKU / Tên SP',
      width: 260,
      render: (_, row) => (
        <div className="entity-copy">
          <strong>{row.name}</strong>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.sku}</span>
        </div>
      ),
    },
    {
      title: 'SKU đối tác',
      dataIndex: 'partnerSku',
      width: 130,
      render: (value?: string) =>
        value ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{value}</span> : '—',
    },
    ...(!isCustomer
      ? ([
          {
            title: 'Khách hàng',
            width: 200,
            render: (_: unknown, row: CatalogProduct) => (
              <div className="entity-copy">
                <strong>{row.customerCode}</strong>
                <span>{row.customerName}</span>
              </div>
            ),
          },
        ] as TableColumnsType<CatalogProduct>)
      : []),
    {
      title: 'Lưu trữ',
      dataIndex: 'storageType',
      width: 110,
      render: (value: CatalogProduct['storageType']) => storageTypeLabel[value],
    },
    {
      title: 'Loại SP',
      width: 120,
      render: (_, row) => {
        const base = productKindLabel[row.productKind]
        if (row.productKind === 'bundle' && row.bundleKind) {
          return `${base} (${row.bundleKind === 'physical' ? 'vật lý' : 'ảo'})`
        }
        return base
      },
    },
    {
      title: 'ĐVT',
      dataIndex: 'units',
      width: 120,
      render: (units: string[]) => units.join(', ') || '—',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categories',
      width: 140,
      render: (categories: string[]) =>
        categories.length
          ? categories.map((c) => (
              <Tag key={c} style={{ marginBottom: 2 }}>
                {c}
              </Tag>
            ))
          : '—',
    },
    {
      title: 'Xuất kho',
      dataIndex: 'outboundRule',
      width: 110,
      render: (value: CatalogProduct['outboundRule']) => outboundRuleLabel[value],
    },
    {
      title: 'Loại kho',
      dataIndex: 'warehouseKind',
      width: 110,
      render: (value: CatalogProduct['warehouseKind']) => warehouseKindLabel[value],
    },
    {
      title: 'Theo dõi',
      width: 160,
      render: (_, row) => (
        <Space size={[4, 4]} wrap>
          {row.trackExpiry ? <Tag color="orange">HSD</Tag> : null}
          {row.manageByLot ? <Tag color="blue">Lô</Tag> : null}
          {row.trackSerialOnOutbound ? <Tag color="purple">Serial xuất</Tag> : null}
          {row.isPrivate ? <Tag color="magenta">Riêng tư</Tag> : null}
          {row.hasBarcodeList ? <Tag>Barcode list</Tag> : null}
          {!row.trackExpiry &&
          !row.manageByLot &&
          !row.trackSerialOnOutbound &&
          !row.isPrivate &&
          !row.hasBarcodeList
            ? '—'
            : null}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 100,
      render: (status: CatalogProduct['status']) =>
        status === 'active' ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, row) => (
        <Tooltip title="Sửa">
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
        </Tooltip>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Product & SKU"
        description="Master data sản phẩm theo khách hàng: SKU, loại lưu trữ, hạn sử dụng, đơn vị tính và quy tắc xuất kho."
        extra={
          <Space>
            <Button icon={<ImportOutlined />}>Import</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm sản phẩm
            </Button>
          </Space>
        }
      />

      <div className="content-card">
        <div className="table-toolbar">
          <Space wrap>
            {!isCustomer ? (
              <Select
                allowClear
                placeholder="Lọc theo khách hàng"
                style={{ minWidth: 280 }}
                value={customerId}
                onChange={setCustomerId}
                options={customerOptions}
              />
            ) : null}
            <Space.Compact style={{ width: 340 }}>
              <Input
                allowClear
                placeholder="Tìm SKU, SKU đối tác, tên sản phẩm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={() => setAppliedQuery(query)}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setAppliedQuery(query)}
              />
            </Space.Compact>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1680 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      <ProductFormModal
        open={open}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        defaultCustomerId={isCustomer ? customerScope.customerId : customerId}
        onCancel={() => setOpen(false)}
        onSubmit={(product) => {
          setRows((prev) => {
            const exists = prev.some((item) => item.id === product.id)
            if (exists) return prev.map((item) => (item.id === product.id ? product : item))
            return [product, ...prev]
          })
          setOpen(false)
        }}
      />
    </div>
  )
}
