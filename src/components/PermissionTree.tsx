import { useMemo, useState, type ReactNode } from 'react'
import { CaretDownOutlined, CaretRightOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Checkbox, Empty, Input, Space, Typography } from 'antd'
import {
  ALL_PERMISSION_KEYS,
  filterPermissionTree,
  permissionTree,
  type PermissionNode,
} from '../data/permissions'

type Props = {
  value: string[]
  onChange: (keys: string[]) => void
  readOnly?: boolean
  forceAll?: boolean
}

function getLeafKeys(node: PermissionNode): string[] {
  if (!node.children?.length) return [node.key]
  return node.children.flatMap(getLeafKeys)
}

function NodeRows({
  nodes,
  depth,
  checkedKeys,
  expanded,
  onToggleExpand,
  onToggleLeaves,
  readOnly,
}: {
  nodes: PermissionNode[]
  depth: number
  checkedKeys: Set<string>
  expanded: Set<string>
  onToggleExpand: (key: string) => void
  onToggleLeaves: (leaves: string[], checked: boolean) => void
  readOnly?: boolean
}) {
  return (
    <>
      {nodes.map((node) => {
        const leaves = getLeafKeys(node)
        const checkedCount = leaves.filter((k) => checkedKeys.has(k)).length
        const allChecked = checkedCount === leaves.length && leaves.length > 0
        const indeterminate = checkedCount > 0 && !allChecked
        const hasChildren = Boolean(node.children?.length)
        const isOpen = expanded.has(node.key)

        return (
          <div key={node.key} className="perm-node">
            <div
              className={`perm-row ${depth === 0 ? 'perm-row-root' : ''}`}
              style={{ paddingLeft: 12 + depth * 22 }}
            >
              <Checkbox
                checked={allChecked}
                indeterminate={indeterminate}
                disabled={readOnly}
                onChange={(e) => onToggleLeaves(leaves, e.target.checked)}
              />
              {hasChildren ? (
                <button
                  type="button"
                  className="perm-toggle"
                  onClick={() => onToggleExpand(node.key)}
                  aria-expanded={isOpen}
                >
                  {isOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
                  <span className={depth === 0 ? 'perm-root-title' : undefined}>{node.title}</span>
                </button>
              ) : (
                <span className="perm-leaf-title">{node.title}</span>
              )}
            </div>

            {hasChildren && isOpen ? (
              <NodeRows
                nodes={node.children!}
                depth={depth + 1}
                checkedKeys={checkedKeys}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                onToggleLeaves={onToggleLeaves}
                readOnly={readOnly}
              />
            ) : null}
          </div>
        )
      })}
    </>
  )
}

function collectExpandableKeys(nodes: PermissionNode[]): string[] {
  const keys: string[] = []
  const walk = (list: PermissionNode[]) => {
    for (const node of list) {
      if (node.children?.length) {
        keys.push(node.key)
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return keys
}

export default function PermissionTree({ value, onChange, readOnly, forceAll }: Props) {
  const [query, setQuery] = useState('')
  const tree = useMemo(() => filterPermissionTree(permissionTree, query), [query])
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(collectExpandableKeys(permissionTree)),
  )

  const effectiveValue = forceAll ? ALL_PERMISSION_KEYS : value
  const checkedKeys = useMemo(() => new Set(effectiveValue), [effectiveValue])
  const disabled = readOnly || forceAll

  const onToggleLeaves = (leaves: string[], checked: boolean) => {
    if (disabled) return
    const next = new Set(value)
    for (const key of leaves) {
      if (checked) next.add(key)
      else next.delete(key)
    }
    onChange([...next])
  }

  const onToggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  let body: ReactNode
  if (!tree.length) {
    body = <Empty description="Không tìm thấy quyền phù hợp" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  } else {
    body = (
      <NodeRows
        nodes={tree}
        depth={0}
        checkedKeys={checkedKeys}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        onToggleLeaves={onToggleLeaves}
        readOnly={disabled}
      />
    )
  }

  return (
    <div className="perm-panel">
      <div className="perm-toolbar">
        <Input.Search
          allowClear
          enterButton={<SearchOutlined />}
          placeholder="Tìm kiếm quyền..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={setQuery}
          className="perm-search-input"
        />
        <Space size={12} wrap>
          <Typography.Text type="secondary">
            Đã chọn {effectiveValue.length}/{ALL_PERMISSION_KEYS.length}
          </Typography.Text>
          {!disabled ? (
            <Button
              type="link"
              size="small"
              onClick={() =>
                onChange(
                  effectiveValue.length === ALL_PERMISSION_KEYS.length
                    ? []
                    : [...ALL_PERMISSION_KEYS],
                )
              }
            >
              {effectiveValue.length === ALL_PERMISSION_KEYS.length
                ? 'Bỏ chọn tất cả'
                : 'Chọn tất cả'}
            </Button>
          ) : null}
          <Button
            type="link"
            size="small"
            onClick={() => setExpanded(new Set(collectExpandableKeys(tree)))}
          >
            Mở rộng
          </Button>
          <Button type="link" size="small" onClick={() => setExpanded(new Set())}>
            Thu gọn
          </Button>
        </Space>
      </div>

      {forceAll ? (
        <Typography.Paragraph type="secondary" className="perm-hint">
          Nhóm <strong>SUPER_ADMIN</strong> luôn có toàn bộ quyền trên hệ thống và không thể thu hẹp.
        </Typography.Paragraph>
      ) : null}

      <div className="perm-tree">{body}</div>
    </div>
  )
}
