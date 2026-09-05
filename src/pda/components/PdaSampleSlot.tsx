import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PdaSampleSection } from '../../data/pdaSampleData'
import { PdaSamplePanel } from './PdaSamplePanel'

type SampleState = {
  section: PdaSampleSection
  onUse?: (value: string) => void
  defaultOpen?: boolean
} | null

type PdaSampleSlotContextValue = {
  sample: SampleState
  setSample: (state: SampleState) => void
}

const PdaSampleSlotContext = createContext<PdaSampleSlotContextValue | null>(null)

export function PdaSampleSlotProvider({ children }: { children: ReactNode }) {
  const [sample, setSample] = useState<SampleState>(null)
  const value = useMemo(() => ({ sample, setSample }), [sample])
  return <PdaSampleSlotContext.Provider value={value}>{children}</PdaSampleSlotContext.Provider>
}

export function PdaSampleSidebar() {
  const ctx = useContext(PdaSampleSlotContext)
  if (!ctx?.sample) return null
  const { section, onUse, defaultOpen } = ctx.sample
  return (
    <aside className="pda-sample-sidebar" aria-label="Data sample">
      <PdaSamplePanel section={section} onUse={onUse} defaultOpen={defaultOpen ?? true} />
    </aside>
  )
}

export function PdaWorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <PdaSampleSlotProvider>
      <div className="pda-workspace">
        {children}
        <PdaSampleSidebar />
      </div>
    </PdaSampleSlotProvider>
  )
}

export function usePdaSamplePanel(
  section: PdaSampleSection,
  onUse?: (value: string) => void,
  defaultOpen = true,
) {
  const ctx = useContext(PdaSampleSlotContext)
  const setSample = ctx?.setSample
  const onUseRef = useRef(onUse)
  onUseRef.current = onUse

  useEffect(() => {
    if (!setSample) return
    setSample({
      section,
      defaultOpen,
      onUse: (value) => onUseRef.current?.(value),
    })
    return () => setSample(null)
  }, [section, defaultOpen, setSample])
}
