import type { AreaPoint, DonutSegment } from '../../data/dashboardFulfillment'

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[]
  centerLabel: string
  centerValue: string
}) {
  const cx = 100
  const cy = 100
  const radius = 72
  const stroke = 26
  let cursor = 0

  const arcs = segments.map((segment, index) => {
    const start = cursor
    const sweep = (segment.percent / 100) * 360
    const end = start + sweep
    cursor = end
    return (
      <path
        key={`${segment.label}-${index}`}
        d={describeArc(cx, cy, radius, start, end - 0.2)}
        fill="none"
        stroke={segment.color}
        strokeWidth={stroke}
        strokeLinecap="butt"
      />
    )
  })

  return (
    <div className="fd-donut-wrap">
      <svg viewBox="0 0 200 200" className="fd-donut-chart" aria-hidden>
        {arcs}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fd-donut-center-value">
          {centerValue}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fd-donut-center-label">
          {centerLabel}
        </text>
      </svg>
      <div className="fd-donut-legend">
        {segments.map((segment) => (
          <div key={segment.label} className="fd-legend-item">
            <span className="fd-legend-dot" style={{ background: segment.color }} />
            <span className="fd-legend-text">
              {segment.label} ({segment.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GaugeChart({
  percent,
  color,
  label,
}: {
  percent: number
  color: string
  label: string
}) {
  const cx = 120
  const cy = 126
  const r = 84
  const clamped = Math.max(0, Math.min(100, percent))
  const left = { x: cx - r, y: cy }
  const right = { x: cx + r, y: cy }
  const angle = Math.PI - (clamped / 100) * Math.PI
  const current = { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) }
  const trackPath = `M ${left.x} ${left.y} A ${r} ${r} 0 0 1 ${right.x} ${right.y}`
  const valuePath = `M ${left.x} ${left.y} A ${r} ${r} 0 0 1 ${current.x} ${current.y}`

  return (
    <div className="fd-gauge-wrap">
      <svg viewBox="0 0 240 160" className="fd-gauge-chart" aria-hidden>
        <path
          d={trackPath}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={valuePath}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <text x={cx} y={cy - 10} textAnchor="middle" className="fd-gauge-value">
          {clamped}%
        </text>
      </svg>
      <div className="fd-gauge-caption">{label}</div>
    </div>
  )
}

function buildAreaPath(points: AreaPoint[], width: number, height: number, pad = 24) {
  const max = Math.max(...points.map((p) => p.value), 1)
  const step = (width - pad * 2) / Math.max(points.length - 1, 1)

  const coords = points.map((point, index) => ({
    x: pad + index * step,
    y: height - pad - (point.value / max) * (height - pad * 2),
  }))

  const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${coords[coords.length - 1].x} ${height - pad} L ${coords[0].x} ${height - pad} Z`
  return { area, coords, max }
}

export function AreaTrendChart({
  title,
  yLabel,
  xLabel,
  points,
  color,
}: {
  title: string
  yLabel: string
  xLabel: string
  points: AreaPoint[]
  color: string
}) {
  const width = 520
  const height = 220
  const { area, coords, max } = buildAreaPath(points, width, height)
  const gradientId = `area-${title.replace(/\s+/g, '-')}`

  return (
    <div className="fd-area-card">
      <div className="fd-panel-title">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="fd-area-chart" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = 24 + ratio * (height - 48)
          return (
            <line
              key={ratio}
              x1={24}
              y1={y}
              x2={width - 24}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          )
        })}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth={2.5} />
        {coords.map((p, i) => (
          <text key={points[i].label} x={p.x} y={height - 6} textAnchor="middle" className="fd-area-axis">
            {points[i].label}
          </text>
        ))}
        <text x={8} y={18} className="fd-area-axis">
          {Math.round(max).toLocaleString('vi-VN')}
        </text>
        <text x={8} y={height - 8} className="fd-area-axis-muted">
          {yLabel}
        </text>
        <text x={width - 8} y={height - 8} textAnchor="end" className="fd-area-axis-muted">
          {xLabel}
        </text>
      </svg>
    </div>
  )
}
