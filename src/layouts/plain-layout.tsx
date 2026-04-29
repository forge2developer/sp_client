import { Outlet } from "react-router-dom"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm md:max-w-3xl">
        <Outlet />
      </div>
    </div>
  )
}
