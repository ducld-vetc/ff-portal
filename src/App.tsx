import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RoleGroupsProvider } from './data/RoleGroupsContext'
import AppLayout, { PublicOnly } from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import CustomersPage from './pages/CustomersPage'
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
import './styles.css'

export default function App() {
  return (
    <AuthProvider>
      <RoleGroupsProvider>
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
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="customers" element={<CustomersPage />} />
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
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </RoleGroupsProvider>
    </AuthProvider>
  )
}
