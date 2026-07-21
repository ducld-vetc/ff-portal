import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type AuthUser = {
  username: string
  displayName: string
  role: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'ffm-admin-auth'

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadUser())

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(username, password) {
        await new Promise((r) => setTimeout(r, 400))
        if (username === 'admin' && password === 'ops123456') {
          const next: AuthUser = {
            username: 'admin',
            displayName: 'Admin',
            role: 'Master Data Admin',
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          setUser(next)
          return
        }
        throw new Error('Sai tên đăng nhập hoặc mật khẩu')
      },
      logout() {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
