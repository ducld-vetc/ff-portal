/**
 * Sample scan codes for PDA UI testing — shown on each screen.
 */
export type PdaSampleItem = {
  label: string
  value: string
  note?: string
}

export type PdaSampleSection = {
  title: string
  hint?: string
  items: PdaSampleItem[]
}

export const pdaSamples = {
  login: {
    title: 'Data sample · Đăng nhập',
    hint: 'Username demo · mật khẩu 1234. Kho KBL khớp IR nhận hàng.',
    items: [
      { label: 'Username (full menu)', value: 'ops', note: 'Supervisor' },
      { label: 'Password', value: '1234', note: 'Mọi tài khoản demo' },
      { label: 'Kho Check-in IR', value: 'KBL', note: 'Kho Bella Đà Lạt' },
    ],
  },
  checkIn: {
    title: 'Data sample · Check-in IR',
    hint: 'Chọn kho KBL trước. Chỉ IR status=Mới mới check-in được.',
    items: [
      { label: 'Mã IR', value: 'IRDDBQUB8864', note: 'status=Mới · KBL' },
      { label: 'Mã IR đối tác', value: '24725858', note: 'Cùng phiếu IRDDBQUB8864' },
      { label: 'IR (không check-in)', value: 'IRHCMQ7A1021', note: 'Đã processing · WH-HCM-01' },
      { label: 'IR (đã xong)', value: 'IRHN01B7740', note: 'status=received' },
    ],
  },
  receiving: {
    title: 'Data sample · Nhận hàng',
    hint: 'Sau check-in IRDDBQUB8864 — quét SKU thuộc phiếu.',
    items: [
      { label: 'SKU 1', value: '2304101', note: 'Đầm Black · SL khai báo 100' },
      { label: 'SKU 2', value: '2304102', note: 'Đầm maxi · SL khai báo 100' },
      { label: 'SKU đối tác 1', value: 'SMCRD-B', note: 'Cùng dòng 2304101' },
      { label: 'SKU đối tác 2', value: 'SMFLW-M', note: 'Cùng dòng 2304102' },
    ],
  },
  putaway: {
    title: 'Data sample · Lưu kho',
    hint: 'Hoàn tất IR trước → task xuất hiện. Quét bin rồi SKU.',
    items: [
      { label: 'Bin gợi ý (demo)', value: 'A-01-01-01', note: 'Task dòng 1 thường gợi ý bin này' },
      { label: 'Bin gợi ý 2', value: 'A-01-02-01', note: 'Task dòng 2' },
      { label: 'SKU (sau IR mẫu)', value: '2304101', note: 'Khớp task sau complete IR' },
      { label: 'SKU 2', value: '2304102', note: 'Khớp task dòng 2' },
    ],
  },
  pick: {
    title: 'Data sample · Lấy hàng',
    hint: 'Tải pick list → bắt đầu. Quét Tote → Bin → SKU (đúng thứ tự).',
    items: [
      { label: 'Pick list demo', value: 'PL260725PDA_DEMO_001', note: 'ready · chưa gán · 2 dòng' },
      { label: 'Tote', value: 'RNN.052', note: 'Gán thiết bị chứa' },
      { label: 'Bin dòng 1', value: 'R4.A1.T1.002', note: 'SKU 292490068011' },
      { label: 'SKU dòng 1', value: '292490068011', note: 'Lotion · SL 1' },
      { label: 'Bin dòng 2', value: 'A-01-02-03', note: 'SKU-CHARGER-20W' },
      { label: 'SKU dòng 2', value: 'SKU-CHARGER-20W', note: 'Sạc 20W · SL 1' },
    ],
  },
  pack: {
    title: 'Data sample · Đóng gói',
    hint: 'Quét tote theo loại DSLH. Sau đó quét SKU trong tote.',
    items: [
      { label: 'PTO', value: 'TOTE-PTO-01', note: '1 đơn · lotion + sạc' },
      { label: 'MIO', value: 'TOTE-MIO-01', note: '1 đơn nhiều SKU' },
      { label: 'PTS', value: 'TOTE-PTS-01', note: '1 đơn đã sort' },
      { label: 'SIO', value: 'TOTE-SIO-01', note: 'Nhiều đơn 1 SP' },
      { label: 'SSO', value: 'TOTE-SSO-01', note: 'Cùng SKU, SL khác' },
      { label: 'SMO', value: 'TOTE-SMO-01', note: 'Pattern 1 sạc + 1 cáp' },
      { label: 'SKU sạc', value: 'SKU-CHARGER-20W', note: 'Dùng sau khi vào phiên' },
      { label: 'SKU cáp', value: 'SKU-CABLE-C-C-1M', note: 'SMO / MIO / PTS' },
    ],
  },
  handover: {
    title: 'Data sample · Bàn giao 3PL',
    hint: 'Tạo phiên giao/nhận → quét một trong các mã dưới. OR ORAZB6FB5XRW785 đã hủy (bị từ chối).',
    items: [
      { label: 'Mã kiện', value: 'PGHACWBMUP269170001', note: 'ORHACWBMUP26917' },
      { label: 'Vận đơn', value: '802789820795', note: 'Cùng kiện trên' },
      { label: 'Mã OR', value: 'ORHACWBMUP26917', note: 'Resolve → kiện' },
      { label: 'Kiện 2', value: 'PGORHN01C88300001', note: 'tracking GHN99881234' },
      { label: 'OR đã hủy', value: 'ORAZB6FB5XRW785', note: 'Bị từ chối khi quét' },
    ],
  },
  inquiry: {
    title: 'Data sample · Tra cứu',
    hint: 'Quét SKU / bin / mã kiện (PG…).',
    items: [
      { label: 'SKU', value: 'SACCOC2', note: 'Nhiều vị trí + kiện' },
      { label: 'SKU 2', value: 'SKU-CHARGER-20W', note: 'Bin A-01-02-03' },
      { label: 'Vị trí', value: 'R5.II.T1.001', note: 'kind=location' },
      { label: 'Vị trí 2', value: 'A-01-02-03', note: 'Charger 20W' },
      { label: 'Kiện', value: 'PGHACW0ITXJB8760001', note: 'kind=package' },
    ],
  },
  home: {
    title: 'Data sample · Gợi ý luồng test',
    hint: 'Thứ tự end-to-end khớp APK.',
    items: [
      { label: '1. Nhận hàng IR', value: 'IRDDBQUB8864', note: 'Kho KBL' },
      { label: '2. Nhận SKU', value: '2304101', note: 'Rồi 2304102 → Hoàn tất' },
      { label: '3. Pick list', value: 'PL260725PDA_DEMO_001', note: 'Tote RNN.052' },
      { label: '4. Pack tote', value: 'TOTE-PTO-01', note: 'Hoặc TOTE-SIO-01 / SSO / SMO' },
      { label: '5. Handover 3PL', value: 'PGHACWBMUP269170001', note: 'Phiên giao GHN / Ninja Van' },
      { label: '6. Vị trí', value: 'SACCOC2', note: 'Tra cứu tồn' },
    ],
  },
} as const satisfies Record<string, PdaSampleSection>
