/** Minimal Code 39 patterns (narrow=1 / wide=2). */
const CODE39: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  A: 'wnnnnwnnw',
  B: 'nnwnnwnnw',
  C: 'wnwnnwnnn',
  D: 'nnnnwwnnw',
  E: 'wnnnwwnnn',
  F: 'nnwnwwnnn',
  G: 'nnnnnwwnw',
  H: 'wnnnnwwnn',
  I: 'nnwnnwwnn',
  J: 'nnnnwwwnn',
  K: 'wnnnnnnww',
  L: 'nnwnnnnww',
  M: 'wnwnnnnwn',
  N: 'nnnnwnnww',
  O: 'wnnnwnnwn',
  P: 'nnwnwnnwn',
  Q: 'nnnnnnwww',
  R: 'wnnnnnwwn',
  S: 'nnwnnnwwn',
  T: 'nnnnwnwwn',
  U: 'wwnnnnnnw',
  V: 'nwwnnnnnw',
  W: 'wwwnnnnnn',
  X: 'nwnnwnnnw',
  Y: 'wwnnwnnnn',
  Z: 'nwwnwnnnn',
  '-': 'nwnnnnwnw',
  '.': 'wwnnnnwnn',
  ' ': 'nwwnnnwnn',
  '*': 'nwnnwnwnn',
  $: 'nwnwnwnnn',
  '/': 'nwnwnnnwn',
  '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn',
}

export function normalizeBarcodeValue(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '-')
}

export function buildCode39Svg(value: string, height = 72, barWidth = 1.6) {
  const raw = normalizeBarcodeValue(value)
  const text = `*${raw}*`
  const modules: { black: boolean; width: number }[] = []

  for (let i = 0; i < text.length; i += 1) {
    const pattern = CODE39[text[i]] || CODE39['-']
    for (let j = 0; j < pattern.length; j += 1) {
      modules.push({ black: j % 2 === 0, width: pattern[j] === 'w' ? 2 : 1 })
    }
    if (i < text.length - 1) {
      modules.push({ black: false, width: 1 })
    }
  }

  const totalWidth = modules.reduce((sum, m) => sum + m.width * barWidth, 0)
  let x = 0
  const rects = modules
    .map((m) => {
      const rect = m.black
        ? `<rect x="${x}" y="0" width="${m.width * barWidth}" height="${height}" fill="#111"/>`
        : ''
      x += m.width * barWidth
      return rect
    })
    .join('')

  return {
    text: raw,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">${rects}</svg>`,
  }
}

type BarcodeLabelProps = {
  value: string
  subtitle?: string
  height?: number
  barWidth?: number
}

export function BarcodeLabel({
  value,
  subtitle,
  height = 72,
  barWidth = 1.6,
}: BarcodeLabelProps) {
  const { text, svg } = buildCode39Svg(value, height, barWidth)

  return (
    <div className="barcode-label">
      <div
        className="barcode-label-svg"
        dangerouslySetInnerHTML={{ __html: svg }}
        role="img"
        aria-label={`Barcode ${text}`}
      />
      <div className="barcode-label-code">{text}</div>
      {subtitle ? <div className="barcode-label-sub">{subtitle}</div> : null}
    </div>
  )
}
