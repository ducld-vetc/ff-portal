import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { inboundWarehouseOptions } from '../data/inboundRequests'
import { type PdaRoleCode, pdaRolePresets } from '../data/pdaRoles'

export type PdaAuthState = {
  operatorId: string
  operatorName: string
  username: string
  roleCode: PdaRoleCode
  warehouseCode: string
  warehouseName: string
  receiveSessionId: string | null
  pickSessionId: string | null
  packSessionId: string | null
  handoverSessionId: string | null
}

const STORAGE_KEY = 'ffm-pda-auth'
const DEMO_PASSWORD = '1234'

const USER_ROLES: Record<string, { roleCode: PdaRoleCode; operatorName: string }> = {
  ops: { roleCode: 'PDA_SUPERVISOR', operatorName: 'Ops Supervisor' },
  admin: { roleCode: 'PDA_SUPERVISOR', operatorName: 'Admin Kho' },
  supervisor: { roleCode: 'PDA_SUPERVISOR', operatorName: 'Supervisor' },
  receiver: { roleCode: 'PDA_RECEIVER', operatorName: 'NV Nhận hàng' },
  picker: { roleCode: 'PDA_PICKER', operatorName: 'Picker' },
  packer: { roleCode: 'PDA_PACKER', operatorName: 'Packer' },
  handover: { roleCode: 'PDA_HANDOVER', operatorName: 'NV Bàn giao' },
  counter: { roleCode: 'PDA_COUNTER', operatorName: 'NV Kiểm kê' },
}

type PdaContextValue = {
  auth: PdaAuthState | null
  receiveSessionId: string | null
  pickSessionId: string | null
  packSessionId: string | null
  handoverSessionId: string | null
  login: (input: {
    username: string
    password: string
    warehouseCode: string
  }) => { ok: true } | { ok: false; error: string }
  logout: () => void
  setReceiveSessionId: (id: string | null) => void
  setPickSessionId: (id: string | null) => void
  setPackSessionId: (id: string | null) => void
  setHandoverSessionId: (id: string | null) => void
  menuModules: string[]
  roleLabel: string
}

const PdaContext = createContext<PdaContextValue | null>(null)

function loadAuth(): PdaAuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PdaAuthState
  } catch {
    return null
  }
}

function persistAuth(auth: PdaAuthState | null) {
  if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  else localStorage.removeItem(STORAGE_KEY)
}

export function PdaProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<PdaAuthState | null>(() => loadAuth())

  const patch = useCallback((next: Partial<PdaAuthState>) => {
    setAuth((prev) => {
      if (!prev) return prev
      const merged = { ...prev, ...next }
      persistAuth(merged)
      return merged
    })
  }, [])

  const login = useCallback(
    (input: { username: string; password: string; warehouseCode: string }) => {
      const username = input.username.trim().toLowerCase()
      if (!username) return { ok: false as const, error: 'Nhập username' }
      if (input.password !== DEMO_PASSWORD) {
        return { ok: false as const, error: 'Sai mật khẩu (demo: 1234)' }
      }
      const mapped = USER_ROLES[username]
      const roleCode = mapped?.roleCode ?? 'PDA_SUPERVISOR'
      const operatorName = mapped?.operatorName ?? input.username.trim()
      const wh = inboundWarehouseOptions.find((w) => w.value === input.warehouseCode)
      const next: PdaAuthState = {
        operatorId: `pda-${username}`,
        operatorName,
        username,
        roleCode,
        warehouseCode: input.warehouseCode,
        warehouseName: wh?.label || input.warehouseCode,
        receiveSessionId: null,
        pickSessionId: null,
        packSessionId: null,
        handoverSessionId: null,
      }
      setAuth(next)
      persistAuth(next)
      return { ok: true as const }
    },
    [],
  )

  const logout = useCallback(() => {
    setAuth(null)
    persistAuth(null)
  }, [])

  const preset = auth ? pdaRolePresets.find((p) => p.code === auth.roleCode) : undefined

  const value = useMemo<PdaContextValue>(
    () => ({
      auth,
      receiveSessionId: auth?.receiveSessionId ?? null,
      pickSessionId: auth?.pickSessionId ?? null,
      packSessionId: auth?.packSessionId ?? null,
      handoverSessionId: auth?.handoverSessionId ?? null,
      login,
      logout,
      setReceiveSessionId: (id) => patch({ receiveSessionId: id }),
      setPickSessionId: (id) => patch({ pickSessionId: id }),
      setPackSessionId: (id) => patch({ packSessionId: id }),
      setHandoverSessionId: (id) => patch({ handoverSessionId: id }),
      menuModules: preset?.menuModules ?? [],
      roleLabel: preset?.name ?? '',
    }),
    [auth, login, logout, patch, preset],
  )

  return <PdaContext.Provider value={value}>{children}</PdaContext.Provider>
}

export function usePda() {
  const ctx = useContext(PdaContext)
  if (!ctx) throw new Error('usePda must be used within PdaProvider')
  return ctx
}
