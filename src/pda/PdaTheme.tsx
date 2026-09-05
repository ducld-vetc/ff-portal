import { ConfigProvider } from 'antd'
import type { ReactNode } from 'react'

const PDA_PRIMARY = '#1565C0'

export function PdaTheme({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: PDA_PRIMARY,
          colorInfo: PDA_PRIMARY,
          colorSuccess: '#2E7D32',
          colorWarning: '#EF6C00',
          colorError: '#C62828',
          fontFamily: "'Be Vietnam Pro', 'Fira Sans', sans-serif",
          borderRadius: 12,
          controlHeight: 44,
          controlHeightLG: 48,
        },
        components: {
          Button: { fontWeight: 600 },
          Input: { borderRadius: 12 },
          Select: { borderRadius: 12 },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
