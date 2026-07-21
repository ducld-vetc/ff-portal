import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { ALL_PERMISSION_KEYS } from './permissions'

export type RoleGroup = {
  id: string
  code: string
  name: string
  description?: string
  permissionKeys: string[]
  isSystem: boolean
  userCount: number
  updatedAt: string
}

type RoleGroupsContextValue = {
  roleGroups: RoleGroup[]
  getById: (id: string) => RoleGroup | undefined
  getByCode: (code: string) => RoleGroup | undefined
  createGroup: (input: Omit<RoleGroup, 'id' | 'userCount' | 'updatedAt' | 'isSystem'>) => RoleGroup
  updateGroup: (id: string, input: Partial<Omit<RoleGroup, 'id' | 'isSystem'>>) => void
  deleteGroup: (id: string) => boolean
  options: { value: string; label: string; code: string }[]
}

const STORAGE_KEY = 'ffm-role-groups'

const defaultGroups: RoleGroup[] = [
  {
    id: 'rg-super-admin',
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Nhóm hệ thống — thao tác trên mọi màn hình.',
    permissionKeys: [...ALL_PERMISSION_KEYS],
    isSystem: true,
    userCount: 1,
    updatedAt: '2026-07-20T08:00:00',
  },
  {
    id: 'rg-warehouse-ops',
    code: 'WAREHOUSE_OPS',
    name: 'Vận hành kho',
    description: 'Nhận hàng, putaway, picking, packing, handover.',
    permissionKeys: [
      'dashboard.view',
      'warehouses.view',
      'warehouses.layout.view',
      'pickup.view',
      'pickup.create',
      'pickup.assign',
      'pickup.update',
      'catalog.view',
      'carriers.view',
      'reports.view',
    ],
    isSystem: false,
    userCount: 2,
    updatedAt: '2026-07-18T10:00:00',
  },
  {
    id: 'rg-picker',
    code: 'PICKER',
    name: 'Picker',
    description: 'Chỉ xem và thực hiện wave lấy hàng được gán.',
    permissionKeys: ['dashboard.view', 'pickup.view', 'pickup.update', 'catalog.view'],
    isSystem: false,
    userCount: 1,
    updatedAt: '2026-07-15T14:20:00',
  },
]

function loadGroups(): RoleGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultGroups
    const parsed = JSON.parse(raw) as RoleGroup[]
    if (!Array.isArray(parsed) || !parsed.length) return defaultGroups
    const hasSuper = parsed.some((g) => g.code === 'SUPER_ADMIN' && g.isSystem)
    if (!hasSuper) {
      return [defaultGroups[0], ...parsed.filter((g) => g.code !== 'SUPER_ADMIN')]
    }
    return parsed.map((g) =>
      g.code === 'SUPER_ADMIN'
        ? { ...g, isSystem: true, permissionKeys: [...ALL_PERMISSION_KEYS] }
        : g,
    )
  } catch {
    return defaultGroups
  }
}

function persist(groups: RoleGroup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
}

const RoleGroupsContext = createContext<RoleGroupsContextValue | null>(null)

export function RoleGroupsProvider({ children }: { children: ReactNode }) {
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>(() => loadGroups())

  const value = useMemo<RoleGroupsContextValue>(
    () => ({
      roleGroups,
      getById: (id) => roleGroups.find((g) => g.id === id),
      getByCode: (code) => roleGroups.find((g) => g.code === code),
      createGroup: (input) => {
        const next: RoleGroup = {
          ...input,
          id: `rg-${Date.now()}`,
          isSystem: false,
          userCount: 0,
          updatedAt: new Date().toISOString(),
          code: input.code.trim().toUpperCase().replace(/\s+/g, '_'),
        }
        setRoleGroups((prev) => {
          const groups = [next, ...prev]
          persist(groups)
          return groups
        })
        return next
      },
      updateGroup: (id, input) => {
        setRoleGroups((prev) => {
          const groups = prev.map((g) => {
            if (g.id !== id) return g
            if (g.isSystem) {
              return {
                ...g,
                name: input.name ?? g.name,
                description: input.description ?? g.description,
                permissionKeys: [...ALL_PERMISSION_KEYS],
                updatedAt: new Date().toISOString(),
              }
            }
            return {
              ...g,
              ...input,
              code: input.code
                ? input.code.trim().toUpperCase().replace(/\s+/g, '_')
                : g.code,
              updatedAt: new Date().toISOString(),
            }
          })
          persist(groups)
          return groups
        })
      },
      deleteGroup: (id) => {
        const target = roleGroups.find((g) => g.id === id)
        if (!target || target.isSystem) return false
        setRoleGroups((prev) => {
          const groups = prev.filter((g) => g.id !== id)
          persist(groups)
          return groups
        })
        return true
      },
      options: roleGroups.map((g) => ({
        value: g.code,
        label: `${g.name} (${g.code})`,
        code: g.code,
      })),
    }),
    [roleGroups],
  )

  return <RoleGroupsContext.Provider value={value}>{children}</RoleGroupsContext.Provider>
}

export function useRoleGroups() {
  const ctx = useContext(RoleGroupsContext)
  if (!ctx) throw new Error('useRoleGroups must be used within RoleGroupsProvider')
  return ctx
}
