import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RoleGroupsProvider } from './data/RoleGroupsContext'
import { PortalProvider } from './portal/PortalContext'
import AppLayout, { PublicOnly } from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientHomePage from './pages/ClientHomePage'
import OnboardingPage from './pages/OnboardingPage'
import CustomersPage from './pages/CustomersPage'
import StoresPage from './pages/StoresPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import WarehousesPage from './pages/WarehousesPage'
import WarehouseLocationsPage from './pages/WarehouseLocationsPage'
import MaterialsPage from './pages/MaterialsPage'
import StorageDevicesPage from './pages/StorageDevicesPage'
import StaffPage from './pages/StaffPage'
import RoleGroupsPage from './pages/RoleGroupsPage'
import RoleGroupFormPage from './pages/RoleGroupFormPage'
import PickupAssignmentsPage from './pages/PickupAssignmentsPage'
import PickupWaveDetailPage from './pages/PickupWaveDetailPage'
import CatalogPage from './pages/CatalogPage'
import ProductLocationsPage from './pages/ProductLocationsPage'
import ProductLocationHistoryPage from './pages/ProductLocationHistoryPage'
import CarriersPage from './pages/CarriersPage'
import CarrierAccountsPage from './pages/CarrierAccountsPage'
import ShippingPackagesPage from './pages/ShippingPackagesPage'
import ReportsPage from './pages/ReportsPage'
import SystemPage from './pages/SystemPage'
import AuditPage from './pages/AuditPage'
import StoreDetailPage from './pages/StoreDetailPage'
import AdminInboundListPage from './pages/AdminInboundListPage'
import AdminInboundDetailPage from './pages/AdminInboundDetailPage'
import AdminInboundReturnCreatePage from './pages/AdminInboundReturnCreatePage'
import AdminOutboundListPage from './pages/AdminOutboundListPage'
import AdminOutboundDetailPage from './pages/AdminOutboundDetailPage'
import AdminPickingListPage from './pages/AdminPickingListPage'
import AdminPickingDetailPage from './pages/AdminPickingDetailPage'
import AdminPickingCreatePage from './pages/AdminPickingCreatePage'
import AdminInventoryAdjustListPage from './pages/AdminInventoryAdjustListPage'
import AdminInventoryAdjustCreatePage from './pages/AdminInventoryAdjustCreatePage'
import AdminInventoryAdjustDetailPage from './pages/AdminInventoryAdjustDetailPage'
import AdminCarrierHandoverListPage from './pages/AdminCarrierHandoverListPage'
import AdminCarrierHandoverCreatePage from './pages/AdminCarrierHandoverCreatePage'
import AdminCarrierHandoverDetailPage from './pages/AdminCarrierHandoverDetailPage'
import AdminContainerDevicesPage from './pages/AdminContainerDevicesPage'
import AdminIssuesPage from './pages/AdminIssuesPage'
import AdminStocktakeListPage from './pages/AdminStocktakeListPage'
import AdminStocktakeDailyCreatePage from './pages/AdminStocktakeDailyCreatePage'
import AdminStocktakeSkuBinCreatePage from './pages/AdminStocktakeSkuBinCreatePage'
import AdminStocktakeDetailPage from './pages/AdminStocktakeDetailPage'
import {
  AdminOutboundUpdatePage,
  AdminPackingByLabelPage,
  AdminPackingPage,
  AdminPickingB2bPage,
  AdminPrintLabelsPage,
} from './pages/AdminOpsPages'
import ClientInboundListPage from './pages/ClientInboundListPage'
import ClientInboundCreatePage from './pages/ClientInboundCreatePage'
import ClientInboundDetailPage from './pages/ClientInboundDetailPage'
import ClientOutboundListPage from './pages/ClientOutboundListPage'
import ClientOutboundCreatePage from './pages/ClientOutboundCreatePage'
import ClientOutboundDetailPage from './pages/ClientOutboundDetailPage'
import ClientWaybillListPage from './pages/ClientWaybillListPage'
import ClientWaybillCreatePage from './pages/ClientWaybillCreatePage'
import ClientWaybillDetailPage from './pages/ClientWaybillDetailPage'
import ClientMaterialConsumptionPage from './pages/ClientMaterialConsumptionPage'
import ClientGoodsDamagePage from './pages/ClientGoodsDamagePage'
import {
  ClientCategoriesPage,
  ClientCodPage,
  ClientDefaultConditionPage,
  ClientErrorOutboundPage,
  ClientStocktakePage,
  ClientUnitsPage,
} from './pages/ClientOperationsPages'
import './styles.css'

export default function App() {
  return (
    <AuthProvider>
      <RoleGroupsProvider>
        <PortalProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicOnly>
                    <LoginPage />
                  </PublicOnly>
                }
              />
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Admin / nội bộ */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="onboarding" element={<OnboardingPage />} />
                <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/stores" element={<StoresPage />} />
              <Route path="customers/stores/:id" element={<StoreDetailPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="warehouses" element={<WarehousesPage />} />
                <Route path="warehouses/materials" element={<MaterialsPage />} />
                <Route path="warehouses/storage-devices" element={<StorageDevicesPage />} />
                <Route path="warehouses/:id/locations" element={<WarehouseLocationsPage />} />
                <Route path="staff" element={<Navigate to="/staff/users" replace />} />
                <Route path="staff/users" element={<StaffPage />} />
                <Route path="staff/roles" element={<RoleGroupsPage />} />
                <Route path="staff/roles/:id" element={<RoleGroupFormPage />} />
                <Route path="pickup-assignments" element={<PickupAssignmentsPage />} />
                <Route path="pickup-assignments/:id" element={<PickupWaveDetailPage />} />

                {/* Vận hành kho (admin) */}
                <Route path="operations/inbound" element={<AdminInboundListPage />} />
                <Route path="operations/inbound/return" element={<AdminInboundReturnCreatePage />} />
                <Route path="operations/inbound/:id" element={<AdminInboundDetailPage />} />
                <Route path="operations/outbound" element={<AdminOutboundListPage />} />
                <Route path="operations/outbound/:id" element={<AdminOutboundDetailPage />} />
                <Route path="operations/picking" element={<AdminPickingListPage />} />
                <Route path="operations/picking/create" element={<AdminPickingCreatePage />} />
                <Route path="operations/picking/:id" element={<AdminPickingDetailPage />} />
                <Route path="operations/picking-b2b" element={<AdminPickingB2bPage />} />
                <Route path="operations/packing" element={<AdminPackingPage />} />
                <Route path="operations/packing-by-label" element={<AdminPackingByLabelPage />} />
                <Route path="operations/inventory-adjust" element={<AdminInventoryAdjustListPage />} />
                <Route
                  path="operations/inventory-adjust/increase"
                  element={<AdminInventoryAdjustCreatePage mode="increase" />}
                />
                <Route
                  path="operations/inventory-adjust/decrease"
                  element={<AdminInventoryAdjustCreatePage mode="decrease" />}
                />
                <Route
                  path="operations/inventory-adjust/:id"
                  element={<AdminInventoryAdjustDetailPage />}
                />
                <Route path="operations/carrier-handover" element={<AdminCarrierHandoverListPage />} />
                <Route
                  path="operations/carrier-handover/receipt"
                  element={<AdminCarrierHandoverCreatePage mode="receipt" />}
                />
                <Route
                  path="operations/carrier-handover/delivery"
                  element={<AdminCarrierHandoverCreatePage mode="delivery" />}
                />
                <Route
                  path="operations/carrier-handover/:id"
                  element={<AdminCarrierHandoverDetailPage />}
                />
                <Route path="operations/outbound-update" element={<AdminOutboundUpdatePage />} />
                <Route path="operations/issues" element={<AdminIssuesPage />} />
                <Route path="operations/print-labels" element={<AdminPrintLabelsPage />} />
                <Route path="operations/container-devices" element={<AdminContainerDevicesPage />} />
                <Route path="operations/stocktake" element={<AdminStocktakeListPage />} />
                <Route
                  path="operations/stocktake/create-daily"
                  element={<AdminStocktakeDailyCreatePage />}
                />
                <Route
                  path="operations/stocktake/create-sku-bin"
                  element={<AdminStocktakeSkuBinCreatePage />}
                />
                <Route path="operations/stocktake/:id" element={<AdminStocktakeDetailPage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="products/locations" element={<ProductLocationsPage />} />
                <Route path="products/location-history" element={<ProductLocationHistoryPage />} />
                <Route path="carriers" element={<CarriersPage />} />
                <Route path="carriers/accounts" element={<CarrierAccountsPage />} />
                <Route path="carriers/packages" element={<ShippingPackagesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="system" element={<SystemPage />} />
                <Route path="audit" element={<AuditPage />} />

                {/* Khách hàng / đối tác */}
                <Route path="client" element={<ClientHomePage />} />
                <Route path="client/dashboard" element={<DashboardPage />} />
                <Route path="client/stores" element={<StoresPage />} />
                <Route path="client/stores/:id" element={<StoreDetailPage />} />
                <Route path="client/catalog" element={<CatalogPage />} />
                <Route path="client/products/locations" element={<ProductLocationsPage />} />
                <Route
                  path="client/products/location-history"
                  element={<ProductLocationHistoryPage />}
                />
                <Route path="client/products/categories" element={<ClientCategoriesPage />} />
                <Route path="client/products/units" element={<ClientUnitsPage />} />
                <Route path="client/operations/inbound" element={<ClientInboundListPage />} />
                <Route
                  path="client/operations/inbound/create"
                  element={<ClientInboundCreatePage />}
                />
                <Route
                  path="client/operations/inbound/:id"
                  element={<ClientInboundDetailPage />}
                />
                <Route path="client/operations/outbound" element={<ClientOutboundListPage />} />
                <Route
                  path="client/operations/outbound/create"
                  element={<ClientOutboundCreatePage />}
                />
                <Route
                  path="client/operations/outbound/:id"
                  element={<ClientOutboundDetailPage />}
                />
                <Route path="client/operations/waybills" element={<ClientWaybillListPage />} />
                <Route
                  path="client/operations/waybills/create"
                  element={<ClientWaybillCreatePage />}
                />
                <Route
                  path="client/operations/waybills/:id"
                  element={<ClientWaybillDetailPage />}
                />
                <Route path="client/operations/stocktake" element={<ClientStocktakePage />} />
                <Route
                  path="client/operations/error-outbound"
                  element={<ClientErrorOutboundPage />}
                />
                <Route path="client/channel-conditions" element={<ClientDefaultConditionPage />} />
                <Route path="client/cod" element={<ClientCodPage />} />
                <Route
                  path="client/summaries/materials"
                  element={<ClientMaterialConsumptionPage />}
                />
                <Route path="client/summaries/goods-damage" element={<ClientGoodsDamagePage />} />
                <Route path="client/carriers/accounts" element={<CarrierAccountsPage />} />
                <Route path="client/carriers/packages" element={<ShippingPackagesPage />} />
                <Route path="client/reports" element={<ReportsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </PortalProvider>
      </RoleGroupsProvider>
    </AuthProvider>
  )
}
