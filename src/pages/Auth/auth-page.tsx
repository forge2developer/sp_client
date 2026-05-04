import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Image } from "lucide-react"
import { Link } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="overflow-hidden p-0 border-none shadow-lg">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-12">
                <form className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center mb-4">
                      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                      <p className="text-sm text-muted-foreground">
                        Login to SP Promoters
                      </p>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="email" className="font-semibold">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter Email"
                        required
                        className="h-11 rounded-md"
                      />
                    </Field>
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password" className="font-semibold">Password</FieldLabel>
                        <Link
                          to="/forgot-password"
                          className="ml-auto text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Password"
                          required
                          className="h-11 rounded-md pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </Field>
                    <Field>
                      <Button type="submit" className="h-11 w-full bg-red-700 text-white hover:bg-red-800">
                        Login
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
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
                      <Image className="h-8 w-8 text-muted-foreground/60" />
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
