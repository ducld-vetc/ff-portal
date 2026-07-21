import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type PortalMode = 'admin' | 'customer'

export type CustomerScope = {
  customerId: string
  customerCode: string
  customerName: string
  /** Tên đối tác dùng để lọc dữ liệu demo thuộc khách hàng đang đăng nhập */
  partnerName: string
  partnerCode: string
}

type PortalContextValue = {
  portal: PortalMode
  setPortal: (mode: PortalMode) => void
  togglePortal: () => void
  isAdmin: boolean
  isCustomer: boolean
  customerScope: CustomerScope
}

const STORAGE_KEY = 'ffm-portal-mode'

/** Scope demo khi vào cổng Khách hàng — chỉ thấy dữ liệu của mình */
export const DEMO_CUSTOMER_SCOPE: CustomerScope = {
  customerId: '1',
  customerCode: 'KHAITN02',
  customerName: 'CÔNG TY TNHH EVERCHARGE01',
  partnerCode: 'DVH',
  partnerName: 'DVH - Hộ kinh doanh Đinh Văn Hùng',
}

const PortalContext = createContext<PortalContextValue | null>(null)

function readPortal(): PortalMode {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === 'customer' ? 'customer' : 'admin'
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [portal, setPortalState] = useState<PortalMode>(() => readPortal())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, portal)
    document.documentElement.setAttribute('data-portal', portal)
  }, [portal])

  const value = useMemo<PortalContextValue>(
    () => ({
      portal,
      setPortal: setPortalState,
      togglePortal: () => setPortalState((prev) => (prev === 'admin' ? 'customer' : 'admin')),
      isAdmin: portal === 'admin',
      isCustomer: portal === 'customer',
      customerScope: DEMO_CUSTOMER_SCOPE,
    }),
    [portal],
  )

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortal() {
  const ctx = useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be used within PortalProvider')
  return ctx
}
