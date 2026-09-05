import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CloseOutlined, ThunderboltFilled, ThunderboltOutlined } from '@ant-design/icons'
import { Button, Input, type InputRef } from 'antd'

type ScanRequest = {
  title?: string
  resolve: (code: string | null) => void
}

type PdaScanContextValue = {
  requestScan: (opts?: { title?: string }) => Promise<string | null>
}

const PdaScanContext = createContext<PdaScanContextValue | null>(null)

export function PdaScanProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<ScanRequest | null>(null)
  const [manual, setManual] = useState('')
  const [torch, setTorch] = useState(false)
  const inputRef = useRef<InputRef>(null)

  const requestScan = useCallback((opts?: { title?: string }) => {
    return new Promise<string | null>((resolve) => {
      setManual('')
      setTorch(false)
      setReq({ title: opts?.title, resolve })
      setTimeout(() => inputRef.current?.focus(), 80)
    })
  }, [])

  const close = (code: string | null) => {
    req?.resolve(code)
    setReq(null)
    setManual('')
  }

  const submitManual = () => {
    const q = manual.trim()
    if (!q) return
    close(q)
  }

  const value = useMemo(() => ({ requestScan }), [requestScan])

  return (
    <PdaScanContext.Provider value={value}>
      {children}
      {req ? (
        <div className="pda-scanner" role="dialog" aria-label="Scanner">
          <div className="pda-scanner-top">
            <button type="button" className="pda-scanner-icon-btn" onClick={() => close(null)}>
              <CloseOutlined />
            </button>
            <div className="pda-scanner-title">{req.title || 'Scan'}</div>
            <button
              type="button"
              className="pda-scanner-icon-btn"
              onClick={() => setTorch((v) => !v)}
              aria-label="Torch"
            >
              {torch ? <ThunderboltFilled /> : <ThunderboltOutlined />}
            </button>
          </div>

          <div className="pda-scanner-view">
            <div className={`pda-scanner-beam ${torch ? 'on' : ''}`} />
            <div className="pda-scan-overlay">
              <span className="pda-scan-corner tl" />
              <span className="pda-scan-corner tr" />
              <span className="pda-scan-corner bl" />
              <span className="pda-scan-corner br" />
            </div>
            <p className="pda-scanner-hint">Đưa mã vào khung · camera PDA</p>
          </div>

          <div className="pda-scanner-manual">
            <div className="pda-scanner-manual-label">Scan text</div>
            <div className="pda-scan-bar">
              <Input
                ref={inputRef}
                size="large"
                placeholder="Nhập mã thủ công…"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onPressEnter={submitManual}
              />
              <Button type="primary" size="large" onClick={submitManual}>
                OK
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PdaScanContext.Provider>
  )
}

export function usePdaScan() {
  const ctx = useContext(PdaScanContext)
  if (!ctx) throw new Error('usePdaScan must be used within PdaScanProvider')
  return ctx
}
