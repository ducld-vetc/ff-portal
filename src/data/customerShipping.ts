import type { CustomerCarrierConfig } from '../components/CustomerShippingConfig'

const STORAGE_KEY = 'ffm-customer-shipping'

const defaults: Record<string, CustomerCarrierConfig> = {
  '1': { carrierCodes: ['GHN', 'JTEVN', 'SPX'], accountIds: ['acc-1', 'acc-2', 'acc-4'] },
  '2': { carrierCodes: ['GHTK'], accountIds: ['acc-5'] },
  '3': { carrierCodes: [], accountIds: [] },
}

function load(): Record<string, CustomerCarrierConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...(JSON.parse(raw) as Record<string, CustomerCarrierConfig>) }
  } catch {
    return { ...defaults }
  }
}

export function getCustomerShipping(customerId: string): CustomerCarrierConfig {
  const map = load()
  return map[customerId] || { carrierCodes: [], accountIds: [] }
}

export function setCustomerShipping(customerId: string, value: CustomerCarrierConfig) {
  const map = load()
  map[customerId] = value
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}
