import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to reset your password
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="reset-email">Email</FieldLabel>
          <Input
            id="reset-email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="new_password">New Password</FieldLabel>
          <Input
            id="new_password"
            type="password"
            placeholder="New Password"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm_password">Confirm Password</FieldLabel>
          <Input
            id="confirm_password"
            type="password"
            placeholder="Confirm New Password"
            required
          />
        </Field>
        <Field>
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </Field>
        <div className="text-center text-sm">
          <Link
            to="/login"
            className="underline underline-offset-4 hover:text-primary cursor-pointer"
          >
            Back to login
          </Link>
        </div>
      </FieldGroup>
    </form>
  )
}

