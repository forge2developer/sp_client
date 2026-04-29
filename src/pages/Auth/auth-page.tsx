import { LoginForm } from "@/pages/Auth/login-form"
import { ForgotPasswordForm } from "@/pages/Auth/forgot-password-form"
import { useLocation } from "react-router-dom"

export default function LoginPage() {
  const location = useLocation()
  const isForgotPassword = location.pathname === "/forgot_password"

  return (
    <div className="grid min-h-svh lg:grid-cols-2 overflow-hidden">
      <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          {isForgotPassword ? (
            <ForgotPasswordForm />
          ) : (
            <LoginForm />
          )}
          {/* <div className="mt-8 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </div> */}
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/red_auth_bg.png"
          alt="Abstract Background"
          className="absolute inset-0 h-full w-full object-cover scale-x-[-1.40]"
        />
        {/* Subtle overlay to soften the transition if needed */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent pointer-events-none" />
      </div>

    </div>
  )
}


