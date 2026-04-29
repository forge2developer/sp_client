import { LoginForm } from "@/pages/Auth/login-form"
import { ForgotPasswordForm } from "@/pages/Auth/forgot-password-form"
import { GalleryVerticalEnd } from "lucide-react"
import { useLocation } from "react-router-dom"

export default function LoginPage() {
  const location = useLocation()
  const isForgotPassword = location.pathname === "/forgot_password"

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-600 text-white">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Sp Client
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs transition-all duration-300 ease-in-out">
            {isForgotPassword ? (
              <ForgotPasswordForm />
            ) : (
              <LoginForm />
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-linear-to-br from-red-950 via-red-800 to-white lg:block overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,_var(--color-amber-500/0.15)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,_var(--color-amber-900/0.1)_0%,_transparent_70%)]" />
      </div>
    </div>
  )
}
