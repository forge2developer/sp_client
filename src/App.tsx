import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "./layouts/plain-layout"
import DashboardLayout from "./layouts/sidebar-layout"
import { LoginForm } from "./pages/Auth/auth-page"
import { FogotPasswordPage } from "./pages/Auth/forgot-password-form"
import DashboardPage from "./pages/Dashboard/dashboard-page"
import Admin_dashboard from "./pages/Dashboard/Admin_dashboard"
import { InventoryHub } from "./pages/Inventory/inventory-hub"
import { InventoryListing } from "./pages/Inventory/inventory-listing"
import { AddInventory } from "./pages/Inventory/add-inventory"
import { BookingFormPage } from "./pages/Inventory/booking-form"
import GeneralSettings from "./pages/Settings/GeneralSettings"
import ImportData from "./pages/Settings/ImportData"
import ManageUsers from "./pages/Settings/ManageUsers"
import {LeadList} from "./pages/Leads/LeadList"
import { AddLead } from "./pages/Leads/AddLead"
import { LeadHub } from "./pages/Leads/LeadHub"
import { LeadDashboard } from "./pages/Leads/LeadDashboard"
import { ProjectShowcase } from "./pages/Inventory/project-showcase"
import Automation from "./pages/Tools/Automations/automation"
import Campaigns from "./pages/Tools/Automations/campaigns"
import CampaignBuilder from "./pages/Tools/Automations/campaignbuilder"
import LeadCapture from "./pages/Tools/Automations/leadcapture"
import LeadCaptureForm from "./pages/Tools/Automations/leadcaptureform"
import ThirdParty from "./pages/Tools/Third Party/thirdparty"
import ToolsHub from "./pages/Tools/tools-hub"
import ProfilePage from "./pages/Profile/profile-page"
import { ReportPage } from "./pages/Reports/Report-page"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleProtectedRoute from "./components/RoleProtectedRoute"
import CalendarView from "./pages/Calandar/calendar_view"
import { useAuth } from "./context/AuthContext"
import { ROLES } from "./constants/roles"


export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (Outside Sidebar) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<FogotPasswordPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard Routes (Inside Sidebar) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardContent />} />
          </Route>

          {/* Inventory Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/inventory_hub" element={<InventoryHub />} />
            <Route path="/inventory_listing" element={<InventoryListing />} />
            <Route path="/add_inventory" element={<AddInventory />} />
            <Route path="/project_showcase/:id" element={<ProjectShowcase />} />
            <Route path="/booking-form" element={<BookingFormPage />} />
          </Route>

          {/*Tools Routes*/}
          <Route element={<DashboardLayout />}>
            <Route path="/tools_hub" element={<ToolsHub />} />
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
            <Route path="/lead_hub" element={<LeadHub />} />
            <Route path="/lead-list" element={<LeadList />} />
            <Route path="/add-lead" element={<AddLead />} />
            <Route path="/lead-dashboard/:id" element={<LeadDashboard />} />
          </Route>

          {/*Setting Routes*/}
          <Route element={<DashboardLayout />}>
            <Route path="/general_settings" element={<GeneralSettings />} />
            {/* Admin only settings */}
            <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />}>
              <Route path="/manage_users" element={<ManageUsers />} />
              <Route path="/import_data" element={<ImportData />} />
            </Route>
          </Route>

          {/*Report  */}
          <Route element={<DashboardLayout />}>
            <Route path="/report_page" element={<ReportPage />} />
          </Route>
          {/*Calender  */}
          <Route element={<DashboardLayout />}>
            <Route path="/calendar_view" element={<CalendarView />} />
          </Route>
    
          {/* Profile & Duplicate Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  
  if (user?.role === ROLES.ADMIN) {
    return <Admin_dashboard />
  }
  return <DashboardPage />
}

export default App
