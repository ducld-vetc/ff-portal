import dayjs from 'dayjs'
import type { CarrierHandoverSession } from './carrierHandovers'
import { handoverSessionTypeLabel } from './carrierHandovers'

const WAREHOUSE_PRINT = {
  hotline: '0969300943',
  name: 'Kho Hải Bối - Đông Anh',
  address: 'xóm 4 thôn Hải Bối, Xã Hải Bối, Huyện Đông Anh, Thành phố Hà Nội, Việt Nam',
}

/** In biên bản bàn giao theo template_ob_file.pdf */
export function printHandoverSession(session: CarrierHandoverSession) {
  const isReceipt = session.sessionType === 'receipt'
  const title = `BIÊN BẢN BÀN GIAO - ${handoverSessionTypeLabel[session.sessionType].toUpperCase()}`
  const handedAt = dayjs().format('DD/MM/YYYY HH:mm:ss')
  const totalPackages = session.packages.length
  const totalProducts = session.packages.reduce((s, p) => s + p.productQty, 0)

  const rowsHtml = session.packages
    .map(
      (p, i) => `
      <tr>
        <td class="c">${i + 1}</td>
        <td>${escapeHtml(p.outboundCode)}</td>
        <td>${escapeHtml(p.partnerOrCode)}</td>
        <td>${escapeHtml(p.trackingCode)}</td>
        <td>${escapeHtml(p.packageCode)}</td>
        <td class="c">${p.productQty}</td>
        ${
          isReceipt
            ? `<td>${escapeHtml(p.returnType || '—')}</td><td>${escapeHtml(p.condition || '—')}</td>`
            : ''
        }
      </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} · ${escapeHtml(session.code)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; margin: 0; }
    .head { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
    .head-left { max-width: 62%; }
    h1 { font-size: 18px; margin: 0 0 6px; text-transform: uppercase; }
    .meta { line-height: 1.45; color: #222; }
    .code-box { border: 1px solid #333; padding: 8px 12px; min-width: 160px; text-align: center; }
    .code-box .lbl { font-size: 11px; color: #555; }
    .code-box .val { font-size: 16px; font-weight: 700; margin-top: 4px; letter-spacing: 0.02em; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; }
    th { background: #f3f3f3; font-weight: 700; text-align: center; }
    td.c, th.c { text-align: center; }
    tfoot td { font-weight: 700; }
    .signs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 36px; text-align: center; }
    .signs .box { min-height: 90px; }
    .signs .role { font-weight: 700; margin-bottom: 4px; }
    .signs .hint { font-size: 11px; color: #555; }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:12px">
    <button onclick="window.print()">In</button>
    <button onclick="window.close()">Đóng</button>
  </div>
  <div class="head">
    <div class="head-left">
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        Hotline: ${WAREHOUSE_PRINT.hotline} ${escapeHtml(WAREHOUSE_PRINT.name)}<br/>
        ${escapeHtml(WAREHOUSE_PRINT.address)}<br/><br/>
        <strong>Bên bàn giao</strong><br/>
        Đối tác vận chuyển: ${escapeHtml(session.carrierCode)} - ${escapeHtml(session.carrierName)}<br/>
        Ngày bàn giao: ${handedAt}<br/>
        Ghi chú: ${escapeHtml(session.note || '')}
      </div>
    </div>
    <div class="code-box">
      <div class="lbl">Phiên bàn giao</div>
      <div class="val">${escapeHtml(session.code)}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th class="c">STT</th>
        <th>Mã yêu cầu xuất kho</th>
        <th>Mã yêu cầu xuất kho đối tác</th>
        <th>Mã vận đơn</th>
        <th>Mã kiện hàng</th>
        <th class="c">SL sản phẩm</th>
        ${isReceipt ? '<th>Loại trả hàng</th><th>Tình trạng</th>' : ''}
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="5"><strong>Tổng</strong></td>
        <td class="c">${totalPackages}</td>
        ${isReceipt ? `<td></td><td class="c">${totalProducts}</td>` : `<td class="c">${totalProducts}</td>`}
      </tr>
    </tfoot>
  </table>
  <div class="signs">
    <div class="box">
      <div class="role">Người bàn giao</div>
      <div class="hint">(Ký, ghi rõ họ tên)</div>
    </div>
    <div class="box">
      <div class="role">Bảo vệ</div>
      <div class="hint">(Ký, ghi rõ họ tên)</div>
    </div>
    <div class="box">
      <div class="role">Người nhận bàn giao</div>
      <div class="hint">(Ký, ghi rõ họ tên)</div>
    </div>
  </div>
</body>
</html>`

  const w = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  setTimeout(() => w.print(), 250)
  return true
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
