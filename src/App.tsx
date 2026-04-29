import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "./layouts/plain-layout"
import DashboardLayout from "./layouts/sidebar-layout"
import LoginPage from "./pages/Auth/auth-page"

import DashboardPage from "./pages/Dashboard/dashboard-page"
import { InventoryListing } from "./pages/Inventory/inventory-listing"
import { AddInventory } from "./pages/Inventory/add-inventory"
import GeneralSettings from "./pages/Settings/GeneralSettings"
import ImportData from "./pages/Settings/ImportData"
import ManageUsers from "./pages/Settings/ManageUsers"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (Outside Sidebar) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot_password" element={<LoginPage />} />
        </Route>

        {/* Dashboard Routes (Inside Sidebar) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        {/* Inventory Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/inventory_listing" element={<InventoryListing />} />
          <Route path="/add_inventory" element={<AddInventory />} />
        </Route>
        {/*Setting Routes*/}
        <Route element={<DashboardLayout />}>
          <Route path="/general_settings" element={<GeneralSettings />} />
          <Route path="/manage_users" element={<ManageUsers />} />
          <Route path="/import_data" element={<ImportData />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
