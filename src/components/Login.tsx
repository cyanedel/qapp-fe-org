import type { SubmitEvent } from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { getCurrentUser, loginUser } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"

const demoAccounts = [
  { label: "Creator 1", email: "creator-alice@potero.com", password: "SeedPass123!" },
  { label: "Creator 2", email: "creator-bob@potero.com", password: "SeedPass123!" },
  { label: "Creator 3", email: "creator-charlie@potero.com", password: "SeedPass123!" },
]

export const Login = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    setLoading(true)

    try {
      await loginUser(email, password)
      const user = await getCurrentUser()
      setUser(user)
      navigate("/home")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (account: (typeof demoAccounts)[number]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-transparent px-4 py-10 dark:bg-background">
      <Card className="grid w-full max-w-4xl overflow-hidden border-amber-900/15 bg-[#FFF4CC]/90 shadow-2xl shadow-amber-950/15 backdrop-blur-md ring-amber-900/5 dark:border-border/50 dark:bg-card/95 dark:shadow-black/40 dark:ring-foreground/10 lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-amber-900/5 p-10 dark:bg-muted lg:flex">
          <div>
            <img src="/potero_text.svg" alt="Potero" className="h-8 w-auto" />
            <h2 className="mt-16 text-4xl font-semibold leading-tight tracking-tight">Welcome to your workspace.</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-muted-foreground">Manage collections, coordinate your team, and keep your organization’s work in one place.</p>
          </div>
          <p className="text-sm text-muted-foreground">Potero for organizations</p>
        </section>

        <div className="min-w-0">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to your Potero creator account.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  className="pr-16"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>

          <CardFooter className="justify-center border-t border-amber-900/10 pt-4 text-center text-sm text-muted-foreground dark:border-border/40">
            <span>
              Need an organization account?{" "}
              <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                Register
              </Link>
            </span>
          </CardFooter>
        </form>
        </div>
      </Card>

      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-amber-900/15 bg-[#FFF4CC]/95 p-2 shadow-lg shadow-amber-950/10 backdrop-blur-md dark:border-border dark:bg-card/95">
        {demoAccounts.map((account) => (
          <Button
            key={account.email}
            type="button"
            variant="outline"
            size="sm"
            className="px-3"
            onClick={() => handleQuickFill(account)}
          >
            {account.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
