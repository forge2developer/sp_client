import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "./layouts/plain-layout"
import DashboardLayout from "./layouts/sidebar-layout"
import LoginPage from "./pages/auth-page"
import DashboardPage from "./pages/Dashboard/dashboard-page"
import { InventoryHub } from "./pages/Inventory/inventory-hub"
import { InventoryListing } from "./pages/Inventory/inventory-listing"
import { AddInventory } from "./pages/Inventory/add-inventory"
import GeneralSettings from "./pages/Settings/GeneralSettings"
import ImportData from "./pages/Settings/ImportData"
import ManageUsers from "./pages/Settings/ManageUsers"
import { LeadList } from "./pages/Leads/LeadList"
import { AddLead } from "./pages/Leads/AddLead"
import { LeadDashboard } from "./pages/Leads/LeadDashboard"
import { ProjectShowcase } from "./pages/Inventory/project-showcase"
import Automation from "./pages/Tools/Automations/automation"
import Campaigns from "./pages/Tools/Automations/campaigns"
import CampaignBuilder from "./pages/Tools/Automations/campaignbuilder"
import LeadCapture from "./pages/Tools/Automations/leadcapture"
import LeadCaptureForm from "./pages/Tools/Automations/leadcaptureform"
import ThirdParty from "./pages/Tools/Third Party/thirdparty"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (Outside Sidebar) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LoginPage />} />
        </Route>

        {/* Dashboard Routes (Inside Sidebar) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        
        {/* Inventory Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/inventory_hub" element={<InventoryHub />} />
          <Route path="/inventory_listing" element={<InventoryListing />} />
          <Route path="/add_inventory" element={<AddInventory />} />
          <Route path="/project_showcase/:id" element={<ProjectShowcase />} />
        </Route>
        {/*Tools Routes*/}
        <Route element={<DashboardLayout />}>
          <Route path="/automation" element={<Automation />} />
          <Route path="/automation/campaigns" element={<Campaigns />} />
          <Route path="/automation/campaigns/builder" element={<CampaignBuilder />} />
          <Route path="/automation/campaigns/builder/:id" element={<CampaignBuilder />} />
          <Route path="/automation/leadcapture" element={<LeadCapture />} />
          <Route path="/automation/leadcapture/form" element={<LeadCaptureForm />} />
          <Route path="/third_party_integrations" element={<ThirdParty />} />
        </Route>

        {/* Lead Management Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/lead-list" element={<LeadList />} />
          <Route path="/add-lead" element={<AddLead />} />
          <Route path="/lead-dashboard/:id" element={<LeadDashboard />} />
        </Route>
        {/*Setting Routes*/}
        <Route element={<DashboardLayout />}>
          <Route path="/general_settings" element={<GeneralSettings />} />
          <Route path="/manage_users" element={<ManageUsers />} />
          <Route path="/import_data" element={<ImportData />} />
        </Route>

        {/* Lead Management Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/lead-list" element={<LeadList />} />
          <Route path="/add-lead" element={<AddLead />} />
          <Route path="/lead-dashboard/:id" element={<LeadDashboard />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
