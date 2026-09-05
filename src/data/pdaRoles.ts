/**
 * PDA role presets — map menu modules to permission keys.
 * Used by Role Groups and PDA app menu filtering.
 */
import { collectPermissionKeys, permissionTree, type PermissionNode } from './permissions'

export type PdaRoleCode =
  | 'PDA_RECEIVER'
  | 'PDA_PICKER'
  | 'PDA_PACKER'
  | 'PDA_HANDOVER'
  | 'PDA_COUNTER'
  | 'PDA_SUPERVISOR'

export type PdaRolePreset = {
  code: PdaRoleCode
  name: string
  description: string
  permissionKeys: string[]
  /** PDA home menu module ids */
  menuModules: string[]
}

const PDA_INBOUND_KEYS = [
  'pda.auth.login',
  'pda.session.warehouse',
  'pda.menu.inbound',
  'pda.inbound.checkin',
  'pda.inbound.receive',
  'pda.inbound.complete',
  'pda.inbound.putaway',
  'pda.inquiry.view',
]

const PDA_PICK_KEYS = [
  'pda.auth.login',
  'pda.session.warehouse',
  'pda.menu.outbound',
  'pda.pick.list',
  'pda.pick.execute',
  'pda.pick.complete',
  'pda.inquiry.view',
]

const PDA_PACK_KEYS = [
  'pda.auth.login',
  'pda.session.warehouse',
  'pda.menu.outbound',
  'pda.pack.execute',
  'pda.pack.print_label',
  'pda.inquiry.view',
]

const PDA_HANDOVER_KEYS = [
  'pda.auth.login',
  'pda.session.warehouse',
  'pda.menu.shipping',
  'pda.handover.execute',
  'pda.handover.confirm',
  'pda.inquiry.view',
]

const PDA_COUNTER_KEYS = [
  'pda.auth.login',
  'pda.session.warehouse',
  'pda.menu.inventory',
  'pda.stocktake.execute',
  'pda.inquiry.view',
]

/** All pda.* keys for supervisor / warehouse lead */
export function collectPdaPermissionKeys(nodes: PermissionNode[]): string[] {
  const pdaRoot = nodes.find((n) => n.key === 'pda')
  if (!pdaRoot) return []
  return collectPermissionKeys([pdaRoot])
}

export const pdaRolePresets: PdaRolePreset[] = [
  {
    code: 'PDA_RECEIVER',
    name: 'PDA — Nhân viên nhận hàng',
    description: 'Check-in IR, receiving, putaway trên PDA.',
    permissionKeys: PDA_INBOUND_KEYS,
    menuModules: ['inbound', 'inquiry'],
  },
  {
    code: 'PDA_PICKER',
    name: 'PDA — Picker',
    description: 'Lấy hàng directed pick, gán tote, hoàn tất phiên.',
    permissionKeys: PDA_PICK_KEYS,
    menuModules: ['outbound-pick', 'inquiry'],
  },
  {
    code: 'PDA_PACKER',
    name: 'PDA — Packer',
    description: 'Đóng gói theo tote, tạo kiện, in nhãn VC.',
    permissionKeys: PDA_PACK_KEYS,
    menuModules: ['outbound-pack', 'inquiry'],
  },
  {
    code: 'PDA_HANDOVER',
    name: 'PDA — Bàn giao ĐVVC',
    description: 'Quét kiện vào phiên giao, xác nhận bàn giao.',
    permissionKeys: PDA_HANDOVER_KEYS,
    menuModules: ['shipping', 'inquiry'],
  },
  {
    code: 'PDA_COUNTER',
    name: 'PDA — Kiểm kê',
    description: 'Kiểm đếm / cycle count trên PDA (Phase 2 execution).',
    permissionKeys: PDA_COUNTER_KEYS,
    menuModules: ['inventory-count', 'inquiry'],
  },
  {
    code: 'PDA_SUPERVISOR',
    name: 'PDA — Supervisor kho',
    description: 'Toàn quyền PDA Phase 1 + inquiry.',
    permissionKeys: collectPdaPermissionKeys(permissionTree),
    menuModules: ['inbound', 'outbound-pick', 'outbound-pack', 'shipping', 'inventory', 'inquiry'],
  },
]

export function getPdaRolePreset(code: PdaRoleCode, allPdaKeys: string[]): PdaRolePreset | undefined {
  const preset = pdaRolePresets.find((p) => p.code === code)
  if (!preset) return undefined
  if (code === 'PDA_SUPERVISOR') {
    return { ...preset, permissionKeys: allPdaKeys }
  }
  return preset
}

export function pdaMenuForRole(roleCode: PdaRoleCode): string[] {
  return pdaRolePresets.find((p) => p.code === roleCode)?.menuModules ?? []
}
