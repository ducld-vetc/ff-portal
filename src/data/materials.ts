export type MaterialOwnerType = 'warehouse' | 'partner'

export type Material = {
  id: string
  ownerType: MaterialOwnerType
  partnerCode?: string
  partnerName?: string
  type: string
  name: string
  code: string
  lengthCm: number
  widthCm: number
  heightCm: number
  weightGram: number
}

export const materialTypes = [
  { value: 'CARTON', label: 'Thùng carton' },
  { value: 'BAG', label: 'Túi nilon' },
  { value: 'FILLER', label: 'Vật liệu chèn' },
  { value: 'LABEL', label: 'Nhãn / tem' },
  { value: 'OTHER', label: 'Khác' },
]

export const materialPartners = [
  { value: 'WKI', label: 'WKI - CÔNG TY TNHH WKI PACKAGING' },
  { value: 'NQA', label: 'NQA - HỘ KINH DOANH NGÔ QUỲNH ANH' },
  { value: 'AVI', label: 'AVI - CÔNG TY TNHH AVI LOGISTICS' },
  { value: 'HAC', label: 'HAC - CÔNG TY TNHH HAC RETAIL' },
  { value: 'EVC', label: 'EVC - EverCharge Retail' },
]

export const seedMaterials: Material[] = [
  {
    id: 'mat-1',
    ownerType: 'partner',
    partnerCode: 'WKI',
    partnerName: 'WKI - CÔNG TY TNHH WKI PACKAGING',
    type: 'CARTON',
    name: 'wki15x12x10',
    code: 'wki15x12x10',
    lengthCm: 15,
    widthCm: 12,
    heightCm: 10,
    weightGram: 85,
  },
  {
    id: 'mat-2',
    ownerType: 'partner',
    partnerCode: 'NQA',
    partnerName: 'NQA - HỘ KINH DOANH NGÔ QUỲNH ANH',
    type: 'CARTON',
    name: 'nqa20x15x12',
    code: 'nqa20x15x12',
    lengthCm: 20,
    widthCm: 15,
    heightCm: 12,
    weightGram: 120,
  },
  {
    id: 'mat-3',
    ownerType: 'partner',
    partnerCode: 'AVI',
    partnerName: 'AVI - CÔNG TY TNHH AVI LOGISTICS',
    type: 'BAG',
    name: 'avi-bag-m',
    code: 'AVI-BAG-M',
    lengthCm: 30,
    widthCm: 20,
    heightCm: 1,
    weightGram: 12,
  },
  {
    id: 'mat-4',
    ownerType: 'warehouse',
    type: 'FILLER',
    name: 'bubble-wrap-10m',
    code: 'BW-10M',
    lengthCm: 100,
    widthCm: 30,
    heightCm: 5,
    weightGram: 250,
  },
  {
    id: 'mat-5',
    ownerType: 'partner',
    partnerCode: 'HAC',
    partnerName: 'HAC - CÔNG TY TNHH HAC RETAIL',
    type: 'LABEL',
    name: 'hac-label-a6',
    code: 'HAC-LBL-A6',
    lengthCm: 15,
    widthCm: 10,
    heightCm: 0.1,
    weightGram: 3,
  },
  {
    id: 'mat-6',
    ownerType: 'partner',
    partnerCode: 'WKI',
    partnerName: 'WKI - CÔNG TY TNHH WKI PACKAGING',
    type: 'CARTON',
    name: 'wki25x20x15',
    code: 'wki25x20x15',
    lengthCm: 25,
    widthCm: 20,
    heightCm: 15,
    weightGram: 180,
  },
]

export function calcVolumeCm3(lengthCm: number, widthCm: number, heightCm: number) {
  return Math.round(lengthCm * widthCm * heightCm * 100) / 100
}

export const ownerTypeLabel: Record<MaterialOwnerType, string> = {
  warehouse: 'Kho',
  partner: 'Đối tác',
}
