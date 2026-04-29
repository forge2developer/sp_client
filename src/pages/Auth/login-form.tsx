import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-bold">Welcome back</h1>
        <p className="text-balance text-sm text-muted-foreground">
          SP Promoter
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              to="/forgot_password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div> */}
        <div className="grid grid-cols-3 gap-4">
          {/* <Button variant="outline" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Login with Apple</span>
          </Button>
          <Button variant="outline" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.288 1.288-3.312 2.696-6.848 2.696-5.464 0-9.912-4.448-9.912-9.912s4.448-9.912 9.912-9.912c2.976 0 5.392 1.152 7.128 2.872l2.304-2.304C18.424 1.544 15.6 0 12.48 0 5.864 0 0 5.864 0 12.48s5.864 12.48 12.48 12.48c3.6 0 6.32-1.2 8.44-3.4 2.2-2.2 2.896-5.272 2.896-7.752 0-.6-.048-1.12-.136-1.632H12.48z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Login with Google</span>
          </Button>
          <Button variant="outline" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M18.847 9.15c-1.393 0-2.607.722-3.493 1.826a11.144 11.144 0 0 0-1.272 1.823 11.238 11.238 0 0 0-1.272-1.823 4.417 4.417 0 0 0-3.493-1.826c-2.31 0-4.415 2.105-4.415 4.415s2.105 4.415 4.415 4.415c1.393 0 2.607-.722 3.493-1.826a11.144 11.144 0 0 0 1.272-1.823c.365.59.802 1.173 1.272 1.823.886 1.104 2.1 1.826 3.493 1.826 2.31 0 4.415-2.105 4.415-4.415s-2.105-4.415-4.415-4.415zm-10.432 7.02c-1.438 0-2.605-1.167-2.605-2.605s1.167-2.605 2.605-2.605c.875 0 1.636.433 2.083 1.092a9.144 9.144 0 0 0-.918 1.513 9.13 9.13 0 0 0-.918 1.513c-.247.3-.615.492-1.01.492zm10.432 0c-.395 0-.763-.192-1.01-.492a9.13 9.13 0 0 0-.918-1.513 9.144 9.144 0 0 0-.918-1.513c.447-.659 1.208-1.092 2.083-1.092 1.438 0 2.605 1.167 2.605 2.605s-1.167 2.605-2.605 2.605z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Login with Meta</span>
          </Button> */}
        </div>
        {/* <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="" className="underline underline-offset-4">
            Sign up
          </Link>
        </div> */}
      </div>
    </form>
  )
}



