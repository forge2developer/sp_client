import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ChevronLeft, RefreshCcw, Image as ImageIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface ForgotPasswordFormProps extends React.ComponentProps<"form"> {
  onBack?: () => void
}

export function ForgotPasswordForm({
  className,
  onBack,
  ...props
}: ForgotPasswordFormProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<"otp-request" | "reset">("otp-request")
  const [otpSent, setOtpSent] = useState(false)
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault()
    setOtpSent(true)
  }

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("reset")
  }

  const handleBack = () => {
    if (step === "reset") {
      setStep("otp-request")
    } else if (otpSent) {
      setOtpSent(false)
    } else {
      navigate("/login")
    }
  }

  return (
    <form
      className={cn("animate-in fade-in slide-in-from-right-4 duration-300", className)}
      onSubmit={!otpSent ? handleSendOTP : step === "otp-request" ? handleVerifyOTP : undefined}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center mb-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {step === "otp-request" ? "Reset Password" : "Create New Password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "otp-request"
              ? "Enter your details below to reset your account"
              : `Enter new credentials for ${email}`}
          </p>
        </div>
        <div className="grid gap-4">
          <Button 
            type="button"
            variant="ghost" 
            onClick={handleBack}
            className="w-fit px-0 hover:bg-transparent hover:text-red-700 h-auto font-semibold animate-in fade-in slide-in-from-left-2 duration-300"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          {step === "otp-request" ? (
            <div className="grid gap-4">
              <Field>
                <FieldLabel htmlFor="reset-email" className="font-semibold ">Email</FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                  className={cn("h-11 rounded-md transition-all", otpSent && "bg-muted/50 opacity-80 cursor-not-allowed")}
                />
              </Field>

              {!otpSent ? (
                <Button type="submit" className="h-11 w-full bg-red-700 text-white hover:bg-red-800 animate-in fade-in zoom-in-95 duration-300">
                  Send OTP
                </Button>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 grid gap-4">
                  <Field className="items-center">
                    <div className="flex items-center justify-between w-full mb-1">
                      <FieldLabel className="font-semibold text-left">One-Time Password</FieldLabel>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 text-[11px] gap-1.5 px-3 rounded-full border-muted-foreground/20 hover:bg-muted"
                      >
                        <RefreshCcw className="h-3 w-3" />
                        Resend OTP
                      </Button>
                    </div>
                    <InputOTP maxLength={6}>
                      <InputOTPGroup className="w-full justify-between">
                        <InputOTPSlot index={0} className="size-11" />
                        <InputOTPSlot index={1} className="size-11" />
                        <InputOTPSlot index={2} className="size-11" />
                        <InputOTPSlot index={3} className="size-11" />
                        <InputOTPSlot index={4} className="size-11" />
                        <InputOTPSlot index={5} className="size-11" />
                      </InputOTPGroup>
                    </InputOTP>
                  </Field>
                  <Button type="submit" className="h-11 w-full bg-red-700 text-white hover:bg-red-800">
                    Verify & Reset
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid gap-4">
              <Field>
                <FieldLabel htmlFor="new_password" className="font-semibold">New Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter New Password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-11 rounded-md pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showNewPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm_password" className="font-semibold">Confirm Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-11 rounded-md pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </Field>
              <Button type="submit" className="h-11 w-full bg-red-700 text-white hover:bg-red-800">
                Change Password
              </Button>
            </div>
          )}
        </div>
      </FieldGroup>
    </form>
  )
}

export function FogotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0 border-none shadow-2xl">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-12">
                <ForgotPasswordForm />
              </div>
              <div className="relative hidden bg-muted/40 md:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Decorative radial lines */}
                    <div className="absolute h-64 w-64 rounded-full border border-dashed border-muted-foreground/10 animate-[spin_60s_linear_infinite]" />
                    <div className="absolute h-48 w-48 rounded-full border border-dashed border-muted-foreground/20 animate-[spin_40s_linear_infinite_reverse]" />
                    <div className="absolute h-32 w-32 rounded-full border border-muted-foreground/30" />

                    {/* Center Icon */}
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-lg border border-border">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
                    </div>

                    {/* Diagonal lines */}
                    {[0, 45, 90, 135].map((angle) => (
                      <div
                        key={angle}
                        className="absolute h-[200%] w-px bg-gradient-to-b from-transparent via-muted-foreground/10 to-transparent"
                        style={{ transform: `rotate(${angle}deg)` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


