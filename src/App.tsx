import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "./layouts/plain-layout"
import DashboardLayout from "./layouts/sidebar-layout"
import LoginPage from "./pages/auth-page"
import DashboardPage from "./pages/dashboard-page"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (Outside Sidebar) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Dashboard Routes (Inside Sidebar) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
