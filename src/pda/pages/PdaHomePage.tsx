import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { pdaSamples } from '../../data/pdaSampleData'
import { usePdaSamplePanel } from '../components/PdaSampleSlot'
import { PdaFunctionTile } from '../components/PdaFunctionTile'
import { pdaHomeTiles, type PdaHomeTile } from '../pdaModules'
import { usePda } from '../PdaContext'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const a = parts[0]?.[0] ?? 'O'
  const b = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (a + b).toUpperCase()
}

export default function PdaHomePage() {
  const { auth } = usePda()
  const navigate = useNavigate()
  const [sheet, setSheet] = useState<PdaHomeTile | null>(null)

  usePdaSamplePanel(pdaSamples.home, undefined, false)
  if (!auth) return null

  const open = (tile: PdaHomeTile) => {
    if (tile.subOptions?.length) {
      setSheet(tile)
      return
    }
    if (tile.to) navigate(tile.to)
  }

  const sheetHost = typeof document !== 'undefined' ? document.querySelector('.pda-app') : null

  return (
    <div>
      <div className="pda-home-user">
        <div className="pda-home-avatar">{initials(auth.operatorName)}</div>
        <div>
          <strong>{auth.operatorName}</strong>
          <span>{auth.warehouseName}</span>
        </div>
      </div>

      <div className="pda-tile-grid">
        {pdaHomeTiles.map((tile) => (
          <PdaFunctionTile
            key={tile.id}
            title={tile.title}
            icon={tile.icon}
            color={tile.color}
            onClick={() => open(tile)}
          />
        ))}
      </div>

      {sheet && sheetHost
        ? createPortal(
            <div
              className="pda-sheet-mask"
              role="presentation"
              onClick={() => setSheet(null)}
            >
              <div
                className="pda-sheet"
                role="dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pda-sheet-handle" />
                <div className="pda-sheet-title">{sheet.title}</div>
                {sheet.subOptions?.map((opt) => (
                  <button
                    key={opt.to}
                    type="button"
                    className="pda-sheet-opt"
                    onClick={() => {
                      setSheet(null)
                      navigate(opt.to)
                    }}
                  >
                    <strong>{opt.title}</strong>
                    <span>{opt.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>,
            sheetHost,
          )
        : null}
    </div>
  )
}
