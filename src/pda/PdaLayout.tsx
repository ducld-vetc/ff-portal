import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { PdaWorkspaceShell } from './components/PdaSampleSlot'
import { PdaScanProvider } from './components/PdaScannerOverlay'
import { PdaProvider, usePda } from './PdaContext'
import { PdaTheme } from './PdaTheme'
import { pdaScreenTitle } from './pdaModules'
import './pda.css'

function titleForPath(pathname: string) {
  if (pdaScreenTitle[pathname]) return pdaScreenTitle[pathname]
  const hit = Object.keys(pdaScreenTitle).find((k) => pathname.startsWith(k) && k !== '/pda/home')
  return hit ? pdaScreenTitle[hit] : 'WAREHOUSE OPS'
}

function PdaShell() {
  const { auth, logout } = usePda()
  const navigate = useNavigate()
  const location = useLocation()

  if (!auth) {
    return <Navigate to="/pda/login" replace state={{ from: location.pathname }} />
  }

  const isHome = location.pathname === '/pda/home'
  const title = isHome ? 'WAREHOUSE OPS' : titleForPath(location.pathname)

  return (
    <div className="pda-app">
      <PdaScanProvider>
        <header className="pda-header">
          <div className="pda-header-row">
            {!isHome ? (
              <Button
                type="text"
                className="pda-header-btn"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              />
            ) : (
              <span className="pda-header-spacer" />
            )}
            <div className="pda-header-center">
              <div className="pda-header-title">{title}</div>
              <div className="pda-header-sub">
                {isHome ? 'BY AI' : auth.warehouseName}
              </div>
            </div>
            <Button
              type="text"
              className="pda-header-btn"
              icon={isHome ? <LogoutOutlined /> : <HomeOutlined />}
              onClick={() => (isHome ? logout() : navigate('/pda/home'))}
            />
          </div>
        </header>
        <main className="pda-main">
          <Outlet />
        </main>
      </PdaScanProvider>
    </div>
  )
}

export default function PdaLayout() {
  return (
    <PdaProvider>
      <PdaTheme>
        <PdaWorkspaceShell>
          <PdaShell />
        </PdaWorkspaceShell>
      </PdaTheme>
    </PdaProvider>
  )
}
