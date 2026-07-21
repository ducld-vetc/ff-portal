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
import MaterialsPage from './pages/MaterialsPage'
import StorageDevicesPage from './pages/StorageDevicesPage'
import StaffPage from './pages/StaffPage'
import RoleGroupsPage from './pages/RoleGroupsPage'
import RoleGroupFormPage from './pages/RoleGroupFormPage'
import PickupAssignmentsPage from './pages/PickupAssignmentsPage'
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
import ClientInboundListPage from './pages/ClientInboundListPage'
import ClientInboundCreatePage from './pages/ClientInboundCreatePage'
import ClientInboundDetailPage from './pages/ClientInboundDetailPage'
import ClientOutboundListPage from './pages/ClientOutboundListPage'
import ClientOutboundCreatePage from './pages/ClientOutboundCreatePage'
import ClientOutboundDetailPage from './pages/ClientOutboundDetailPage'
import ClientWaybillListPage from './pages/ClientWaybillListPage'
import ClientWaybillCreatePage from './pages/ClientWaybillCreatePage'
import ClientWaybillDetailPage from './pages/ClientWaybillDetailPage'
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
                <Route path="staff" element={<Navigate to="/staff/users" replace />} />
                <Route path="staff/users" element={<StaffPage />} />
                <Route path="staff/roles" element={<RoleGroupsPage />} />
                <Route path="staff/roles/:id" element={<RoleGroupFormPage />} />
                <Route path="pickup-assignments" element={<PickupAssignmentsPage />} />
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
